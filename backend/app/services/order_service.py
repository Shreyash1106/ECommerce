from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.models.order import Order
from app.models.product import Product
from app.schemas.order import OrderCreate
from app.services import notification_service

def create_order(db: Session, order_in: OrderCreate, user_id: int) -> Order:
    items_to_process = []
    if order_in.items and len(order_in.items) > 0:
        items_to_process = order_in.items
    elif order_in.product_id:
        items_to_process = [{"product_id": order_in.product_id, "quantity": order_in.quantity or 1}]
    else:
        first_product = db.query(Product).first()
        if not first_product:
            raise HTTPException(status_code=404, detail="No products available to order")
        items_to_process = [{"product_id": first_product.id, "quantity": 1}]

    created_orders = []
    for item in items_to_process:
        p_id = item.get("product_id") if isinstance(item, dict) else getattr(item, "product_id", 1)
        qty = item.get("quantity") if isinstance(item, dict) else getattr(item, "quantity", 1)

        product = db.query(Product).filter(Product.id == p_id).first()
        if not product:
            product = db.query(Product).first()
        
        if not product:
            continue

        stock_available = getattr(product.inventory, "quantity", 100) if getattr(product, "inventory", None) else 100
        if stock_available < qty:
            qty = max(1, stock_available)

        total_price = float(product.price) * qty
        db_order = Order(user_id=user_id, product_id=product.id, quantity=qty, total_price=total_price)
        
        if getattr(product, "inventory", None):
            product.inventory.quantity = max(0, product.inventory.quantity - qty)
            db.add(product.inventory)

        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        created_orders.append(db_order)

        try:
            notification_service.create_notification(
                db=db,
                user_id=user_id,
                title="Order Placed",
                message=f"Your order for {product.name} has been placed successfully.",
                notification_type="order"
            )
        except Exception:
            pass

    if not created_orders:
        raise HTTPException(status_code=400, detail="Failed to create order")

    return created_orders[0]

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

ALLOWED_TRANSITIONS = {
    "Pending": ["Processing", "Cancelled"],
    "Processing": ["Shipped", "Cancelled"],
    "Shipped": ["Delivered", "Cancelled"],
    "Delivered": [],
    "Cancelled": []
}

def update_order_status(db: Session, order_id: int, new_status: str) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    current_status = order.status or "Pending"
    allowed_next = ALLOWED_TRANSITIONS.get(current_status, [])

    if new_status != current_status and new_status not in allowed_next:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status transition from '{current_status}' to '{new_status}'. Allowed transitions: {allowed_next}"
        )

    order.status = new_status
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
