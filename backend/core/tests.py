from django.test import TestCase
from .models import User, Task, Submission

class ModelTests(TestCase):
    def test_create_user(self):
        user = User.objects.create(phone_number='1234567890', role=User.Role.TRAINEE)
        self.assertEqual(user.phone_number, '1234567890')
        self.assertEqual(user.wallet_balance, 0.00)

    def test_create_task(self):
        task = Task.objects.create(type=Task.Type.PAID, deposit_amount=10.00, reward_amount=5.00)
        self.assertEqual(task.status, Task.Status.OPEN)
    
    def test_submission_flow(self):
        user = User.objects.create(phone_number='9999999999', role=User.Role.WRITER)
        task = Task.objects.create(type=Task.Type.ASSESSMENT)
        submission = Submission.objects.create(user=user, task=task, typed_content="test")
        self.assertEqual(submission.status, Submission.Status.PENDING)
