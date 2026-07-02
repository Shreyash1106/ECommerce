from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_, desc, asc
from fastapi import HTTPException, status
import os
import re
import uuid
import unicodedata
from pathlib import Path

from app.models.product import Product
from app.models.inventory import Inventory
from app.models.category import Category
from app.schemas.product import ProductCreate, ProductUpdate


def secure_filename(filename: str) -> str:
    """Minimal secure filename sanitizer without external dependencies."""
    filename = unicodedata.normalize("NFKD", filename).encode("ascii", "ignore").decode("ascii")
    filename = filename.replace("\\", "/")
    filename = filename.split("/")[-1]
    filename = re.sub(r"[^A-Za-z0-9_.-]+", "_", filename)
    filename = re.sub(r"^[._-]+|[._-]+$", "", filename)
    return filename or "file"

ALLOWED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def create_product(db: Session, product_in: ProductCreate) -> Product:
    db_product = Product(
        name=product_in.name,
        category_id=product_in.category_id,
        description=product_in.description,
        price=product_in.price
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_products(db: Session, skip: int = 0, limit: int = 100) -> List[Product]:
    return db.query(Product).offset(skip).limit(limit).all()

def get_product_by_id(db: Session, product_id: int) -> Product:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

def update_product(db: Session, product_id: int, product_in: ProductUpdate) -> Product:
    db_product = get_product_by_id(db, product_id)
    
    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)
        
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int) -> None:
    db_product = get_product_by_id(db, product_id)
    db.delete(db_product)
    db.commit()

def search_products(
    db: Session,
    query: Optional[str] = None,
    category_id: Optional[int] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    min_discount: Optional[float] = None,
    in_stock: Optional[bool] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    page: int = 1,
    limit: int = 20
) -> Dict[str, Any]:
    """Advanced product search with multiple filters and pagination."""
    # Build base query with inventory join
    q = db.query(Product).outerjoin(Inventory)
    
    # Search query - search in name, description, and brand
    if query:
        search_pattern = f"%{query}%"
        q = q.filter(
            or_(
                Product.name.ilike(search_pattern),
                Product.description.ilike(search_pattern),
                Product.brand.ilike(search_pattern)
            )
        )
    
    # Category filter
    if category_id:
        q = q.filter(Product.category_id == category_id)
    
    # Brand filter
    if brand:
        q = q.filter(Product.brand.ilike(f"%{brand}%"))
    
    # Price range filter
    if min_price is not None:
        q = q.filter(Product.price >= min_price)
    if max_price is not None:
        q = q.filter(Product.price <= max_price)
    
    # Rating filter
    if min_rating is not None:
        q = q.filter(Product.rating >= min_rating)
    
    # Discount filter
    if min_discount is not None:
        q = q.filter(Product.discount_percentage >= min_discount)
    
    # Stock availability filter
    if in_stock is not None:
        if in_stock:
            q = q.filter(Inventory.quantity > 0)
        else:
            q = q.filter(Inventory.quantity <= 0)
    
    # Get total count before pagination
    total = q.count()
    
    # Sorting logic
    sort_mapping = {
        "price": Product.price,
        "rating": Product.rating,
        "discount": Product.discount_percentage,
        "created_at": Product.created_at,
        "name": Product.name,
        "popularity": Product.rating  # Using rating as popularity proxy
    }
    
    sort_field = sort_mapping.get(sort_by, Product.created_at)
    if sort_order == "desc":
        q = q.order_by(desc(sort_field))
    else:
        q = q.order_by(asc(sort_field))
    
    # Pagination
    offset = (page - 1) * limit
    products = q.offset(offset).limit(limit).all()
    
    # Calculate pagination metadata
    total_pages = (total + limit - 1) // limit if total > 0 else 1
    
    return {
        "products": products,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1
    }


def get_filter_metadata(db: Session) -> Dict[str, Any]:
    """Get available filter options from database."""
    # Get all categories
    categories = db.query(Category).all()
    
    # Get all unique brands
    brands = db.query(Product.brand).filter(Product.brand.isnot(None)).distinct().all()
    brand_list = [b[0] for b in brands if b[0]]
    
    # Get price range
    price_stats = db.query(
        func.min(Product.price).label('min_price'),
        func.max(Product.price).label('max_price')
    ).first()
    
    # Get rating range
    rating_stats = db.query(
        func.min(Product.rating).label('min_rating'),
        func.max(Product.rating).label('max_rating')
    ).first()
    
    # Get discount range
    discount_stats = db.query(
        func.min(Product.discount_percentage).label('min_discount'),
        func.max(Product.discount_percentage).label('max_discount')
    ).first()
    
    return {
        "categories": [{"id": c.id, "name": c.name} for c in categories],
        "brands": sorted(brand_list),
        "price_range": {
            "min": float(price_stats.min_price) if price_stats.min_price else 0,
            "max": float(price_stats.max_price) if price_stats.max_price else 0
        },
        "rating_range": {
            "min": float(rating_stats.min_rating) if rating_stats.min_rating else 0,
            "max": float(rating_stats.max_rating) if rating_stats.max_rating else 5
        },
        "discount_range": {
            "min": float(discount_stats.min_discount) if discount_stats.min_discount else 0,
            "max": float(discount_stats.max_discount) if discount_stats.max_discount else 0
        }
    }


def get_search_suggestions(db: Session, query: str, limit: int = 10) -> List[str]:
    """Get autocomplete suggestions for search."""
    if not query or len(query) < 2:
        return []
    
    search_pattern = f"%{query}%"
    suggestions = db.query(Product.name).filter(
        Product.name.ilike(search_pattern)
    ).limit(limit).all()
    
    return [s[0] for s in suggestions]

def upload_product_image(db: Session, product_id: int, filename: str, file_content: bytes) -> dict:
    """Save uploaded image securely and update product.image_url."""
    product = get_product_by_id(db, product_id)
    
    file_ext = Path(filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds 5MB limit"
        )
    
    try:
        safe_name = secure_filename(filename.split('.')[0] or 'product')
        if not safe_name:
            safe_name = 'product'
        unique_name = f"{uuid.uuid4().hex}_{safe_name}{file_ext}"
        
        base_upload_dir = Path(os.getcwd()) / "uploads"
        base_upload_dir.mkdir(exist_ok=True, mode=0o755)
        
        # Resolve to absolute path and verify it stays within uploads dir
        file_path = (base_upload_dir / unique_name).resolve()
        base_resolved = base_upload_dir.resolve()
        
        if not str(file_path).startswith(str(base_resolved)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file path"
            )
        
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        product.image_url = f"/uploads/{unique_name}"
        db.commit()
        db.refresh(product)
        
        return {"image_url": product.image_url}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload image"
        )
