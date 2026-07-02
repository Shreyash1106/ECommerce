from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.schemas.product import ProductResponse
from app.services import product_service
from app.database.session import get_db

router = APIRouter(tags=["Search"])

@router.get("/products", response_model=List[ProductResponse])
def search_products(
    q: str = Query(None, description="Search query"),
    category_id: int = Query(None, description="Category ID"),
    min_price: float = Query(None, ge=0, description="Minimum price"),
    max_price: float = Query(None, ge=0, description="Maximum price"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """Search products with filters."""
    try:
        return product_service.search_products(
            db,
            query=q,
            category_id=category_id,
            min_price=min_price,
            max_price=max_price,
            page=page,
            limit=limit
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
