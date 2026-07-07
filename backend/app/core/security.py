import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Optional

from app.database.session import get_db
from app.models.user import User
from app.utils.jwt import verify_access_token
from app.constants.roles import ROLE_ADMIN, ROLE_VENDOR, ROLE_CUSTOMER, VENDOR_OR_ADMIN_ROLES

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user_id_str = verify_access_token(token)
    if user_id_str is None:
        raise credentials_exception
    try:
        user_id = int(user_id_str)
    except ValueError:
        raise credentials_exception
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is deactivated")
    return user

def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Allow access if role='admin'."""
    if current_user.role != ROLE_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return current_user

def get_current_vendor_user(current_user: User = Depends(get_current_user)) -> User:
    """Allow access if role='vendor'."""
    if current_user.role != ROLE_VENDOR:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Vendor privileges required")
    return current_user

def get_current_customer_user(current_user: User = Depends(get_current_user)) -> User:
    """Allow access if role='customer'."""
    if current_user.role != ROLE_CUSTOMER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customer privileges required")
    return current_user

def get_current_vendor_or_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Allow access if role is 'vendor' or 'admin'."""
    if current_user.role not in VENDOR_OR_ADMIN_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin or Vendor privileges required")
    return current_user

def require_role(required_roles: list[str]):
    """Dependency factory to require specific roles."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access restricted to roles: {', '.join(required_roles)}"
            )
        return current_user
    return role_checker

def check_ownership(resource_owner_id: int, current_user: User, allow_admin: bool = True) -> bool:
    """Check if current user owns the resource or is admin."""
    if current_user.role == ROLE_ADMIN and allow_admin:
        return True
    return resource_owner_id == current_user.id

def require_ownership(resource_owner_id: int, current_user: User = Depends(get_current_user), allow_admin: bool = True) -> User:
    """Dependency to require resource ownership."""
    if not check_ownership(resource_owner_id, current_user, allow_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource"
        )
    return current_user
