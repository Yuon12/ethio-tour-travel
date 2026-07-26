"""
Email utilities for Ethiopia Tour & Travel.
Covers:  
  - Booking confirmation (rich HTML) → customer + admin  
  - Password reset link → customer
"""
from django.core.mail import EmailMultiAlternatives, send_mail
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.core.signing import Signer, BadSignature 

# ── SHARED STRUCTURES ─────────────────────────────────────────────────────────

def _email_header(title: str, subtitle: str = "") -> str:
    # Bulletproof HTML table layout to force the logo text "E" directly in the center
    return f"""
    <div style="background:#0D0D12;padding:32px;text-align:center;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto;text-align:center;">
        <tr>
          <td align="center" valign="middle" width="48" height="48" style="background:linear-gradient(135deg,#C9920A,#E0A80D);border-radius:50%;text-align:center;color:#0D0D12;font-weight:700;font-size:22px;font-family:Arial,sans-serif;line-height:48px;">
            E
          </td>
        </tr>
      </table>
      <h1 style="color:#ffffff;font-size:24px;margin:14px 0 0;font-weight:600;font-family:Georgia,serif;letter-spacing:0.5px;">Ethiopia Tour &amp; Travel</h1>
      {"" if not subtitle else f'<p style="color:#C9920A;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;margin:8px 0 0;font-family:Arial,sans-serif;font-weight:600;">' + subtitle + '</p>'}
    </div>
    <div style="padding:36px 32px;">
      <h2 style="color:#0D0D0D;font-family:Georgia,serif;font-size:24px;margin:0 0 18px;font-weight:600;">{title}</h2>
    """

def _email_footer() -> str:
    return """
    </div>
    <div style="background:#F7F3ED;padding:28px 32px;text-align:center;border-top:1px solid #E8E0D0;font-family:Arial,sans-serif;">
      <p style="color:#8A8A8A;font-size:12px;margin:0;">📍 Bole Road, Addis Ababa, Ethiopia</p>
      <p style="color:#8A8A8A;font-size:12px;margin:6px 0;">📞 +251 945 340 558  &nbsp;|&nbsp; ✉️ info@ethiopiatour.com</p>
      <p style="color:#ABABAB;font-size:11px;margin:14px 0 0;">© 2026 Ethiopia Tour &amp; Travel. All rights reserved.</p>
    </div>
    """

def _wrap(body_html: str) -> str:
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:'DM Sans',Arial,sans-serif;background:#F7F3ED;margin:0;padding:20px;-webkit-font-smoothing:antialiased;">  <div style="max-width:600px;margin:20px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 28px rgba(0,0,0,0.06);border:1px solid #E8E0D0;">    {body_html}  </div></body></html>"""

def _row(label: str, value: str) -> str:
    # Swapped display:flex to a standard layout table to prevent mobile rendering collapses
    return f"""
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-bottom:1px solid #F0EAE0;margin-bottom:2px;">
      <tr>
        <td style="padding:11px 0;color:#8A8A8A;font-size:13px;font-family:Arial,sans-serif;">{label}</td>
        <td align="right" style="padding:11px 0;color:#0D0D0D;font-size:13px;font-weight:600;font-family:Arial,sans-serif;">{value}</td>
      </tr>
    </table>"""

def _btn(text: str, url: str) -> str:
    return f"""
    <div style="text-align:center;margin:32px 0 16px;">
      <a href="{url}" style="display:inline-block;background:linear-gradient(135deg,#C9920A,#E0A80D);color:#0D0D12;text-decoration:none;padding:14px 40px;border-radius:9999px;font-weight:700;font-size:14px;font-family:Arial,sans-serif;letter-spacing:0.3px;box-shadow:0 4px 12px rgba(201,146,10,0.2);">{text}</a>
    </div>"""


# ── 1. BOOKING CONFIRMATION ───────────────────────────────────────────────────

