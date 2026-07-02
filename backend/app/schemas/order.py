from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class OrderCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)

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
