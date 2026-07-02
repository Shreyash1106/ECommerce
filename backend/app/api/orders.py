from typing import List
from fastapi import APIRouter, Depends, status, Path, Query, HTTPException
from sqlalchemy.orm import Session

from app.schemas.order import OrderCreate, OrderResponse
from app.services import order_service
from app.database.session import get_db
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(tags=["Orders"])

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return order_service.create_order(db, order_in, user_id=current_user.id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=List[OrderResponse])
def get_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        is_admin = current_user.is_admin or current_user.role in ("admin", "vendor")
        if is_admin:
            return order_service.get_all_orders(db, skip=skip, limit=limit)
        return order_service.get_orders_for_user(db, user_id=current_user.id, skip=skip, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        is_admin = current_user.is_admin or current_user.role in ("admin", "vendor")
        user_id = None if is_admin else current_user.id
        return order_service.get_order_by_id(db, order_id=order_id, user_id=user_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int = Path(..., gt=0),
    payload: dict = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update order status (admin/vendor only)."""
    is_admin = current_user.is_admin or current_user.role in ("admin", "vendor")
    if not is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    allowed = {"Pending", "Processing", "Shipped", "Delivered", "Cancelled"}
    new_status = (payload or {}).get("status", "")
    if new_status not in allowed:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {allowed}")
    try:
        return order_service.update_order_status(db, order_id=order_id, status=new_status)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
