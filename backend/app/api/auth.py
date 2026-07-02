from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.user import UserCreate, UserLogin, UserResponse, UserUpdate, PasswordUpdate, Token
from app.models.user import User
from app.services.auth_service import authenticate_user, get_password_hash, is_strong_password, register_user, verify_password
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

@router.put("/profile", response_model=UserResponse)
def update_profile(updated_data: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update the current user profile."""
    if updated_data.email and updated_data.email != current_user.email:
        existing_user = db.query(User).filter(User.email == updated_data.email).first()
        if existing_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")

    if updated_data.name is not None:
        current_user.name = updated_data.name
    if updated_data.email is not None:
        current_user.email = updated_data.email
    if updated_data.notify_new_orders is not None:
        current_user.notify_new_orders = int(updated_data.notify_new_orders)
    if updated_data.notify_low_stock_alerts is not None:
        current_user.notify_low_stock_alerts = int(updated_data.notify_low_stock_alerts)
    if updated_data.notify_user_activity is not None:
        current_user.notify_user_activity = int(updated_data.notify_user_activity)
    if updated_data.notify_system_updates is not None:
        current_user.notify_system_updates = int(updated_data.notify_system_updates)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/password", response_model=UserResponse)
def change_password(password_data: PasswordUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Change the current user password."""
    if not verify_password(password_data.current_password, current_user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Current password is incorrect")

    if password_data.current_password == password_data.new_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be different from current password")

    if not is_strong_password(password_data.new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters and include uppercase, lowercase, number, and special character"
        )

    current_user.password = get_password_hash(password_data.new_password)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/forgot-password")
def forgot_password(payload: dict, db: Session = Depends(get_db)):
    """Request a password reset (always returns 200 to prevent email enumeration)."""
    email = payload.get("email", "")
    user = db.query(User).filter(User.email == email).first()
    # Always return success to prevent email enumeration
    return {"message": "If that email exists, a reset link has been sent."}
