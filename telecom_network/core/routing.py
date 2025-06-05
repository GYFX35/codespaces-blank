from django.urls import re_path
# from . import consumers # Consumers will be added in a later subtask

websocket_urlpatterns = [
    # Example path, will be properly defined when consumers are made:
    # re_path(r'ws/chat/(?P<conversation_id>\w+)/$', consumers.ChatConsumer.as_asgi()),
    # re_path(r'ws/notifications/$', consumers.NotificationConsumer.as_asgi()),
]
