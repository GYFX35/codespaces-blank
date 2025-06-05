import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
# AuthMiddlewareStack is important for accessing user in consumers
# If you use JWT, you might need a custom middleware here for WebSocket authentication.
# For now, AuthMiddlewareStack works with Django sessions.
# We will need a custom middleware or token-in-URL-param approach for JWT over WebSockets.
# Let's proceed with AuthMiddlewareStack and address JWT for WebSockets when implementing consumers.

import core.routing # Will be created in the core app

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'telecom_network.settings')

# Get the default HTTP application first.
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app, # Use the Django app for HTTP requests
    "websocket": AuthMiddlewareStack( # Use AuthMiddlewareStack for WebSockets
        URLRouter(
            core.routing.websocket_urlpatterns # Points to your app's WebSocket routing
        )
    ),
})
