from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserResponse
from app.schemas.user_profile import UserProfile
from app.database.session import get_db
from app.core.security import get_current_admin_user
from app.services.user_profile_service import get_user_profile

router = APIRouter(tags=["Admin"])

@router.get("/admin/users", response_model=List[UserResponse])
def list_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    return db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()

@router.delete("/admin/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return None

@router.post("/admin/users/{user_id}/status")
def toggle_user_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = 0 if user.is_active else 1
    db.commit()
    db.refresh(user)
    return {"user_id": user.id, "is_active": bool(user.is_active)}

@router.get("/admin/users/{user_id}/profile", response_model=UserProfile)

def get_user_profile_endpoint(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    return get_user_profile(db, user_id)
