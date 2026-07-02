from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.models.user import User
from app.services.auth_service import register_user, authenticate_user
from app.database.session import get_db
from app.core.security import get_current_user
from app.utils.jwt import create_access_token

router = APIRouter(tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    try:
        return register_user(db=db, user_in=user_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login with email and password."""
    user = authenticate_user(db, email=user_credentials.email, password=user_credentials.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return current_user

@router.post("/forgot-password")
def forgot_password(payload: dict, db: Session = Depends(get_db)):
    """Request a password reset (always returns 200 to prevent email enumeration)."""
    email = payload.get("email", "")
    user = db.query(User).filter(User.email == email).first()
    # Always return success to prevent email enumeration
    return {"message": "If that email exists, a reset link has been sent."}
