from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Role(models.TextChoices):
        TRAINEE = 'TRAINEE', 'Trainee'
        WRITER = 'WRITER', 'Writer'
        ADMIN = 'ADMIN', 'Admin'

    phone_number = models.CharField(max_length=15, unique=True)
    display_name = models.CharField(max_length=100, blank=True, default="")
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.TRAINEE)
    wallet_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_verified = models.BooleanField(default=False)

    # Use phone_number as the username field
    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['username'] # username is actually phone_number via USERNAME_FIELD, but django requires username to be in fields if not used? Wait. default User has username. I should probably override username or just not use it.
    # Actually, best practice for AbstractUser with custom login is to just let username be auto or set it to phone. 
    # Or inherit AbstractBaseUser.
    # For simplicity, I'll inherit AbstractUser and set username=phone_number manually or just ignore username field and use phone_number for login via a custom backend or just DRF view.
    # But User.USERNAME_FIELD = 'phone_number' is standard.
    # However, AbstractUser requires a unique 'username'. I'll make username=phone_number on save or just allow it.
    # Let's keep it simple: username is not required if I override? No, AbstractUser fields are fixed.
    # I will stick to: USERNAME_FIELD = 'phone_number'. I need to make sure 'username' is not required or is auto-filled.
    # Actually, better to just make username nullable or remove it? AbstractUser makes it hard.
    # Easiest way: USERNAME_FIELD = 'phone_number'. REQUIRED_FIELDS = ['username']? No, REQUIRED_FIELDS must contain all required fields on createsuperuser EXCLUDING USERNAME_FIELD.
    # So REQUIRED_FIELDS = ['username'] is wrong if USERNAME_FIELD is phone_number.
    
    # Let's try to keep 'username' field but use phone_number for auth. 
    
    REQUIRED_FIELDS = ['username', 'email'] # Prompt didn't mention email.

    def save(self, *args, **kwargs):
      # Copy phone to username to satisfy AbstractUser constraint if not provided
      if not self.username:
          self.username = self.phone_number
      super().save(*args, **kwargs)

class Task(models.Model):
    class Type(models.TextChoices):
        ASSESSMENT = 'ASSESSMENT', 'Assessment'
        PAID = 'PAID', 'Paid'

    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        LOCKED = 'LOCKED', 'Locked' # Locked by a user working on it
        COMPLETED = 'COMPLETED', 'Completed'

    type = models.CharField(max_length=20, choices=Type.choices, default=Type.ASSESSMENT)
    image_url = models.ImageField(upload_to='tasks/')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    reward_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    time_limit = models.IntegerField(help_text="Time limit in minutes", default=30)
    
    # Helper to track who locked it? Prompt says "mark task as LOCKED for this user".
    # So we probably need a relation or just check Submission/Transaction?
    # Simple way: assigned_to = ForeignKey(User, null=True, blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')


class Submission(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    typed_content = models.TextField()
    google_doc_link = models.URLField(blank=True, null=True)
    ocr_match_score = models.FloatField(default=0.0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

class Transaction(models.Model):
    class Type(models.TextChoices):
        DEPOSIT = 'DEPOSIT', 'Deposit'
        REFUND = 'REFUND', 'Refund'
        PAYOUT = 'PAYOUT', 'Payout'

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=20, choices=Type.choices)
    timestamp = models.DateTimeField(auto_now_add=True)
