import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'writeearn_backend.settings')
django.setup()

from core.models import User

try:
    if not User.objects.filter(phone_number='admin').exists():
        user = User.objects.create_superuser(
            phone_number='admin',
            username='admin',
            email='admin@example.com',
            password='admin'
        )
        user.role = User.Role.ADMIN
        user.save()
        print("Superuser 'admin' created successfully.")
    else:
        print("Superuser 'admin' already exists.")
except Exception as e:
    print(f"Error creating superuser: {e}")
