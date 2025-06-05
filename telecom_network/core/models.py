from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError # Added for OwnerBankingDetails model

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

class Game(models.Model):
    CATEGORY_CHOICES = [
        ('HTML5', 'HTML5 Game'),
        ('ESPORTS', 'eSports Info/Link'),
        ('INSTANT', 'Instant Game'),
    ]
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, default='HTML5')
    game_url = models.URLField(max_length=1024, help_text="Link to play/embed the game, or for eSports info page.")
    thumbnail_url = models.URLField(max_length=1024, blank=True, null=True, help_text="Link to a thumbnail image for the game.")
    is_featured = models.BooleanField(default=False, help_text="Feature this game on special sections like homepage.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

class OwnerBankingDetails(models.Model):
    bank_name = models.CharField(max_length=255, help_text="e.g., Equity Bank")
    account_holder_name = models.CharField(max_length=255, help_text="e.g., John Doe")
    account_number = models.CharField(max_length=100, help_text="e.g., 0123456789012")
    swift_bic = models.CharField(max_length=20, blank=True, null=True, help_text="SWIFT/BIC code, e.g., EQBLKENAXXX")
    iban = models.CharField(max_length=50, blank=True, null=True, help_text="IBAN, if applicable")
    branch_info = models.CharField(max_length=255, blank=True, null=True, help_text="e.g., Main Branch, Nairobi")
    payment_instructions = models.TextField(blank=True, help_text="e.g., 'Please use your GlobalMeetup username or email as the payment reference.'")
    is_active = models.BooleanField(default=False, help_text="Enable this to make these details visible on the site. Only one set of details can be active at any time.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True) # Corrected typo here

    class Meta:
        verbose_name = "Owner Banking Detail"
        verbose_name_plural = "Owner Banking Details"
        ordering = ['-updated_at'] # Show most recently updated first in admin if multiple exist

    def __str__(self):
        status = 'Active' if self.is_active else 'Inactive'
        return f"{self.bank_name} - {self.account_holder_name} ({status})"

    def save(self, *args, **kwargs):
        if self.is_active:
            # Set all other records to is_active=False
            OwnerBankingDetails.objects.filter(is_active=True).exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)

    def clean(self):
        # This validation is primarily for the Django Admin. The save() method is the ultimate enforcer.
        if self.is_active:
            queryset = OwnerBankingDetails.objects.filter(is_active=True)
            if self.pk: # if this is an existing instance, exclude it from the count
                queryset = queryset.exclude(pk=self.pk)
            if queryset.exists():
                raise ValidationError('Another set of banking details is already active. Please deactivate it first or uncheck "is_active" for this entry.')

class AffiliateItem(models.Model):
    CATEGORY_CHOICES = [
        ('SOFTWARE', 'Software'),
        ('HARDWARE', 'Hardware'),
        ('SERVICES', 'Services'),
        ('TRAINING', 'Training & Courses'),
        ('BOOKS', 'Books'),
        ('OTHER', 'Other'),
    ]

    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(help_text="Brief description of the item or offer.")
    affiliate_url = models.URLField(max_length=2048, help_text="The actual affiliate tracking link.")
    image_url = models.URLField(max_length=2048, blank=True, null=True, help_text="URL of a promotional image.")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='OTHER', db_index=True)
    is_active = models.BooleanField(default=True, help_text="Only active items will be displayed to users.", db_index=True)
    display_priority = models.IntegerField(default=0, help_text="Higher numbers display first. Used for ordering.", db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-display_priority', '-created_at']

    def __str__(self):
        return self.name
