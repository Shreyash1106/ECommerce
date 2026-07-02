from typing import Optional
from pydantic import BaseModel, Field

class ProductSearchParams(BaseModel):
    query: Optional[str] = Field(None, description="Partial case‑insensitive match on product name")
    category_id: Optional[int] = Field(None, description="Filter by category ID")
    min_price: Optional[float] = Field(None, gt=0, description="Minimum price filter")
    max_price: Optional[float] = Field(None, gt=0, description="Maximum price filter")
    sort_by: Optional[str] = Field("created_at", description="Field to sort by: name, price, created_at")
    sort_order: Optional[str] = Field("desc", description="asc or desc")
    page: Optional[int] = Field(1, ge=1, description="Page number for pagination")
    limit: Optional[int] = Field(20, ge=1, le=100, description="Items per page")
