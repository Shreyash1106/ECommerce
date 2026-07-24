from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.config import settings
from app.database.session import get_db
from app.models.user import User

# Role Constants
ROLE_ADMIN = "admin"
ROLE_VENDOR = "vendor"
ROLE_CUSTOMER = "customer"

ALL_ROLES = [ROLE_ADMIN, ROLE_VENDOR, ROLE_CUSTOMER]
VENDOR_OR_ADMIN_ROLES = [ROLE_ADMIN, ROLE_VENDOR]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    """Validate JWT token and return current user by ID, username, or email."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        sub_val: str = payload.get("sub")
        if sub_val is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = None
    if str(sub_val).isdigit():
        user = db.query(User).filter(User.id == int(sub_val)).first()
    if not user:
        user = db.query(User).filter(or_(User.username == str(sub_val), User.email == str(sub_val))).first()

    if user is None:
        raise credentials_exception
    if hasattr(user, "is_active") and not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user account")

    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Ensure current user is active."""
    return current_user

def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Allow access if role='admin'."""
    if current_user.role.lower() != ROLE_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return current_user

def get_current_vendor_user(current_user: User = Depends(get_current_user)) -> User:
    """Allow access if role='vendor' or 'admin'."""
    if current_user.role.lower() not in VENDOR_OR_ADMIN_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Vendor privileges required")
    return current_user

def get_current_customer_user(current_user: User = Depends(get_current_user)) -> User:
    """Allow any authenticated active user to place orders."""
    return current_user

def get_current_vendor_or_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Allow access if role is 'vendor' or 'admin'."""
    if current_user.role.lower() not in VENDOR_OR_ADMIN_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin or Vendor privileges required")
    return current_user
