from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.payment import Payment
from app.schemas.payment import PaymentCreate, PaymentVerify, PaymentResponse
from app.schemas.response import success_response
from app.services.payment_service import create_payment_intent, verify_and_complete_payment

router = APIRouter(prefix="/payments", tags=["Payment Gateway"])

@router.post("/create")
def create_payment(
    data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate payment intent, transaction ID, and receipt number."""
    try:
        payment = create_payment_intent(
            db=db,
            user_id=current_user.id,
            amount=data.amount,
            payment_method=data.payment_method,
            product_id=data.product_id,
            quantity=data.quantity,
        )
        return success_response(
            data={
                "payment_id": payment.payment_id,
                "transaction_id": payment.transaction_id,
                "receipt_number": payment.receipt_number,
                "amount": payment.amount,
                "currency": payment.currency,
                "status": payment.status,
                "gateway_name": payment.gateway_name,
            },
            message="Payment intent created successfully",
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/verify")
def verify_payment(
    data: PaymentVerify,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Verify payment status, auto-reduce inventory, and issue invoice."""
    try:
        res = verify_and_complete_payment(
            db=db,
            user_id=current_user.id,
            payment_id=data.payment_id,
            transaction_id=data.transaction_id,
            status_input=data.status or "Success",
        )
        payment = res["payment"]
        return success_response(
            data={
                "payment_id": payment.payment_id,
                "transaction_id": payment.transaction_id,
                "receipt_number": payment.receipt_number,
                "status": payment.status,
                "paid_at": payment.paid_at.isoformat() if payment.paid_at else None,
                "order_id": res["order_id"],
                "invoice": res["invoice"],
            },
            message=f"Payment verified with status: {payment.status}",
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/history")
def get_payment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all past payments for current user."""
    payments = db.query(Payment).filter(Payment.user_id == current_user.id).order_by(Payment.id.desc()).all()
    formatted = [
        {
            "id": p.id,
            "payment_id": p.payment_id,
            "transaction_id": p.transaction_id,
            "receipt_number": p.receipt_number,
            "amount": p.amount,
            "payment_method": p.payment_method,
            "status": p.status,
            "paid_at": p.paid_at.isoformat() if p.paid_at else None,
            "created_at": p.created_at.isoformat(),
        }
        for p in payments
    ]
    return success_response(data=formatted, message="Payment history retrieved")
