from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.response import success_response
from app.services.cart_service import calculate_cart_summary

router = APIRouter(prefix="/cart", tags=["Cart & Checkout Validation"])

class CartItemInput(BaseModel):
    product_id: int
    quantity: int = 1

class CartSummaryRequest(BaseModel):
    items: List[CartItemInput]
    coupon_code: Optional[str] = None

@router.post("/summary")
def get_cart_summary(
    payload: CartSummaryRequest,
    db: Session = Depends(get_db),
):
    """Calculate pre-checkout cart summary, GST 18%, shipping fee, and grand total."""
    items_dict = [{"product_id": item.product_id, "quantity": item.quantity} for item in payload.items]
    summary = calculate_cart_summary(db=db, items=items_dict, coupon_code=payload.coupon_code)
    return success_response(data=summary, message="Cart summary calculated successfully")
