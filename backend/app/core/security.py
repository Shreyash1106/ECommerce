import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.utils.jwt import verify_access_token

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
    return user

def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Allow access if is_admin=1 OR role='admin'."""
    is_admin = getattr(current_user, "is_admin", 0) or getattr(current_user, "role", "") == "admin"
    if not is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return current_user