def send_booking_confirmation(booking):
    """
    Sends a pristine, structured HTML booking confirmation receipt to the customer.
    """
    from decimal import Decimal
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    rate = Decimal(str(getattr(settings, "USD_TO_ETB_RATE", "135.00")))
    etb_total = (booking.total_price_usd * rate).quantize(Decimal("0.01"))

    # Fetch status directly from the success record
    payment = booking.payments.filter(status="success").order_by("-paid_at").first()
    method_display = {
        "stripe": "Stripe (Card)",
        "chapa":  "Chapa (Telebirr / CBE / Card)",
    }.get(payment.method if payment else "", "Online Payment")

    subject = f"✅ Booking Confirmed — {booking.tour_package.title} | Ethiopia Tour & Travel"

    # Plain Text Fallback
    plain = f"""Hello {booking.contact_name},

Great news! Your booking is CONFIRMED.

BOOKING DETAILS
Reference:    {booking.reference}
Tour:         {booking.tour_package.title}
Start Date:   {booking.start_date}
End Date:     {booking.end_date}
Guests:       {booking.total_guests} ({booking.num_adults} adult(s))

PAYMENT RECEIPT
Amount Paid:  ${booking.total_price_usd} USD (≈ ETB {etb_total})
Method:       {method_display}
Status:       PAID ✓

View your booking details directly here: {frontend_url}/bookings/{booking.reference}

Thank you for exploring with Ethiopia Tour & Travel!
""".strip()

    # Smart Interactive HTML Layout
    html_body = _email_header("Booking Confirmed! 🎉", "Payment Receipt & Trip Details")
    html_body += f"""
    <p style="color:#4A4A4A;line-height:1.7;margin:0 0 24px;font-size:15px;">
      Dear <strong>{booking.contact_name}</strong>, your payment was successfully processed. Your custom itinerary parameters are safely secured below.
    </p>

    <!-- Reference badge table structure -->
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background:#F7F3ED;border-radius:12px;margin-bottom:28px;border:1px solid #E8E0D0;text-align:center;">
      <tr>
        <td style="padding:18px 20px;text-align:center;">
          <p style="color:#8A8A8A;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 6px;font-family:Arial,sans-serif;font-weight:600;">Booking Reference</p>
          <p style="color:#0D0D0D;font-size:24px;font-weight:700;font-family:monospace;letter-spacing:0.1em;margin:0;">{booking.reference}</p>
        </td>
      </tr>
    </table>

    <!-- Tour details -->
    <div style="margin-bottom:28px;">
      <p style="color:#C9920A;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;font-family:Arial,sans-serif;">📍 Tour Details</p>
      {_row("Tour Package",  booking.tour_package.title)}
      {_row("Start Date",    str(booking.start_date))}
      {_row("End Date",      str(booking.end_date))}
      {_row("Duration",      f"{booking.tour_package.duration_days} Days / {booking.tour_package.duration_nights} Nights")}
      {_row("Guests",        f"{booking.total_guests} ({booking.num_adults} adult(s){ ', '+str(booking.num_children)+' child(ren)' if booking.num_children else '' })")}
    </div>

    <!-- Payment receipt -->
    <div style="margin-bottom:28px;">
      <p style="color:#C9920A;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;font-family:Arial,sans-serif;">💳 Payment Receipt</p>
      {_row("Amount (USD)",  f"${booking.total_price_usd}")}
      {_row("Amount (ETB)",  f"ETB {etb_total}")}
      {_row("Payment Via",   method_display)}
      {_row("Status",        "✅ PAID")}
      {_row("Transaction ID", payment.transaction_id if payment and payment.transaction_id else "N/A")}
    </div>

    {"<div style='background:#FEF3C7;border-left:4px solid #C9920A;border-radius:8px;padding:14px 18px;margin-bottom:28px;'><p style='color:#92400E;font-size:13px;margin:0;font-family:Arial,sans-serif;'><strong>Special Requests:</strong> " + booking.special_requests + "</p></div>" if booking.special_requests else ""}

    <!-- Next steps Callout Box -->
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background:#DCFCE7;border-radius:12px;margin-bottom:12px;border:1px solid #BBF7D0;">
      <tr>
        <td style="padding:18px 20px;font-family:Arial,sans-serif;">
          <p style="color:#14532D;font-size:14px;font-weight:700;margin:0 0 6px;">🗓️ What Happens Next?</p>
          <p style="color:#166534;font-size:13px;line-height:1.6;margin:0;">
            Our reservations hub will sync with you at <strong>{booking.contact_email}</strong> or <strong>{booking.contact_phone}</strong> within <strong>24 hours</strong> with complete logistics, pick-up points, and recommendations.
          </p>
        </td>
      </tr>
    </table>

    {_btn("View My Booking", f"{frontend_url}/bookings/{booking.reference}")}
    """
    html_body += _email_footer()
    html = _wrap(html_body)

    msg = EmailMultiAlternatives(
        subject=subject,
        body=plain,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[booking.contact_email],
    )
    msg.attach_alternative(html, "text/html")
    msg.send(fail_silently=False)


