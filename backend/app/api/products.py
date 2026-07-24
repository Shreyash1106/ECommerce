from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query, Path, HTTPException
from sqlalchemy.orm import Session

from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, CategoryInfo
from app.services import product_service
from app.database.session import get_db
from app.core.security import get_current_vendor_or_admin_user
from app.models.user import User
from app.models.category import Category

router = APIRouter(tags=["Products"])

@router.get("/categories/list", response_model=List[CategoryInfo])
def get_categories(db: Session = Depends(get_db)):
    """Get all available categories."""
    try:
        return db.query(Category).all()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_vendor_or_admin_user)
):
    """Create a new product (admin/vendor only)."""
    try:
        return product_service.create_product(db, product_in)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=List[ProductResponse])
def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    q: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    brand: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_rating: Optional[float] = Query(None),
    in_stock: Optional[bool] = Query(None),
    sort_by: Optional[str] = Query("created_at"),
    db: Session = Depends(get_db)
):
    """Get all products with filtering, search, and sorting."""
    try:
        return product_service.get_products(
            db,
            skip=skip,
            limit=limit,
            q=q,
            category_id=category_id,
            brand=brand,
            min_price=min_price,
            max_price=max_price,
            min_rating=min_rating,
            in_stock=in_stock,
            sort_by=sort_by
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int = Path(..., gt=0),
    db: Session = Depends(get_db)
):
    """Get a single product by ID."""
    try:
        return product_service.get_product_by_id(db, product_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int = Path(..., gt=0),
    product_in: ProductUpdate = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_vendor_or_admin_user)
):
    """Update a product (admin/vendor only)."""
    try:
        return product_service.update_product(db, product_id, product_in)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_vendor_or_admin_user)
):
    """Delete a product (admin/vendor only)."""
    try:
        product_service.delete_product(db, product_id)
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{product_id}/approve", response_model=ProductResponse)
def approve_product(
    product_id: int = Path(..., gt=0),
    is_approved: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_vendor_or_admin_user)
):
    """Approve or reject a vendor product (admin/vendor)."""
    try:
        return product_service.approve_product(db, product_id, is_approved=is_approved)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


