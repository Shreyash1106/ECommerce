import os
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from fastapi import BackgroundTasks
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.models.user import User

SECRET_KEY = os.getenv('SECRET_KEY', 'replace-this-with-a-secure-secret')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _serializer():
    return URLSafeTimedSerializer(SECRET_KEY)


def generate_reset_token(email: str) -> str:
    return _serializer().dumps(email, salt='password-reset')


def verify_reset_token(token: str, max_age: int = 3600) -> str | None:
    try:
        return _serializer().loads(token, salt='password-reset', max_age=max_age)
    except (BadSignature, SignatureExpired):
        return None


def send_reset_email(to_email: str, token: str, background_tasks: BackgroundTasks):
    from app.services.email_service import _send_email
    reset_url = f"{FRONTEND_URL}/reset-password?token={token}"
    subject = "Password Reset Request"
    body = (
        f"Hello,\n\n"
        f"Click the link below to reset your password (valid for 1 hour):\n"
        f"{reset_url}\n\n"
        f"If you did not request this, ignore this email.\n\nE-Commerce Team"
    )
    background_tasks.add_task(_send_email, to_email, subject, body)


def reset_user_password(db: Session, email: str, new_password: str) -> None:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise ValueError("User not found")
    user.password = pwd_context.hash(new_password)
    db.commit()
