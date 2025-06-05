from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Connection, Post, Conversation, ChatMessage, Game # Add Game

# Basic user representation, used in other serializers
class BasicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name')

# Profile serializer (bio only for now)
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['bio']

# Registration serializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm password", style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'email': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        if not attrs.get('email'):
            raise serializers.ValidationError({"email": "Email is required."})
        if not attrs.get('username'):
            raise serializers.ValidationError({"username": "Username is required."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        # Profile is created by a signal (post_save on User)
        return user

# User serializer including nested profile (for profile view/update)
class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'profile')

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        profile, created = Profile.objects.get_or_create(user=instance)

        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.save()

        profile.bio = profile_data.get('bio', profile.bio)
        profile.save()
        return instance

# Public user serializer (for listing users)
class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name')

# Connection serializer (for listing pending/sent requests)
class ConnectionSerializer(serializers.ModelSerializer):
    from_user = BasicUserSerializer(read_only=True)
    to_user = BasicUserSerializer(read_only=True)

    class Meta:
        model = Connection
        fields = ('id', 'from_user', 'to_user', 'status', 'created_at', 'updated_at')

# Serializer for sending a connection request (input only)
class SendConnectionRequestSerializer(serializers.Serializer):
    to_user_id = serializers.IntegerField()

    def validate_to_user_id(self, value):
        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError("User does not exist.")
        # Add validation: cannot send to self (though view also checks this)
        # request = self.context.get("request")
        # if request and request.user.id == value:
        #     raise serializers.ValidationError("You cannot send a connection request to yourself.")
        return value

# Serializer for connection actions (input only)
class ConnectionActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=[("accept", "Accept"), ("decline", "Decline"), ("cancel", "Cancel")])

# Serializer for listing accepted connections
class ListConnectionsSerializer(serializers.ModelSerializer):
    connected_user = serializers.SerializerMethodField()
    connection_id = serializers.IntegerField(source='id') # Use 'id' of the Connection object
    status = serializers.CharField(read_only=True)
    established_at = serializers.DateTimeField(source='updated_at', read_only=True) # 'updated_at' of when status became 'accepted'

    class Meta:
        model = Connection
        fields = ('connection_id', 'connected_user', 'status', 'established_at')

    def get_connected_user(self, obj):
        request = self.context.get('request')
        if not request or not hasattr(request, 'user'):
            return None

        if obj.from_user == request.user:
            return BasicUserSerializer(obj.to_user, context=self.context).data
        elif obj.to_user == request.user:
            return BasicUserSerializer(obj.from_user, context=self.context).data
        return None

# Post serializer (for creating and listing posts)
class PostSerializer(serializers.ModelSerializer):
    user = BasicUserSerializer(read_only=True)
    # 'content' is writable by default (no need to list in fields if all are included, but explicit is fine)

    class Meta:
        model = Post
        fields = ('id', 'user', 'content', 'created_at', 'updated_at')
        # 'user' is set in the view during creation, so it's effectively read-only from client perspective at create.
        # 'content' is the primary writable field by the client.
        read_only_fields = ('id', 'created_at', 'updated_at', 'user') # user is added here as it's set by perform_create

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = BasicUserSerializer(read_only=True)
    # conversation field is an ID, usually handled by view/URL, not directly in create payload here.

    class Meta:
        model = ChatMessage
        fields = ('id', 'conversation', 'sender', 'content', 'timestamp', 'read_at')
        # For creation via DRF endpoint (not WebSocket consumer directly):
        # 'content' is main input. 'conversation' from URL. 'sender' from request.user.
        read_only_fields = ('id', 'sender', 'timestamp', 'read_at', 'conversation')
        # Making 'conversation' read-only here as it's typically set via URL in DRF views for messages.

class ConversationSerializer(serializers.ModelSerializer):
    participants = BasicUserSerializer(many=True, read_only=True)
    # last_message = ChatMessageSerializer(read_only=True) # Example: for future enhancement
    # unread_count = serializers.IntegerField(read_only=True) # Example: for future enhancement

    class Meta:
        model = Conversation
        fields = ('id', 'participants', 'created_at', 'updated_at') # Add 'last_message', 'unread_count' later

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ('id', 'name', 'description', 'category', 'game_url', 'thumbnail_url', 'is_featured', 'created_at', 'updated_at')
