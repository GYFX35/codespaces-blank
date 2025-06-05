from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    # Add other profile fields here later, e.g., profile_picture_url

    def __str__(self):
        return f"{self.user.username}'s Profile"

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    # Ensure the profile is saved, especially if it's an update to an existing user
    # where the profile might already exist but needs to be associated if it wasn't.
    # This also handles cases where the user might have been created without a profile
    # due to some other process, though the `if created:` block should cover most cases.
    try:
        instance.profile.save()
    except Profile.DoesNotExist:
        # This case should ideally not be reached if the signal is correctly creating profiles
        # for new users. However, as a fallback:
        Profile.objects.create(user=instance)
        # instance.profile.save() # The object is saved by create() itself.

class Connection(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('cancelled', 'Cancelled'), # User who sent request can cancel
    ]
    from_user = models.ForeignKey(User, related_name='sent_connections', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='received_connections', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('from_user', 'to_user')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.from_user.username} -> {self.to_user.username} ({self.get_status_display()})"

class Post(models.Model):
    user = models.ForeignKey(User, related_name='posts', on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Post by {self.user.username} at {self.created_at.strftime('%Y-%m-%d %H:%M')}"

class Conversation(models.Model):
    participants = models.ManyToManyField(User, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at'] # Show most recent conversations first

    def __str__(self):
        participant_names = ", ".join([p.username for p in self.participants.all()])
        # Limit length of participant names string for admin display if too long
        if len(participant_names) > 50:
            participant_names = participant_names[:47] + "..."
        return f"Conversation {self.id} ({participant_names})"

class ChatMessage(models.Model):
    conversation = models.ForeignKey(Conversation, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='sent_chat_messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True) # For read receipts

    class Meta:
        ordering = ['timestamp'] # Messages in a conversation ordered oldest to newest

    def __str__(self):
        return f"Msg by {self.sender.username} in Conv {self.conversation.id} at {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
