from rest_framework import viewsets, status, views, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from .models import User, Task, Submission, Transaction
from .serializers import UserSerializer, TaskSerializer, SubmissionSerializer, TransactionSerializer
from decimal import Decimal
import random

class IsAdminOrSuperuser(permissions.BasePermission):
    """Allow access only to platform admins (role or staff)."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (getattr(user, "role", None) == User.Role.ADMIN or user.is_staff or user.is_superuser)
        )

# --- Auth Views ---
class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = request.data.get('phone_number')
        otp = request.data.get('otp')

        if not phone or not otp:
            return Response({'error': 'Phone and OTP required'}, status=status.HTTP_400_BAD_REQUEST)

        # Mock OTP Verification
        if otp != '1234':
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        # Get or Create User
        user, created = User.objects.get_or_create(phone_number=phone)
        if created:
            user.set_unusable_password()
            user.save()

        # Generate Token
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })


class MeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        display_name = request.data.get('display_name', '').strip()
        if display_name is not None:
            request.user.display_name = display_name
            request.user.save()
        return Response(UserSerializer(request.user).data)

# --- Task ViewSet ---
class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filtering logic if needed, but for now return all so UI can show disabled ones
        return Task.objects.all()

    def get_permissions(self):
        # Creation and updates are limited to admins; viewing requires auth.
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrSuperuser()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['post'])
    def lock(self, request, pk=None):
        task = self.get_object()
        user = request.user

        if task.status != Task.Status.OPEN:
            return Response({'error': 'Task is not open'}, status=status.HTTP_400_BAD_REQUEST)

        # Logic based on Role
        if user.role == User.Role.TRAINEE:
            if task.type == Task.Type.PAID:
                return Response({'error': 'Trainees cannot access Paid tasks'}, status=status.HTTP_403_FORBIDDEN)
            # Assessment task: Just lock it
            task.status = Task.Status.LOCKED
            task.assigned_to = user
            task.save()
            return Response({'status': 'locked', 'task': TaskSerializer(task, context={'request': request}).data})

        elif user.role == User.Role.WRITER:
            # Check Balance
            if user.wallet_balance < task.deposit_amount:
                return Response({'error': 'Insufficient funds for deposit'}, status=status.HTTP_402_PAYMENT_REQUIRED)
            
            # Deduct Deposit
            user.wallet_balance -= task.deposit_amount
            user.save()
            
            # Create Transaction
            Transaction.objects.create(
                user=user,
                amount=task.deposit_amount,
                type=Transaction.Type.DEPOSIT
            )
            
            task.status = Task.Status.LOCKED
            task.assigned_to = user
            task.save()
            return Response({'status': 'locked', 'task': TaskSerializer(task, context={'request': request}).data})

        return Response({'error': 'Invalid Role'}, status=status.HTTP_400_BAD_REQUEST)

# --- Submission ViewSet ---
class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Admins can see everything; writers/trainees only see their own submissions.
        qs = Submission.objects.all().select_related('task', 'user')
        if getattr(self.request.user, "role", None) != User.Role.ADMIN and not self.request.user.is_staff:
            qs = qs.filter(user=self.request.user)
        return qs

    def create(self, request, *args, **kwargs):
        task_id = request.data.get('task')
        content = request.data.get('typed_content')
        
        task = get_object_or_404(Task, pk=task_id)
        
        # Verify user owns the lock?
        if task.assigned_to != request.user:
             return Response({'error': 'Task not assigned to you'}, status=status.HTTP_403_FORBIDDEN)

        # Mock OCR / Similarity Check
        # Simple length check for demo
        expected_len = 100 # Arbitrary
        actual_len = len(content)
        match_score = min(1.0, actual_len / expected_len) if expected_len > 0 else 1.0
        # Randomize a bit
        match_score = round(random.uniform(0.8, 1.0), 2)

        # Mock Google Docs API
        doc_link = f"https://docs.google.com/document/d/mock-doc-id-{random.randint(1000,9999)}"

        submission = Submission.objects.create(
            user=request.user,
            task=task,
            typed_content=content,
            google_doc_link=doc_link,
            ocr_match_score=match_score,
            status=Submission.Status.PENDING
        )

        # Auto-Approve logic for demo
        limit = 0.8
        if match_score >= limit:
            submission.status = Submission.Status.APPROVED
            submission.save()
            
            task.status = Task.Status.COMPLETED
            task.save()
            
            # Payout Logic
            transaction = None
            if task.type == Task.Type.PAID:
                refund = task.deposit_amount
                reward = task.reward_amount
                total = refund + reward
                
                request.user.wallet_balance += total
                request.user.save()
                
                transaction = Transaction.objects.create(
                    user=request.user,
                    amount=total,
                    type=Transaction.Type.PAYOUT
                )
            else:
                # Trainee Promotion Logic
                if request.user.role == User.Role.TRAINEE:
                    # Count approved assessments
                    completed_assessments = Submission.objects.filter(
                        user=request.user, 
                        task__type=Task.Type.ASSESSMENT, 
                        status=Submission.Status.APPROVED
                    ).count()
                    
                    # Threshold to promote (e.g. 2)
                    if completed_assessments >= 2:
                        request.user.role = User.Role.WRITER
                        # Give a welcome bonus? Optional. Let's give $5.
                        request.user.wallet_balance += Decimal('5.00')
                        request.user.save()
                        
                        # Log bonus transaction
                        Transaction.objects.create(
                            user=request.user, 
                            amount=Decimal('5.00'), 
                            type=Transaction.Type.DEPOSIT 
                        )
        
        else:
            submission.status = Submission.Status.REJECTED
            submission.save()
            task.status = Task.Status.OPEN
            task.assigned_to = None
            task.save()

        # refresh user to get latest state for serializer context if needed, or explicitly return
        request.user.refresh_from_db()
        
        return Response({
            'submission': SubmissionSerializer(submission, context={'request': request}).data,
            'user': UserSerializer(request.user).data, # Return updated user to update frontend state immediately
            'promoted': request.user.role == User.Role.WRITER and request.user.wallet_balance > 0 # Simple flag
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrSuperuser])
    def moderate(self, request, pk=None):
        """Allow admins to approve or reject submissions manually."""
        submission = self.get_object()
        target_status = request.data.get('status')

        if target_status not in [Submission.Status.APPROVED, Submission.Status.REJECTED]:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        if submission.status == target_status:
            return Response({'detail': f'Submission already {target_status.lower()}.'})

        task = submission.task
        user = submission.user

        if target_status == Submission.Status.APPROVED:
            submission.status = Submission.Status.APPROVED
            submission.save()

            task.status = Task.Status.COMPLETED
            task.save()

            if task.type == Task.Type.PAID:
                total = task.deposit_amount + task.reward_amount
                user.wallet_balance += total
                user.save()
                Transaction.objects.create(user=user, amount=total, type=Transaction.Type.PAYOUT)
            else:
                if user.role == User.Role.TRAINEE:
                    completed_assessments = Submission.objects.filter(
                        user=user,
                        task__type=Task.Type.ASSESSMENT,
                        status=Submission.Status.APPROVED
                    ).count()
                    if completed_assessments >= 2:
                        user.role = User.Role.WRITER
                        user.wallet_balance += Decimal('5.00')
                        user.save()
                        Transaction.objects.create(user=user, amount=Decimal('5.00'), type=Transaction.Type.DEPOSIT)
            user.refresh_from_db()
            payload = {'submission': SubmissionSerializer(submission).data, 'user': UserSerializer(user).data}
            return Response(payload)

        # target_status == REJECTED
        submission.status = Submission.Status.REJECTED
        submission.save()
        task.status = Task.Status.OPEN
        task.assigned_to = None
        task.save()
        return Response({'submission': SubmissionSerializer(submission).data})

# --- Transaction ViewSet ---
class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Admins can see all transactions; others only see their own.
        if getattr(self.request.user, "role", None) == User.Role.ADMIN or self.request.user.is_staff:
            return Transaction.objects.all().order_by('-timestamp')
        return Transaction.objects.filter(user=self.request.user).order_by('-timestamp')


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-id')
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrSuperuser]
    http_method_names = ['get', 'patch', 'head', 'options']
