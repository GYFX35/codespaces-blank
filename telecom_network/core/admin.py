from django.contrib import admin
from .models import Profile, Connection, Post, Conversation, ChatMessage, Game # Add Game and other models

# Register Profile model if not already registered
if not admin.site.is_registered(Profile):
    @admin.register(Profile)
    class ProfileAdmin(admin.ModelAdmin):
        list_display = ('user', 'bio_summary')
        search_fields = ('user__username', 'bio')
        def bio_summary(self, obj):
            return obj.bio[:50] + '...' if len(obj.bio) > 50 else obj.bio

# Register Connection model if not already registered
if not admin.site.is_registered(Connection):
    @admin.register(Connection)
    class ConnectionAdmin(admin.ModelAdmin):
        list_display = ('from_user', 'to_user', 'status', 'created_at', 'updated_at')
        list_filter = ('status',)
        search_fields = ('from_user__username', 'to_user__username')
        readonly_fields = ('created_at', 'updated_at')

# Register Post model if not already registered
if not admin.site.is_registered(Post):
    @admin.register(Post)
    class PostAdmin(admin.ModelAdmin):
        list_display = ('user', 'content_summary', 'created_at')
        list_filter = ('created_at',)
        search_fields = ('user__username', 'content')
        readonly_fields = ('created_at', 'updated_at')
        def content_summary(self, obj):
            return obj.content[:75] + '...' if len(obj.content) > 75 else obj.content

# Register Conversation model if not already registered
if not admin.site.is_registered(Conversation):
    @admin.register(Conversation)
    class ConversationAdmin(admin.ModelAdmin):
        list_display = ('id', 'get_participants_display', 'created_at', 'updated_at')
        search_fields = ('participants__username',)
        readonly_fields = ('created_at', 'updated_at')
        def get_participants_display(self, obj):
            return ", ".join([p.username for p in obj.participants.all()[:3]]) # Display first 3 participants
        get_participants_display.short_description = 'Participants (Sample)'


# Register ChatMessage model if not already registered
if not admin.site.is_registered(ChatMessage):
    @admin.register(ChatMessage)
    class ChatMessageAdmin(admin.ModelAdmin):
        list_display = ('conversation_id_display', 'sender', 'content_summary', 'timestamp', 'read_at')
        list_filter = ('timestamp', 'sender')
        search_fields = ('sender__username', 'content', 'conversation__id')
        readonly_fields = ('timestamp',)
        def content_summary(self, obj):
            return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
        def conversation_id_display(self,obj):
            return obj.conversation.id
        conversation_id_display.short_description = 'Conversation ID'


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'is_featured', 'created_at', 'updated_at')
    list_filter = ('category', 'is_featured')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {'fields': ('name', 'description', 'category', 'game_url', 'thumbnail_url', 'is_featured')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
