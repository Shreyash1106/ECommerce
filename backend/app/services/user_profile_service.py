from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User
from app.models.order import Order
from fastapi import HTTPException

def get_user_profile(db: Session, user_id: int) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    total_orders = db.query(func.count(Order.id)).filter(Order.user_id == user_id).scalar() or 0
    total_spent = float(
        db.query(func.coalesce(func.sum(Order.total_price), 0.0))
            .filter(Order.user_id == user_id)
            .scalar() or 0.0
    )
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "created_at": user.created_at,
        "total_orders": total_orders,
        "total_spent": total_spent,
    }
