from django.shortcuts import render
from django.contrib.auth.models import User
from .models import Profile, Connection, Post, Conversation, ChatMessage, Game, AffiliateItem, OwnerBankingDetails
from .serializers import (
    RegisterSerializer, UserSerializer, ProfileSerializer,
    PublicUserSerializer, ConnectionSerializer, SendConnectionRequestSerializer,
    ConnectionActionSerializer, ListConnectionsSerializer, PostSerializer,
    GameSerializer, AffiliateItemSerializer, OwnerBankingDetailsSerializer
)
from rest_framework import generics, permissions, filters, status
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend

# Original index view
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
            return Response({"error": "You cannot send a connection request to yourself."}, status=status.HTTP_400_BAD_REQUEST)
        to_user = get_object_or_404(User, id=to_user_id)
        # Check direct existing connection
        existing_connection = Connection.objects.filter(from_user=request.user, to_user=to_user).first()
        if existing_connection:
            if existing_connection.status == 'pending':
                return Response({"message": "Connection request already sent and is pending."}, status=status.HTTP_400_BAD_REQUEST)
            if existing_connection.status == 'accepted':
                return Response({"message": "You are already connected with this user."}, status=status.HTTP_400_BAD_REQUEST)
            if existing_connection.status in ['declined', 'cancelled']: # Allow resending
                existing_connection.status = 'pending'
                existing_connection.save()
                return Response(ConnectionSerializer(existing_connection).data, status=status.HTTP_200_OK)
        # Check reverse existing connection
        reverse_existing_connection = Connection.objects.filter(from_user=to_user, to_user=request.user).first()
        if reverse_existing_connection:
            if reverse_existing_connection.status == 'pending':
                return Response({"message": f"{to_user.username} has already sent you a connection request. Please check your incoming requests."}, status=status.HTTP_400_BAD_REQUEST)
            if reverse_existing_connection.status == 'accepted':
                return Response({"message": "You are already connected with this user (connection initiated by them)."}, status=status.HTTP_400_BAD_REQUEST)
        # If no blocking connection, create new one
        connection = Connection.objects.create(from_user=request.user, to_user=to_user, status='pending')
        return Response(ConnectionSerializer(connection).data, status=status.HTTP_201_CREATED)

class PendingConnectionListView(generics.ListAPIView):
    serializer_class = ConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Connection.objects.filter(to_user=self.request.user, status='pending')

class SentPendingConnectionListView(generics.ListAPIView):
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
            return Response({"error": f"Cannot perform action '{action}' on this connection under current conditions."}, status=status.HTTP_400_BAD_REQUEST)
        connection.save()
        return Response(ConnectionSerializer(connection, context={'request': request}).data, status=status.HTTP_200_OK)

class AcceptedConnectionListView(generics.ListAPIView):
    serializer_class = ListConnectionsSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        return Connection.objects.filter(Q(from_user=user) | Q(to_user=user), status='accepted').select_related('from_user', 'to_user').order_by('-updated_at')
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

# Post views
class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.all().select_related('user')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Game views
class GameListView(generics.ListAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_featured']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name', 'display_priority']

class GameDetailView(generics.RetrieveAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [permissions.AllowAny]

# AffiliateItemListView
class AffiliateItemListView(generics.ListAPIView):
    queryset = AffiliateItem.objects.filter(is_active=True)
    serializer_class = AffiliateItemSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name', 'display_priority']

# ActiveBankingDetailsView
class ActiveBankingDetailsView(generics.GenericAPIView):
    serializer_class = OwnerBankingDetailsSerializer
    permission_classes = [permissions.AllowAny]
    def get(self, request, *args, **kwargs):
        instance = None
        try:
            instance = OwnerBankingDetails.objects.get(is_active=True)
        except OwnerBankingDetails.DoesNotExist:
            return Response({}, status=status.HTTP_200_OK)
        except OwnerBankingDetails.MultipleObjectsReturned:
            print("CRITICAL: Multiple active banking details found! Check database integrity. Returning the latest one.")
            instance = OwnerBankingDetails.objects.filter(is_active=True).order_by('-updated_at').first()
        if instance is None:
             return Response({}, status=status.HTTP_200_OK)
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)
