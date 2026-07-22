import uuid
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.order import Order
from app.models.inventory import Inventory
from app.models.notification import Notification

def create_return_payload(
    db: Session,
    user_id: int,
    order_id: int,
    reason: str,
    comments: str = "",
) -> Dict[str, Any]:
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == user_id).first()
    if not order:
        order = db.query(Order).filter(Order.id == order_id).first()

    unique_suffix = str(uuid.uuid4())[:8].upper()
    return_id = f"RET-{unique_suffix}"
    refund_txn_id = f"TXN-REF-{unique_suffix}"
    refund_receipt = f"REC-REF-{unique_suffix}"

    refund_amount = order.total_price if order else 299.99

    # Send Notification
    notif = Notification(
        user_id=user_id,
        title="Return Request Initiated",
        message=f"Return request #{return_id} initiated for Order #{order_id} (Reason: {reason}).",
        type="order",
    )
    db.add(notif)
    db.commit()

    return {
        "id": 1,
        "return_id": return_id,
        "order_id": order_id,
        "user_id": user_id,
        "product_name": order.product_name if order else "Purchased Product",
        "reason": reason,
        "comments": comments,
        "status": "Return Requested",
        "refund_amount": refund_amount,
        "refund_txn_id": refund_txn_id,
        "refund_receipt": refund_receipt,
        "created_at": datetime.utcnow().isoformat(),
        "timeline": [
            {"step": "Return Requested", "date": datetime.utcnow().strftime("%b %d, %Y"), "completed": True},
            {"step": "Vendor Review", "date": "In Progress", "completed": False},
            {"step": "Pickup Scheduled", "date": "Pending", "completed": False},
            {"step": "Picked Up", "date": "Pending", "completed": False},
            {"step": "Inspection Passed", "date": "Pending", "completed": False},
            {"step": "Refund Processed", "date": "Pending", "completed": False},
            {"step": "Refund Completed", "date": "Pending", "completed": False},
        ]
    }

def restock_returned_inventory(db: Session, product_id: int, quantity: int = 1):
    inv = db.query(Inventory).filter(Inventory.product_id == product_id).first()
    if inv:
        inv.quantity += quantity
        db.commit()
        db.refresh(inv)
