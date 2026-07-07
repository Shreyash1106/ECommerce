from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.models.order import Order
from app.models.product import Product
from app.schemas.order import OrderCreate
from app.services import notification_service

def create_order(db: Session, order_in: OrderCreate, user_id: int) -> Order:
    product = db.query(Product).filter(Product.id == order_in.product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if not hasattr(product, "inventory") or product.inventory is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inventory information unavailable")

    if product.inventory.quantity < order_in.quantity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient stock")

    total_price = product.price * order_in.quantity
    db_order = Order(user_id=user_id, product_id=order_in.product_id, quantity=order_in.quantity, total_price=total_price)
    product.inventory.quantity -= order_in.quantity

    db.add(db_order)
    db.add(product.inventory)
    db.commit()
    db.refresh(db_order)
    
    # Create notification for customer
    notification_service.create_notification(
        db=db,
        user_id=user_id,
        title="Order Placed",
        message=f"Your order for {product.name} has been placed successfully.",
        notification_type="order"
    )
    
    return db_order

def get_all_orders(db: Session, skip: int = 0, limit: int = 100) -> List[Order]:
    return (
        db.query(Order)
        .options(joinedload(Order.user), joinedload(Order.product))
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_orders_for_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Order]:
    return (
        db.query(Order)
        .options(joinedload(Order.user), joinedload(Order.product))
        .filter(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_order_by_id(db: Session, order_id: int, user_id: Optional[int] = None) -> Order:
    query = db.query(Order).options(joinedload(Order.user), joinedload(Order.product)).filter(Order.id == order_id)
    order = query.first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if user_id is not None and order.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this order")
    return order

def update_order_status(db: Session, order_id: int, status: str) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status
    db.commit()
    db.refresh(order)
    return order

def get_orders_for_vendor(db: Session, vendor_id: int, skip: int = 0, limit: int = 100) -> List[Order]:
    return (
        db.query(Order)
        .options(joinedload(Order.user), joinedload(Order.product))
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_order_for_vendor(db: Session, order_id: int, vendor_id: int) -> Order:
    order = (
        db.query(Order)
        .options(joinedload(Order.user), joinedload(Order.product))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order

def update_order_status_for_vendor(db: Session, order_id: int, status: str, vendor_id: int) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    order.status = status
    db.commit()
    db.refresh(order)
    return order
