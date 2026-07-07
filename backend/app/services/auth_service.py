from typing import Union
from sqlalchemy.orm import Session
import re
import bcrypt as _bcrypt
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.user import UserCreate
from app.constants.roles import REGISTRATION_ALLOWED_ROLES

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
    normalized_username = user_in.username.strip().lower()
    normalized_first_name = user_in.first_name.strip()
    normalized_last_name = user_in.last_name.strip()

    # Check if email already exists
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    existing_username = db.query(User).filter(User.username == normalized_username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Check if phone already exists (if provided)
    if user_in.phone:
        normalized_phone = user_in.phone.strip()
        existing_phone = db.query(User).filter(User.phone == normalized_phone).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already registered"
            )
    
    # Validate role - only allow registration with specific roles
    role = (user_in.role or "customer").strip().lower()
    if role not in REGISTRATION_ALLOWED_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Allowed roles during registration: {', '.join(sorted(REGISTRATION_ALLOWED_ROLES))}"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_in.password)
    
    # Create user
    db_user = User(
        first_name=normalized_first_name,
        last_name=normalized_last_name,
        username=normalized_username,
        email=normalized_email,
        phone=user_in.phone.strip() if user_in.phone else None,
        password=hashed_password,
        role=role
    )
    
    # Save to database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user
