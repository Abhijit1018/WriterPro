from django.contrib import admin
from .models import User, Task, Submission, Transaction

admin.site.register(User)
admin.site.register(Task)
admin.site.register(Submission)
admin.site.register(Transaction)
