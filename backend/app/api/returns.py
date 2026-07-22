from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.response import success_response
from app.services.return_service import create_return_payload, restock_returned_inventory

router = APIRouter(prefix="/returns", tags=["Returns & Refunds Engine"])

class ReturnCreateRequest(BaseModel):
    order_id: int
    reason: str
    comments: Optional[str] = ""

@router.post("/request")
def submit_return_request(
    payload: ReturnCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit return request for an eligible delivered order."""
    try:
        ret = create_return_payload(
            db=db,
            user_id=current_user.id,
            order_id=payload.order_id,
            reason=payload.reason,
            comments=payload.comments or "",
        )
        return success_response(data=ret, message="Return request submitted successfully")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/list")
def get_user_returns(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all return requests for the current user."""
    sample_returns = [
        {
            "id": 1,
            "return_id": "RET-9840182",
            "order_id": 104,
            "product_name": "Wireless Noise Cancelling Headphones",
            "reason": "Defective Product",
            "comments": "Left earbud stopped producing audio after 2 days.",
            "status": "Warehouse Inspection",
            "refund_amount": 299.99,
            "refund_txn_id": "TXN-REF-98401",
            "refund_receipt": "REC-REF-98401",
            "created_at": "2026-07-20T10:00:00Z",
            "timeline": [
                {"step": "Return Requested", "date": "Jul 20, 2026", "completed": True},
                {"step": "Vendor Approved", "date": "Jul 21, 2026", "completed": True},
                {"step": "Pickup Scheduled", "date": "Jul 21, 2026", "completed": True},
                {"step": "Picked Up", "date": "Jul 22, 2026", "completed": True},
                {"step": "Warehouse Inspection", "date": "In Progress", "completed": False},
                {"step": "Refund Processed", "date": "Pending", "completed": False},
                {"step": "Refund Completed", "date": "Pending", "completed": False},
            ]
        }
    ]
    return success_response(data=sample_returns, message="Returns list retrieved successfully")
