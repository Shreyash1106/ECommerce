from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class CategoryInfo(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)


class InventoryInfo(BaseModel):
    quantity: int
    in_stock: bool
    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    brand: Optional[str] = Field(None, max_length=255)
    rating: Optional[float] = Field(0.0, ge=0, le=5)
    discount_percentage: Optional[float] = Field(0.0, ge=0, le=100)
    color: Optional[str] = Field(None, max_length=100)
    size: Optional[str] = Field(None, max_length=50)
    material: Optional[str] = Field(None, max_length=100)


class ProductCreate(ProductBase):
    category_id: Optional[int] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    brand: Optional[str] = Field(None, max_length=255)
    rating: Optional[float] = Field(None, ge=0, le=5)
    discount_percentage: Optional[float] = Field(None, ge=0, le=100)
    category_id: Optional[int] = None


class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    category_id: Optional[int] = None
    image_url: Optional[str] = None
    category: Optional[CategoryInfo] = None
    inventory: Optional[InventoryInfo] = None
    color: Optional[str] = None
    size: Optional[str] = None
    material: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class PaginatedProductResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    limit: int
    total_pages: int
    has_next: bool
    has_previous: bool

    model_config = ConfigDict(from_attributes=True)
