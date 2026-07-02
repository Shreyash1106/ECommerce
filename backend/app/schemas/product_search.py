from typing import Optional, List
from pydantic import BaseModel, Field


class ProductSearchParams(BaseModel):
    query: Optional[str] = Field(None, description="Search in name, description, brand")
    category_id: Optional[int] = Field(None, description="Filter by category ID")
    brand: Optional[str] = Field(None, description="Filter by brand")
    min_price: Optional[float] = Field(None, ge=0, description="Minimum price filter")
    max_price: Optional[float] = Field(None, gt=0, description="Maximum price filter")
    min_rating: Optional[float] = Field(None, ge=0, le=5, description="Minimum rating filter")
    min_discount: Optional[float] = Field(None, ge=0, le=100, description="Minimum discount percentage")
    in_stock: Optional[bool] = Field(None, description="Filter by stock availability")
    sort_by: Optional[str] = Field("created_at", description="Field to sort by: price, rating, discount, created_at, name, popularity")
    sort_order: Optional[str] = Field("desc", description="asc or desc")
    page: Optional[int] = Field(1, ge=1, description="Page number for pagination")
    limit: Optional[int] = Field(20, ge=1, le=100, description="Items per page")


class FilterMetadata(BaseModel):
    categories: List[dict]
    brands: List[str]
    price_range: dict
    rating_range: dict
    discount_range: dict
