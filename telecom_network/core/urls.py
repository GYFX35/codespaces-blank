from django.urls import path
from .views import (
    RegisterView, ProfileDetailView,
    UserListView, SendConnectionRequestView, PendingConnectionListView, SentPendingConnectionListView,
    ConnectionActionView, AcceptedConnectionListView,
    PostListCreateView,
    GameListView, GameDetailView,
    AffiliateItemListView # Add AffiliateItemListView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Profile
    path('profile/me/', ProfileDetailView.as_view(), name='user_profile_me'),

    # Users
    path('users/', UserListView.as_view(), name='user_list'),

    # Connections
    path('connections/send_request/', SendConnectionRequestView.as_view(), name='send_connection_request'),
    path('connections/pending/incoming/', PendingConnectionListView.as_view(), name='pending_incoming_connections'),
    path('connections/pending/outgoing/', SentPendingConnectionListView.as_view(), name='pending_outgoing_connections'),
    path('connections/<int:connection_id>/action/', ConnectionActionView.as_view(), name='connection_action'),
    path('connections/accepted/', AcceptedConnectionListView.as_view(), name='accepted_connections'),

    # Posts
    path('posts/', PostListCreateView.as_view(), name='post_list_create'),

    # Games
    path('games/', GameListView.as_view(), name='game-list'),
    path('games/<int:pk>/', GameDetailView.as_view(), name='game-detail'),

    # Affiliate Items
    path('affiliate-items/', AffiliateItemListView.as_view(), name='affiliateitem-list'),
]
