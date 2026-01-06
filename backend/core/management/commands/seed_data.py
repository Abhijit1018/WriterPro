from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from core.models import User, Task
from decimal import Decimal
import requests

class Command(BaseCommand):
    help = 'Seeds database with initial users and tasks'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding data...")

        # Create Users
        trainee, _ = User.objects.get_or_create(phone_number='9990000000', defaults={'role': User.Role.TRAINEE})
        if _:
            trainee.set_unusable_password()
            trainee.save()
            self.stdout.write(f"Created Trainee User: {trainee.phone_number}")

        writer, _ = User.objects.get_or_create(phone_number='8880000000', defaults={'role': User.Role.WRITER, 'wallet_balance': 50.00})
        if _:
            writer.set_unusable_password()
            writer.save()
            self.stdout.write(f"Created Writer User: {writer.phone_number} (Balance: $50)")

        # Download Placeholder Image
        img_url = "https://dummyimage.com/600x800/eee/333.png&text=Sample+Task"
        try:
            response = requests.get(img_url, timeout=10)
            if response.status_code == 200:
                image_content = ContentFile(response.content)
            else:
                self.stdout.write("Failed to download image, using empty file.")
                image_content = ContentFile(b"") # Should probably better fail
        except Exception as e:
            self.stdout.write(f"Error downloading image: {e}")
            image_content = ContentFile(b"")

        # Create Tasks
        # 1. Assessment Tasks
        for i in range(3):
            task = Task.objects.create(
                type=Task.Type.ASSESSMENT,
                time_limit=20,
                deposit_amount=0,
                reward_amount=0
            )
            task.image_url.save(f"assessment_{i}.png", image_content, save=True)
            self.stdout.write(f"Created Assessment Task {task.id}")

        # 2. Paid Tasks
        for i in range(3):
            task = Task.objects.create(
                type=Task.Type.PAID,
                time_limit=45,
                deposit_amount=5.00,
                reward_amount=12.50
            )
            task.image_url.save(f"paid_{i}.png", image_content, save=True)
            self.stdout.write(f"Created Paid Task {task.id}")

        self.stdout.write("Seeding complete!")
