from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.user_profile import UserProfile
from app.database.session import get_db
from app.core.security import get_current_admin_user
from app.services.user_profile_service import get_user_profile

router = APIRouter(tags=["Admin"])

@router.get("/users", response_model=List[UserResponse])
def list_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    return db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()

@router.put("/users/{user_id}", response_model=UserResponse)
def update_user_by_admin(
    user_id: int,
    updated_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if updated_data.first_name is not None:
        user.first_name = updated_data.first_name
    if updated_data.last_name is not None:
        user.last_name = updated_data.last_name
    if updated_data.username is not None:
        user.username = updated_data.username
    if updated_data.email is not None:
        user.email = updated_data.email
    if updated_data.phone is not None:
        user.phone = updated_data.phone
    if updated_data.notify_new_orders is not None:
        user.notify_new_orders = updated_data.notify_new_orders
    if updated_data.notify_low_stock_alerts is not None:
        user.notify_low_stock_alerts = updated_data.notify_low_stock_alerts
    if updated_data.notify_user_activity is not None:
        user.notify_user_activity = updated_data.notify_user_activity
    if updated_data.notify_system_updates is not None:
        user.notify_system_updates = updated_data.notify_system_updates
    
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
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

@router.post("/users/{user_id}/status")
def toggle_user_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return {"user_id": user.id, "is_active": user.is_active}

@router.get("/users/{user_id}/profile", response_model=UserProfile)
def get_user_profile_endpoint(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    return get_user_profile(db, user_id)
