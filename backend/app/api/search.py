from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Path
from app.schemas.product import ProductResponse
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.schemas.product import PaginatedProductResponse
from app.schemas.product_search import FilterMetadata
from app.services import product_service
from app.database.session import get_db

router = APIRouter(tags=["Search"])


@router.get("/products", response_model=PaginatedProductResponse)
def search_products(
    q: Optional[str] = Query(None, description="Search query for name, description, brand"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price filter"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum rating filter"),
    min_discount: Optional[float] = Query(None, ge=0, le=100, description="Minimum discount percentage"),
    in_stock: Optional[bool] = Query(None, description="Filter by stock availability"),
    sort_by: Optional[str] = Query("created_at", description="Sort by: price, rating, discount, created_at, name, popularity"),
    sort_order: Optional[str] = Query("desc", description="Sort order: asc or desc"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """Advanced product search with multiple filters and pagination."""
    try:
        result = product_service.search_products(
            db,
            query=q,
            category_id=category_id,
            brand=brand,
            min_price=min_price,
            max_price=max_price,
            min_rating=min_rating,
            min_discount=min_discount,
            in_stock=in_stock,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            limit=limit
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/products/filters/metadata", response_model=FilterMetadata)
def get_filter_metadata(db: Session = Depends(get_db)):
    """Get available filter options for products."""
    try:
        return product_service.get_filter_metadata(db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    @router.get("/products/filters", response_model=FilterMetadata)
    def get_filter_counts(
        category_id: Optional[int] = Query(None),
        brand: Optional[str] = Query(None),
        min_price: Optional[float] = Query(None),
        max_price: Optional[float] = Query(None),
        min_rating: Optional[float] = Query(None),
        min_discount: Optional[float] = Query(None),
        in_stock: Optional[bool] = Query(None),
        db: Session = Depends(get_db)
    ):
        """Return filter options with dynamic product counts based on current filters."""
        try:
            return product_service.get_filter_counts(
                db,
                category_id=category_id,
                brand=brand,
                min_price=min_price,
                max_price=max_price,
                min_rating=min_rating,
                min_discount=min_discount,
                in_stock=in_stock,
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @router.get("/products/{product_id}/similar", response_model=List[ProductResponse])
    def get_similar_products(
        product_id: int = Path(..., gt=0),
        limit: int = Query(8, ge=1, le=20),
        db: Session = Depends(get_db)
    ):
        """Return similar products for the given product ID."""
        try:
            return product_service.get_similar_products(db, product_id, limit)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))


@router.get("/products/suggestions")
def get_search_suggestions(
    q: str = Query(..., min_length=2, description="Search query for suggestions"),
    limit: int = Query(10, ge=1, le=20, description="Number of suggestions"),
    db: Session = Depends(get_db)
):
    """Get autocomplete suggestions for search."""
    try:
        suggestions = product_service.get_search_suggestions(db, q, limit)
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
