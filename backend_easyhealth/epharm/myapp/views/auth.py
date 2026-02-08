from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.core.cache import cache
from datetime import timedelta
import json
import logging
import secrets

from ..serializers import RegisterSerializer, CustomTokenObtainPairSerializer
from ..models import CustomUser, PasswordResetToken

logger = logging.getLogger(__name__)

# Rate limiting for password reset (max 3 attempts per email per hour)
MAX_RESET_ATTEMPTS = 3
RESET_TIMEOUT = 3600  # 1 hour in seconds


# Register new user
class RegisterAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate RefreshToken for the new user
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        return Response({
            "user": {
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "city": user.city,
                "country": user.country,
                "phone": user.phone
            },
            "refresh": str(refresh),
            "access": str(access_token),
        }, status=status.HTTP_201_CREATED)


# Custom Login API View to handle login and token generation
class CustomLoginAPIView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        logger.debug("Request Body:", request.data)
        return super().post(request, *args, **kwargs)


# Check if an email is already in use
@csrf_exempt
def check_email(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body)
            email = body.get('email', None)

            if email is None:
                return JsonResponse({'error': 'Email is required.'}, status=400)

            if CustomUser.objects.filter(email=email).exists():
                return JsonResponse({'error': 'Email is already in use.'}, status=409)

            return JsonResponse({'message': 'Email is available.'}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format.'}, status=400)

    return JsonResponse({'error': 'Invalid request method.'}, status=405)


# Forgot Password - Send reset email with rate limiting
@csrf_exempt
def forgot_password(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body)
            email = body.get('email', None)

            if not email:
                return JsonResponse({'error': 'Email is required.'}, status=400)

            # Rate limiting: Check if email has exceeded max attempts
            cache_key = f"password_reset_attempts_{email}"
            attempts = cache.get(cache_key, 0)
            
            if attempts >= MAX_RESET_ATTEMPTS:
                logger.warning(f"Rate limit exceeded for password reset: {email}")
                return JsonResponse({
                    'error': 'Too many attempts. Please try again after 1 hour.'
                }, status=429)

            # Use filter().first() to handle potential duplicate emails gracefully
            users = CustomUser.objects.filter(email=email)
            user = users.first()
            
            if not user:
                # Increment attempt counter even if user doesn't exist (prevent email enumeration)
                cache.set(cache_key, attempts + 1, RESET_TIMEOUT)
                # Return generic message (security best practice)
                return JsonResponse({
                    'message': 'If an account with this email exists, a password reset link has been sent.'
                }, status=200)
            
            # Log warning if multiple users found with same email (data integrity issue)
            if users.count() > 1:
                logger.warning(f"Multiple users found with email {email}: {users.count()} users. Using first user (ID: {user.id}).")

            # Check for existing valid tokens (prevent multiple active tokens)
            existing_tokens = PasswordResetToken.objects.filter(
                user=user,
                is_used=False,
                expires_at__gt=timezone.now()
            )
            
            if existing_tokens.exists():
                # If there's already a valid token, don't create a new one
                # But still increment the rate limit counter
                cache.set(cache_key, attempts + 1, RESET_TIMEOUT)
                return JsonResponse({
                    'message': 'If an account with this email exists, a password reset link has been sent.'
                }, status=200)

            # Generate secure token
            token = secrets.token_urlsafe(32)
            
            # Create password reset token
            expires_at = timezone.now() + timedelta(hours=1)
            PasswordResetToken.objects.create(
                user=user,
                token=token,
                expires_at=expires_at
            )

            # Build reset URL
            reset_url = f"http://localhost:5173/reset-password/{token}"

            # Send email
            try:
                logger.info(f"Attempting to send email to: {email}")
                logger.info(f"Using EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
                logger.info(f"Using DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
                
                send_mail(
                    subject='MEDINEST - Password Reset Request',
                    message=f'''Hello {user.first_name or user.username},

You requested a password reset for your MEDINEST account.

Click the link below to reset your password:
{reset_url}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
MEDINEST Team''',
                    from_email=settings.DEFAULT_FROM_EMAIL or settings.EMAIL_HOST_USER,
                    recipient_list=[email],
                    fail_silently=False,
                )
                
                # Increment attempt counter only after successful send
                cache.set(cache_key, attempts + 1, RESET_TIMEOUT)
                logger.info(f"✅ Password reset email SENT SUCCESSFULLY to: {email}")
                
            except Exception as e:
                logger.error(f"❌ FAILED to send password reset email: {str(e)}")
                logger.error(f"Exception type: {type(e).__name__}")
                import traceback
                logger.error(f"Traceback: {traceback.format_exc()}")
                # Don't increment counter on failure - allow retry
                return JsonResponse({
                    'error': f'Failed to send email: {str(e)}'
                }, status=500)

            return JsonResponse({
                'message': 'If an account with this email exists, a password reset link has been sent.'
            }, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format.'}, status=400)
        except Exception as e:
            logger.error(f"Forgot password error: {str(e)}")
            return JsonResponse({'error': 'An error occurred. Please try again.'}, status=500)

    return JsonResponse({'error': 'Invalid request method.'}, status=405)


# Verify Reset Token
@csrf_exempt
def verify_reset_token(request, token):
    if request.method == "GET":
        try:
            reset_token = PasswordResetToken.objects.get(token=token)
            
            if not reset_token.is_valid():
                return JsonResponse({
                    'valid': False,
                    'error': 'Token has expired or has already been used.'
                }, status=400)

            return JsonResponse({
                'valid': True,
                'email': reset_token.user.email
            }, status=200)

        except PasswordResetToken.DoesNotExist:
            return JsonResponse({
                'valid': False,
                'error': 'Invalid token.'
            }, status=400)

    return JsonResponse({'error': 'Invalid request method.'}, status=405)


# Reset Password
@csrf_exempt
def reset_password(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body)
            token = body.get('token', None)
            new_password = body.get('new_password', None)

            if not token or not new_password:
                return JsonResponse({
                    'error': 'Token and new password are required.'
                }, status=400)

            # Validate password strength
            if len(new_password) < 8:
                return JsonResponse({
                    'error': 'Password must be at least 8 characters long.'
                }, status=400)

            try:
                reset_token = PasswordResetToken.objects.get(token=token)
            except PasswordResetToken.DoesNotExist:
                return JsonResponse({
                    'error': 'Invalid or expired token.'
                }, status=400)

            if not reset_token.is_valid():
                return JsonResponse({
                    'error': 'Token has expired or has already been used.'
                }, status=400)

            # Update user password
            user = reset_token.user
            user.set_password(new_password)
            user.save()

            # Mark token as used
            reset_token.is_used = True
            reset_token.save()

            return JsonResponse({
                'message': 'Password has been reset successfully. Please login with your new password.'
            }, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format.'}, status=400)
        except Exception as e:
            logger.error(f"Reset password error: {str(e)}")
            return JsonResponse({'error': 'An error occurred. Please try again.'}, status=500)

    return JsonResponse({'error': 'Invalid request method.'}, status=405)
