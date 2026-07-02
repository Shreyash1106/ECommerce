from typing import Union
from sqlalchemy.orm import Session
import re
import bcrypt as _bcrypt
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.user import UserCreate

PASSWORD_STRENGTH_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$")


def is_strong_password(password: str) -> bool:
    """Return True when password meets required strength rules."""
    return bool(PASSWORD_STRENGTH_REGEX.match(password))

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password."""
    return _bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def get_password_hash(password: str) -> str:
    """Hash password using bcrypt."""
    return _bcrypt.hashpw(password.encode("utf-8"), _bcrypt.gensalt()).decode("utf-8")

def authenticate_user(db: Session, email: str, password: str) -> Union[User, bool]:
    """Authenticate user with email and password."""
    normalized_email = email.strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

def register_user(db: Session, user_in: UserCreate) -> User:
    """Register a new user."""
    normalized_email = user_in.email.strip().lower()
    normalized_name = user_in.name.strip()

    # Check if email already exists
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_in.password)
    
    # Create user
    db_user = User(
        name=normalized_name,
        email=normalized_email,
        password=hashed_password,
        role=(user_in.role or "customer").strip().lower(),
        is_admin=0
    )
    
    # Save to database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user
