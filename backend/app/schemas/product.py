from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class CategoryInfo(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    price: float = Field(..., gt=0)


class ProductCreate(ProductBase):
    category_id: Optional[int] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    category_id: Optional[int] = None


class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    category_id: Optional[int] = None
    image_url: Optional[str] = None
    category: Optional[CategoryInfo] = None

    model_config = ConfigDict(from_attributes=True)
