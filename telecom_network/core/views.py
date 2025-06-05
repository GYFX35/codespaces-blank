from django.shortcuts import render
from django.contrib.auth.models import User
from .models import Profile, Connection, Post, Conversation, ChatMessage, Game # Add Game model
from .serializers import (
    RegisterSerializer, UserSerializer, ProfileSerializer,
    PublicUserSerializer, ConnectionSerializer, SendConnectionRequestSerializer,
    ConnectionActionSerializer, ListConnectionsSerializer, PostSerializer,
    GameSerializer # Add GameSerializer
)
from rest_framework import generics, permissions # Ensure permissions is imported
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status as http_status
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend # For filtering

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

# Connection views (condensed for brevity, assuming they are correct from previous steps)
class SendConnectionRequestView(generics.CreateAPIView): # Shortened for example
    serializer_class = SendConnectionRequestSerializer; permission_classes = [permissions.IsAuthenticated]
    def create(self, r, *a, **kw): # r=request, a=args, kw=kwargs
        s = self.get_serializer(data=r.data); s.is_valid(raise_exception=True); to_id = s.validated_data['to_user_id']
        if r.user.id == to_id: return Response({"e": "Self-request."}, status=400)
        to_u = get_object_or_404(User, id=to_id)
        ex_c = Connection.objects.filter(from_user=r.user, to_user=to_u).first()
        if ex_c:
            if ex_c.status=='pending': return Response({"m":"Sent, pending."}, status=400)
            if ex_c.status=='accepted': return Response({"m":"Connected."}, status=400)
            if ex_c.status in ['declined','cancelled']: ex_c.status='pending'; ex_c.save(); return Response(ConnectionSerializer(ex_c).data, status=200)
        rev_c = Connection.objects.filter(from_user=to_u, to_user=r.user).first()
        if rev_c:
            if rev_c.status=='pending': return Response({"m":f"{to_u.username} sent you req."}, status=400)
            if rev_c.status=='accepted': return Response({"m":"Connected (rev)."}, status=400)
        c = Connection.objects.create(from_user=r.user, to_user=to_u, status='pending'); return Response(ConnectionSerializer(c).data, status=201)

class PendingConnectionListView(generics.ListAPIView):
    serializer_class = ConnectionSerializer; permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self): return Connection.objects.filter(to_user=self.request.user, status='pending')

class SentPendingConnectionListView(generics.ListAPIView):
    serializer_class = ConnectionSerializer; permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self): return Connection.objects.filter(from_user=self.request.user, status='pending')

class ConnectionActionView(generics.GenericAPIView):
    queryset = Connection.objects.all(); serializer_class = ConnectionActionSerializer; permission_classes = [permissions.IsAuthenticated]; lookup_url_kwarg = 'connection_id'
    def post(self, r, *a, **kw): # r=request
        c = self.get_object(); s_in = self.get_serializer(data=r.data); s_in.is_valid(raise_exception=True); act = s_in.validated_data['action']
        if act=='accept' and c.to_user==r.user and c.status=='pending': c.status='accepted'
        elif act=='decline' and c.to_user==r.user and c.status=='pending': c.status='declined'
        elif act=='cancel' and c.from_user==r.user and c.status=='pending': c.status='cancelled'
        else: return Response({"e":f"Cannot {act}"}, status=400)
        c.save(); return Response(ConnectionSerializer(c, context={'request':r}).data, status=200)

class AcceptedConnectionListView(generics.ListAPIView):
    serializer_class = ListConnectionsSerializer; permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self): u=self.request.user; return Connection.objects.filter(Q(from_user=u)|Q(to_user=u),status='accepted').select_related('f_user','t_user').order_by('-updated_at').select_related('from_user', 'to_user') # Added select_related
    def get_serializer_context(self): ctx=super().get_serializer_context(); ctx['request']=self.request; return ctx

# Post views
class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.all().select_related('user')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    def perform_create(self, serializer): serializer.save(user=self.request.user)

# Game views
class GameListView(generics.ListAPIView):
    queryset = Game.objects.all() # Default ordering from model Meta will be used (-created_at)
    serializer_class = GameSerializer
    permission_classes = [permissions.AllowAny] # Games list is public
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category', 'is_featured'] # Fields to filter on

class GameDetailView(generics.RetrieveAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [permissions.AllowAny] # Game details also public
    # lookup_field = 'pk' # This is the default
