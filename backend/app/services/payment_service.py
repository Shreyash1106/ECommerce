import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.payment import Payment
from app.models.order import Order
from app.models.inventory import Inventory
from app.models.notification import Notification

def create_payment_intent(
    db: Session,
    user_id: int,
    amount: float,
    payment_method: str = "Credit Card",
    product_id: int = None,
    quantity: int = 1,
) -> Payment:
    unique_suffix = str(uuid.uuid4())[:8].upper()
    payment_id = f"PAY-MOCK-{unique_suffix}"
    transaction_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
    receipt_number = f"REC-INV-{unique_suffix}"

    payment = Payment(
        user_id=user_id,
        payment_id=payment_id,
        transaction_id=transaction_id,
        receipt_number=receipt_number,
        gateway_name="MockPay Enterprise",
        payment_method=payment_method or "Credit Card",
        amount=amount,
        currency="USD",
        status="Pending",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment

def verify_and_complete_payment(
    db: Session,
    user_id: int,
    payment_id: str,
    transaction_id: str,
    status_input: str = "Success",
    product_id: int = None,
    quantity: int = 1,
) -> dict:
    payment = db.query(Payment).filter(
        Payment.payment_id == payment_id,
        Payment.user_id == user_id
    ).first()

    if not payment:
        payment = db.query(Payment).filter(Payment.user_id == user_id).order_by(Payment.id.desc()).first()

    if not payment:
        raise ValueError("Payment record not found")

    if status_input == "Success":
        payment.status = "Success"
        payment.paid_at = datetime.utcnow()

        # Create Order record if product provided
        new_order = None
        if product_id:
            new_order = Order(
                user_id=user_id,
                product_id=product_id,
                quantity=quantity,
                total_price=payment.amount,
                status="Processing",
            )
            db.add(new_order)
            db.flush()
            payment.order_id = new_order.id

            # Reduce Inventory
            inventory_item = db.query(Inventory).filter(Inventory.product_id == product_id).first()
            if inventory_item and inventory_item.quantity >= quantity:
                inventory_item.quantity -= quantity

        # Create System Notification
        notification = Notification(
            user_id=user_id,
            title="Payment Successful",
            message=f"Your payment of ${payment.amount:.2f} (Txn: {payment.transaction_id}) was processed successfully.",
            type="order",
        )
        db.add(notification)
        db.commit()
        db.refresh(payment)

        return {
            "payment": payment,
            "order_id": new_order.id if new_order else None,
            "invoice": {
                "receipt_number": payment.receipt_number,
                "transaction_id": payment.transaction_id,
                "amount": payment.amount,
                "paid_at": payment.paid_at.isoformat() if payment.paid_at else None,
                "status": payment.status,
            }
        }
    else:
        payment.status = "Failed"
        db.commit()
        db.refresh(payment)
        return {"payment": payment, "order_id": None, "invoice": None}