def send_admin_booking_notification(booking):
    """Notify admin team of new confirmed booking."""
    admin_email = getattr(settings, "ADMIN_EMAIL", settings.DEFAULT_FROM_EMAIL)
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")

    plain = f"""New confirmed booking on Ethiopia Tour & Travel.

Reference:  {booking.reference}
Customer:   {booking.contact_name} ({booking.contact_email})
Tour:       {booking.tour_package.title}
Amount:     ${booking.total_price_usd} USD

View details: {frontend_url}/admin/bookings/booking/
    """.strip()

    send_mail(
        subject=f"[New Booking] {booking.reference} — {booking.tour_package.title}",
        message=plain,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[admin_email],
        fail_silently=True,
    )


# ── 2. PASSWORD RESET ─────────────────────────────────────────────────────────

def send_password_reset_email(user, token: str):
    """
    Sends a security compliant password reset configuration payload to the user's email.
    """
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    reset_url    = f"{frontend_url}/reset-password/{token}"
    subject = "Reset Your Password — Ethiopia Tour & Travel"

    plain = f"""Hello {user.first_name},
We received a link configurations request to reset your password. Use the link below within 1 hour:
{reset_url}
""".strip()

    html_body = _email_header("Reset Your Password", "Password Reset Request")
    html_body += f"""
    <p style="color:#4A4A4A;line-height:1.7;margin:0 0 16px;font-size:15px;">
      Hello <strong>{user.first_name}</strong>,
    </p>
    <p style="color:#4A4A4A;line-height:1.7;margin:0 0 24px;font-size:15px;">
      We received a request to modify authentication metrics for account context (<strong>{user.email}</strong>). Click below to supply new credentials.
    </p>

    {_btn("Reset My Password", reset_url)}

    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background:#FEF3C7;border-left:4px solid #C9920A;border-radius:8px;margin:24px 0;">
      <tr>
        <td style="padding:14px 18px;font-family:Arial,sans-serif;color:#92400E;font-size:13px;line-height:1.6;">
          ⚠️ If you did not execute this action, please discard this payload context securely. Your current profile configurations remain untouched.
        </td>
      </tr>
    </table>
    """
    html_body += _email_footer()
    html = _wrap(html_body)

    msg = EmailMultiAlternatives(
        subject=subject,
        body=plain,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    msg.attach_alternative(html, "text/html")
    msg.send(fail_silently=False)


def send_newsletter_welcome_email(target_email: str):
    """
    Sends a beautifully stylized, responsive welcoming confirmation email 
    to brand new newsletter subscribers.
    """
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    subject = "Welcome to Ethiopia Tour & Travel! 🌍"

    # Plain Text Fallback
    plain = f"""Welcome to Ethiopia Tour & Travel!

Thank you for subscribing to our updates. You are now part of our exclusive network.

WHAT TO EXPECT NEXT:
- Handcrafted itineraries and off-the-beaten-path insights
- High-quality photography from across the Land of Origins
- Early access to booking discounts and travel promotions

Explore our tour packages directly at: {frontend_url}/packages

Thank you for exploring with us!
""".strip()

    # Shared Brand UI Wrapper Composition
    html_body = _email_header("Journey Updates, Direct to You ✨", "Newsletter Subscription")
    html_body += f"""
    <p style="color:#4A4A4A;line-height:1.7;margin:0 0 16px;font-size:15px;">
      Hello,
    </p>
    <p style="color:#4A4A4A;line-height:1.7;margin:0 0 24px;font-size:15px;">
      Thank you for connecting with us! Your email address (<strong>{target_email}</strong>) has been successfully registered to receive exclusive highlights from across the <strong>Land of Origins</strong>.
    </p>

    <!-- Structural Feature Callout Box Grid -->
    <div style="background:#F7F3ED;border:1px solid #E8E0D0;border-radius:12px;padding:20px;margin-bottom:28px;">
      <p style="color:#0D0D0D;font-weight:700;font-size:14px;margin:0 0 12px;font-family:Arial,sans-serif;">🧭 What to Expect in Your Inbox:</p>
      
      {_row("Handcrafted Packages", "Off-the-beaten-path trip breakdowns")}
      {_row("Field Photography", "Visual stories from Lalibela to Omo Valley")}
      {_row("Early Access Perks", "Exclusive pricing codes & flash discounts")}
    </div>

    <p style="color:#4A4A4A;line-height:1.7;margin:0 0 12px;font-size:14px;">
      Ready to start planning your next great adventure? Browse our collection of popular travel experiences right now.
    </p>

    {_btn("Explore Tour Packages", f"{frontend_url}/packages")}

    <p style="color:#8A8A8A;font-size:12px;line-height:1.5;margin:24px 0 0;text-align:center;font-style:italic;">
      No spam. You can manage your connection parameters or opt-out at any time.
    </p>
    """
    html_body += _email_footer()
    html = _wrap(html_body)

    msg = EmailMultiAlternatives(
        subject=subject,
        body=plain,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[target_email],
    )
    msg.attach_alternative(html, "text/html")
    msg.send(fail_silently=False)



def send_newsletter_welcome_email(target_email: str):
    """Dispatches a branded onboarding email featuring a signed secure unsubscription link."""
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    subject = "Welcome to Ethiopia Tour & Travel! 🌍"

    # 🔒 Generate a secure, tamper-proof signature token for this email address
    signer = Signer()
    secure_token = signer.sign(target_email)
    unsubscribe_url = f"{frontend_url}/newsletter/unsubscribe?token={secure_token}"

    plain = f"""Welcome to Ethiopia Tour & Travel!\n\n
Thank you for subscribing to our updates. You can safely unsubscribe at any time by visiting: {unsubscribe_url}
"""

    html_body = _email_header("Journey Updates, Direct to You ✨", "Newsletter Subscription")
    html_body += f"""
    <p style="color:#4A4A4A;line-height:1.7;margin:0 0 16px;font-size:15px;">Hello,</p>
    <p style="color:#4A4A4A;line-height:1.7;margin:0 0 24px;font-size:15px;">
      Thank you for connecting with us! Your email address (<strong>{target_email}</strong>) has been successfully registered to receive exclusive highlights from across the <strong>Land of Origins</strong>.
    </p>

    <div style="background:#F7F3ED;border:1px solid #E8E0D0;border-radius:12px;padding:20px;margin-bottom:28px;">
      <p style="color:#0D0D0D;font-weight:700;font-size:14px;margin:0 0 12px;font-family:Arial,sans-serif;">🧭 What to Expect in Your Inbox:</p>
      {_row("Handcrafted Packages", "Off-the-beaten-path trip breakdowns")}
      {_row("Field Photography", "Visual stories from Lalibela to Omo Valley")}
      {_row("Early Access Perks", "Exclusive pricing codes & flash discounts")}
    </div>

    {_btn("Explore Tour Packages", f"{frontend_url}/packages")}

    <p style="color:#8A8A8A;font-size:12px;line-height:1.5;margin:32px 0 0;text-align:center;">
      Changed your mind? <a href="{unsubscribe_url}" style="color:#C9920A;text-decoration:underline;">Unsubscribe instantly</a> from this list.
    </p>
    """
    html_body += _email_footer()
    html = _wrap(html_body)

    msg = EmailMultiAlternatives(subject, plain, settings.DEFAULT_FROM_EMAIL, [target_email])
    msg.attach_alternative(html, "text/html")
    msg.send(fail_silently=False)