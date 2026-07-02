from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

class InventoryBase(BaseModel):
    product_id: int
    quantity: int = Field(..., ge=0)
    low_stock_threshold: int = Field(default=5, ge=0)

    model_config = ConfigDict(from_attributes=True)

class InventoryCreate(InventoryBase):
    pass

class InventoryUpdate(BaseModel):
    quantity: Optional[int] = Field(None, ge=0)
    low_stock_threshold: Optional[int] = Field(None, ge=0)

    model_config = ConfigDict(from_attributes=True)

class InventoryResponse(InventoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
