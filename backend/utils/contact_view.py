"""
Contact form endpoint
=====================
POST /api/v1/contact/
Body: { "name": "...", "email": "...", "subject": "...", "message": "..." }

Does two things:
  1. Forwards the message to ADMIN_EMAIL (to email business inbox)
  2. Sends an auto-reply to the person who submitted the form
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.core.mail import EmailMultiAlternatives
from django.conf import settings


def _wrap_html(body: str) -> str:
    """Wrap body in a branded email shell."""
    return f"""<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#F7F3ED;margin:0;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;
              overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#0D0D12;padding:28px;text-align:center;">
      <div style="width:44px;height:44px;border-radius:50%;
                  background:linear-gradient(135deg,#C9920A,#E0A80D);
                  margin:0 auto 10px auto;
                  text-align:center;line-height:44px;">
        <span style="color:#0D0D12;font-weight:700;font-size:20px;vertical-align:middle;">E</span>
      </div>
      <h1 style="color:#ffffff;font-size:20px;margin:0;font-weight:600;">
        Ethiopia Tour &amp; Travel
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      {body}
    </div>

    <!-- Footer -->
    <div style="background:#F7F3ED;padding:20px 32px;text-align:center;
                border-top:1px solid #E8E0D0;">
      <p style="color:#8A8A8A;font-size:12px;margin:0;">
        📍 Bole Road, Addis Ababa, Ethiopia
      </p>
      <p style="color:#8A8A8A;font-size:12px;margin:4px 0;">
        📞 +251 945 340 5558 &nbsp;|&nbsp; ✉️ info@ethiopiatour.com
      </p>
      <p style="color:#ABABAB;font-size:11px;margin:10px 0 0;">
        © 2026 Ethiopia Tour &amp; Travel. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>"""


class ContactFormView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        name    = request.data.get("name",    "").strip()
        email   = request.data.get("email",   "").strip()
        subject = request.data.get("subject", "").strip()
        message = request.data.get("message", "").strip()

        # Validate all fields present
        if not all([name, email, subject, message]):
            return Response(
                {"error": "All fields (name, email, subject, message) are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        admin_email  = getattr(settings, "ADMIN_EMAIL", settings.DEFAULT_FROM_EMAIL)
        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")

        # Safely convert line breaks for HTML before passing to f-strings
        html_message = message.replace("\n", "<br>")

        # ── 1. Forward to admin inbox ─────────────────────────────────────
        admin_plain = (
            f"New contact form submission\n\n"
            f"From:    {name}\n"
            f"Email:   {email}\n"
            f"Subject: {subject}\n\n"
            f"Message:\n{message}\n\n"
            f"Reply directly to this email to respond to the customer."
        )

        admin_html_body = f"""
          <h2 style="color:#0D0D0D;font-size:20px;margin:0 0 16px;">
            New Contact Form Submission
          </h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #F0EAE0;
                         color:#8A8A8A;width:30%;">From</td>
              <td style="padding:10px 0;border-bottom:1px solid #F0EAE0;
                         color:#0D0D0D;font-weight:600;">{name}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #F0EAE0;
                         color:#8A8A8A;">Email</td>
              <td style="padding:10px 0;border-bottom:1px solid #F0EAE0;
                         color:#0D0D0D;font-weight:600;">{email}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #F0EAE0;
                         color:#8A8A8A;">Subject</td>
              <td style="padding:10px 0;border-bottom:1px solid #F0EAE0;
                         color:#0D0D0D;font-weight:600;">{subject}</td>
            </tr>
          </table>

          <div style="background:#F7F3ED;border-left:4px solid #C9920A;
                      border-radius:8px;padding:16px 20px;margin:20px 0;">
            <p style="color:#8A8A8A;font-size:11px;text-transform:uppercase;
                      letter-spacing:0.1em;margin:0 0 8px;">Message</p>
            <p style="color:#4A4A4A;font-size:14px;line-height:1.7;margin:0;">
              {html_message}
            </p>
          </div>

          <p style="color:#6B6B6B;font-size:13px;margin:0;">
            💡 Reply directly to this email to respond to <strong>{name}</strong>.
          </p>
        """

        try:
            admin_msg = EmailMultiAlternatives(
                subject=f"[Contact] {subject} — from {name}",
                body=admin_plain,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[admin_email],
                reply_to=[f"{name} <{email}>"],
            )
            admin_msg.attach_alternative(_wrap_html(admin_html_body), "text/html")
            admin_msg.send(fail_silently=False)
        except Exception as exc:
            return Response(
                {"error": f"Failed to send your message. Please try emailing us directly at {admin_email}. Error: {str(exc)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # ── 2. Auto-reply to the sender ────────────────────────────────────
        auto_plain = (
            f"Dear {name},\n\n"
            f"Thank you for contacting Ethiopia Tour & Travel!\n\n"
            f"We have received your message about \"{subject}\" and our team will "
            f"get back to you within 24 hours.\n\n"
            f"YOUR MESSAGE:\n"
            f"{'─' * 40}\n"
            f"{message}\n"
            f"{'─' * 40}\n\n"
            f"While you wait, explore our tours:\n"
            f"{frontend_url}/packages\n\n"
            f"Best regards,\n"
            f"Ethiopia Tour & Travel Team\n"
            f"📍 Bole Road, Addis Ababa, Ethiopia\n"
            f"📞 +251 945 340 558"
        )

        auto_html_body = f"""
          <h2 style="color:#0D0D0D;font-size:22px;margin:0 0 12px;">
            Thank you, {name}! ✉️
          </h2>
          <p style="color:#4A4A4A;font-size:15px;line-height:1.7;margin:0 0 20px;">
            We have received your message and our team will get back to you
            within <strong>24 hours</strong>.
          </p>

          <!-- Copy of their message -->
          <div style="background:#F7F3ED;border-left:4px solid #C9920A;
                      border-radius:8px;padding:18px 20px;margin:0 0 24px;">
            <p style="color:#8A8A8A;font-size:11px;text-transform:uppercase;
                      letter-spacing:0.1em;margin:0 0 6px;">Your Message</p>
            <p style="color:#0D0D0D;font-size:13px;font-weight:600;margin:0 0 6px;">
              Subject: {subject}
            </p>
            <p style="color:#4A4A4A;font-size:14px;line-height:1.7;margin:0;">
              {html_message}
            </p>
          </div>

          <p style="color:#4A4A4A;font-size:14px;line-height:1.7;margin:0 0 24px;">
            While you wait, explore our handcrafted Ethiopia tour packages:
          </p>

          <!-- CTA button -->
          <div style="text-align:center;margin:0 0 24px;">
            <a href="{frontend_url}/packages"
               style="display:inline-block;
                      background:linear-gradient(135deg,#C9920A,#E0A80D);
                      color:#0D0D12;text-decoration:none;
                      padding:14px 36px;border-radius:9999px;
                      font-weight:700;font-size:14px;">
              Browse Tour Packages
            </a>
          </div>

          <p style="color:#8A8A8A;font-size:13px;line-height:1.7;margin:0;">
            If you have any urgent questions, you can also reach us at:<br>
            📞 <strong>+251 945 340 558</strong> &nbsp;|&nbsp;
            ✉️ <strong>info@ethiopiatour.com</strong>
          </p>
        """

        try:
            auto_msg = EmailMultiAlternatives(
                subject="We received your message — Ethiopia Tour & Travel",
                body=auto_plain,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[email],
            )
            auto_msg.attach_alternative(_wrap_html(auto_html_body), "text/html")
            auto_msg.send(fail_silently=True)   # don't fail if auto-reply bounces
        except Exception:
            pass  # Auto-reply failure never blocks the success response

        return Response({
            "message": (
                f"Thank you {name}! Your message has been sent. "
                f"We've also sent a confirmation to {email}. "
                f"Our team will reply within 24 hours."
            )
        })