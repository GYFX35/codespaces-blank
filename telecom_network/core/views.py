from django.shortcuts import render
from django.contrib.auth.models import User
from .models import Profile, Connection, Post # Add Post model
from .serializers import (
    RegisterSerializer, UserSerializer, ProfileSerializer,
    PublicUserSerializer, ConnectionSerializer, SendConnectionRequestSerializer,
    ConnectionActionSerializer, ListConnectionsSerializer, PostSerializer # Add PostSerializer
)
from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status as http_status
from django.db.models import Q

# Original index view (if still needed)
def index(request):
    return render(request, "index.html")

# Auth views
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

# Profile views
class ProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    def get_object(self):
        return self.request.user

# User listing
class UserListView(generics.ListAPIView):
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return User.objects.all().exclude(id=self.request.user.id).order_by('username')

# Connection views
class SendConnectionRequestView(generics.CreateAPIView):
    serializer_class = SendConnectionRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        to_user_id = serializer.validated_data['to_user_id']
        if request.user.id == to_user_id:
            return Response({"error": "You cannot send a connection request to yourself."}, status=http_status.HTTP_400_BAD_REQUEST)
        to_user = get_object_or_404(User, id=to_user_id)
        existing_connection = Connection.objects.filter(from_user=request.user, to_user=to_user).first()
        if existing_connection:
            if existing_connection.status == 'pending': return Response({"message": "Connection request already sent and is pending."}, status=http_status.HTTP_400_BAD_REQUEST)
            if existing_connection.status == 'accepted': return Response({"message": "You are already connected with this user."}, status=http_status.HTTP_400_BAD_REQUEST)
            if existing_connection.status in ['declined', 'cancelled']: # Allow resending
                existing_connection.status = 'pending'; existing_connection.save()
                return Response(ConnectionSerializer(existing_connection).data, status=http_status.HTTP_200_OK)
        reverse_existing_connection = Connection.objects.filter(from_user=to_user, to_user=request.user).first()
        if reverse_existing_connection:
            if reverse_existing_connection.status == 'pending': return Response({"message": f"{to_user.username} has already sent you a connection request."}, status=http_status.HTTP_400_BAD_REQUEST)
            if reverse_existing_connection.status == 'accepted': return Response({"message": "You are already connected with this user."}, status=http_status.HTTP_400_BAD_REQUEST)
        connection = Connection.objects.create(from_user=request.user, to_user=to_user, status='pending')
        return Response(ConnectionSerializer(connection).data, status=http_status.HTTP_201_CREATED)

class PendingConnectionListView(generics.ListAPIView): # Incoming
    serializer_class = ConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Connection.objects.filter(to_user=self.request.user, status='pending')

class SentPendingConnectionListView(generics.ListAPIView): # Outgoing
    serializer_class = ConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Connection.objects.filter(from_user=self.request.user, status='pending')

class ConnectionActionView(generics.GenericAPIView):
    queryset = Connection.objects.all()
    serializer_class = ConnectionActionSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_url_kwarg = 'connection_id'
    def post(self, request, *args, **kwargs):
        connection = self.get_object()
        input_serializer = self.get_serializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        action = input_serializer.validated_data['action']
        if action == 'accept' and connection.to_user == request.user and connection.status == 'pending':
            connection.status = 'accepted'
        elif action == 'decline' and connection.to_user == request.user and connection.status == 'pending':
            connection.status = 'declined'
        elif action == 'cancel' and connection.from_user == request.user and connection.status == 'pending':
            connection.status = 'cancelled'
        else:
            return Response({"error": f"Cannot {action} this request. Conditions not met."}, status=http_status.HTTP_400_BAD_REQUEST)
        connection.save()
        return Response(ConnectionSerializer(connection, context={'request': request}).data, status=http_status.HTTP_200_OK)

class AcceptedConnectionListView(generics.ListAPIView):
    serializer_class = ListConnectionsSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        return Connection.objects.filter(Q(from_user=user) | Q(to_user=user), status='accepted').select_related('from_user', 'to_user').order_by('-updated_at')
    def get_serializer_context(self):
        context = super().get_serializer_context(); context['request'] = self.request
        return context

# Post views
class PostListCreateView(generics.ListCreateAPIView):
    # queryset is all posts from everyone, select_related for user optimization
    queryset = Post.objects.all().select_related('user')
    # Default ordering is by '-created_at' from model Meta options
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Assign the logged-in user to the post during creation
        serializer.save(user=self.request.user)

    # Optional: If you want the list view to only show posts from connected users or self:
    # def get_queryset(self):
    #     user = self.request.user
    #     # Get IDs of users connected to the current user
    #     connected_user_ids = Connection.objects.filter(
    #         (Q(from_user=user) | Q(to_user=user)),
    #         status='accepted'
    #     ).values_list('from_user_id', 'to_user_id')
    #
    #     # Flatten the list of tuples and remove duplicates, add current user's ID
    #     ids_to_show = set([item for sublist in connected_user_ids for item in sublist])
    #     ids_to_show.add(user.id)
    #
    #     return Post.objects.filter(user_id__in=ids_to_show).select_related('user').order_by('-created_at')
