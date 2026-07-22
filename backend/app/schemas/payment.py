from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class PaymentCreate(BaseModel):
    amount: float
    payment_method: Optional[str] = "Credit Card"
    product_id: Optional[int] = None
    quantity: Optional[int] = 1

class PaymentVerify(BaseModel):
    payment_id: str
    transaction_id: str
    status: Optional[str] = "Success"

class PaymentResponse(BaseModel):
    id: int
    user_id: int
    order_id: Optional[int] = None
    payment_id: str
    transaction_id: str
    receipt_number: str
    gateway_name: str
    payment_method: str
    amount: float
    currency: str
    status: str
    paid_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
