import os
import smtplib
from email.mime.text import MIMEText
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from fastapi import BackgroundTasks

# Load configuration from environment variables
SMTP_HOST = os.getenv('SMTP_HOST', 'smtp.example.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USER = os.getenv('SMTP_USER', '')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
EMAIL_FROM = os.getenv('EMAIL_FROM', SMTP_USER)
SECRET_KEY = os.getenv('SECRET_KEY', 'replace-this-with-a-secure-secret')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')  # Used for verification link


def _get_serializer():
    return URLSafeTimedSerializer(SECRET_KEY)


def generate_verification_token(email: str, expires_sec: int = 3600) -> str:
    """Generate a signed token for email verification.

    Args:
        email: User's email address.
        expires_sec: Expiration time in seconds (default 1 hour).
    Returns:
        A URL‑safe signed token.
    """
    serializer = _get_serializer()
    return serializer.dumps(email, salt='email-verify')


def verify_token(token: str, max_age: int = 3600) -> str | None:
    """Validate a verification token and return the email.

    Args:
        token: Token string received from the user.
        max_age: Maximum age in seconds.
    Returns:
        The email if the token is valid, otherwise ``None``.
    """
    serializer = _get_serializer()
    try:
        email = serializer.loads(token, salt='email-verify', max_age=max_age)
    except (BadSignature, SignatureExpired):
        return None
    return email


def _send_email(to_email: str, subject: str, body: str):
    """Send a plain‑text email via SMTP.
    This function is executed in a background task.
    """
    msg = MIMEText(body, "plain")
    msg['Subject'] = subject
    msg['From'] = EMAIL_FROM
    msg['To'] = to_email

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        if SMTP_USER and SMTP_PASSWORD:
            server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)


def send_verification_email(to_email: str, token: str, background_tasks: BackgroundTasks):
    """Schedule sending the verification email.

    The verification link points to the frontend (or can be a direct API call).
    """
    verification_url = f"{FRONTEND_URL}/verify-email?token={token}"
    subject = "Please verify your email address"
    body = (
        f"Hello,\n\n"
        f"Thank you for registering. Please verify your email by clicking the link below:\n"
        f"{verification_url}\n\n"
        f"If you did not sign up, you can ignore this email.\n"
        f"\nBest regards,\nE‑Commerce Team"
    )
    background_tasks.add_task(_send_email, to_email, subject, body)
