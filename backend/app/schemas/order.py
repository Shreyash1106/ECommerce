from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class OrderItemIn(BaseModel):
    product_id: int
    quantity: int = 1

class OrderCreate(BaseModel):
    product_id: Optional[int] = None
    quantity: Optional[int] = 1
    items: Optional[List[OrderItemIn]] = None
    shipping_address_id: Optional[int] = 1
    payment_method: Optional[str] = "card"
    coupon_code: Optional[str] = None
    shipping_fee: Optional[float] = 0.0
    gst_amount: Optional[float] = 0.0

class OrderResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    customer: Optional[str] = None
    email: Optional[str] = None
    product_name: Optional[str] = None
    quantity: int
    total_price: float
    status: str = "Pending"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
