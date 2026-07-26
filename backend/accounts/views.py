from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import AnonRateThrottle
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, PasswordResetToken
from .serializers import UserRegistrationSerializer, UserProfileSerializer, ChangePasswordSerializer
from utils.email import send_password_reset_email
from .models import NewsletterSubscriber
from utils.email import send_newsletter_welcome_email 
from rest_framework.parsers import JSONParser
from django.core.signing import Signer, BadSignature
from .models import NewsletterSubscriber

class AuthBurstThrottle(AnonRateThrottle):
    """Limits unauthenticated requests on high-risk pipelines to mitigate flooding."""
    scope = 'auth_burst'

class RegisterView(generics.CreateAPIView):
    """POST /api/v1/auth/register/ — Create new tourist account."""
    queryset           = User.objects.all()
    serializer_class   = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"message": "Account created. Please verify your email.",
             "user": UserProfileSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )

class UserProfileView(generics.RetrieveUpdateAPIView):
    """GET/PUT /api/v1/auth/profile/ — Current user profile."""
    serializer_class   = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class ChangePasswordView(APIView):
    """POST /api/v1/auth/change-password/ — Update password."""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        s = ChangePasswordSerializer(data=request.data, context={"request": request})
        s.is_valid(raise_exception=True)
        request.user.set_password(s.validated_data["new_password"])
        request.user.save()
        return Response({"message": "Password updated."}, status=status.HTTP_200_OK)

class ForgotPasswordView(APIView):
    """
    POST /api/v1/auth/forgot-password/
    Body: { "email": "user@example.com" }
    Sends a reset link to the user's inbox if found with active rate-limiting protection.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthBurstThrottle]  # Applies the 5 requests per minute limit

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        if not email:
            return Response(
                {"error": "Email address is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user = User.objects.get(email=email, is_active=True)
            PasswordResetToken.objects.filter(user=user, used=False).delete()
            token_obj = PasswordResetToken.objects.create(user=user)
            send_password_reset_email(user, str(token_obj.token))
        except User.DoesNotExist:
            pass  # Silent — don't reveal if email exists
            
        return Response({
            "message": "If an account with that email exists, a password reset link has been sent."
        })

class ResetPasswordView(APIView):
    """
    POST /api/v1/auth/reset-password/
    Body: { "token": "uuid-token", "new_password": "newpass123" }
    Validates token (not expired, not used), sets new password.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthBurstThrottle]

    def post(self, request):
        token_str    = request.data.get("token", "").strip()
        new_password = request.data.get("new_password", "").strip()

        if not token_str or not new_password:
            return Response(
                {"error": "Both token and new_password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token_obj = PasswordResetToken.objects.select_related("user").get(
                token=token_str, used=False
            )
        except (PasswordResetToken.DoesNotExist, ValueError):
            return Response(
                {"error": "Invalid or expired reset link. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if token_obj.is_expired():
            token_obj.delete()
            return Response(
                {"error": "This reset link has expired (1 hour). Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = token_obj.user
        try:
            validate_password(new_password, user=user)
        except ValidationError as e:
            return Response({"error": list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        token_obj.used = True
        token_obj.save()
        token_obj.delete()

        return Response({"message": "Password reset successfully. You can now log in."})

class ValidateResetTokenView(APIView):
    """
    GET /api/v1/auth/reset-password/{token}/
    Used by the frontend to pre-validate token before showing the form.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        try:
            token_obj = PasswordResetToken.objects.get(token=token, used=False)
            if token_obj.is_expired():
                token_obj.delete()
                return Response({"valid": False, "error": "Link has expired."})
            return Response({"valid": True, "email": token_obj.user.email})
        except (PasswordResetToken.DoesNotExist, ValueError):
            return Response({"valid": False, "error": "Invalid reset link."})
    



class NewsletterSubscribeView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthBurstThrottle]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        if not email:
            return Response(
                {"error": "Please provide a valid email address."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        subscriber, created = NewsletterSubscriber.objects.get_or_create(email=email)
        
        if not created:
            return Response(
                {"message": "You are already subscribed to our journey updates!"}, 
                status=status.HTTP_200_OK
            )
        
        # ⚡ TRIGGER OUTBOUND MAIL DISPATCH HERE ⚡
        try:
            send_newsletter_welcome_email(email)
        except Exception as e:
            # We catch exceptions locally so that even if the mail server delays, 
            # the user's browser entry is still logged as successful.
            print(f"SMTP Outbound Delivery Failure Node: {str(e)}")
            
        return Response(
            {"message": "Thank you for subscribing! An entry confirmation and news, anouncements has been dispatched to your inbox."}, 
            status=status.HTTP_201_CREATED
        )


class NewsletterUnsubscribeView(APIView):
    """POST /api/v1/auth/newsletter/unsubscribe/ — Securely processes dynamic token offloading."""
    permission_classes = [permissions.AllowAny] # Unauthenticated access required

    def post(self, request):
        token = request.data.get("token", "").strip()
        if not token:
            return Response(
                {"error": "Security tracking verification token missing."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # 🔐 Validate that the token was generated by our server and has not been altered
            signer = Signer()
            verified_email = signer.unsign(token)
        except BadSignature:
            return Response(
                {"error": "The unsubscription link is invalid or tampered with."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Remove subscriber from database records
        deleted_count, _ = NewsletterSubscriber.objects.filter(email=verified_email).delete()

        if deleted_count == 0:
            return Response(
                {"message": "This email address is not active on our subscriber roster."},
                status=status.HTTP_200_OK
            )

        return Response(
            {"message": "You have been successfully removed from our mailing updates."},
            status=status.HTTP_200_OK
        )