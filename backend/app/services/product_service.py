from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import os
import re
import uuid
import unicodedata
from pathlib import Path

from app.models.product import Product
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

def search_products(db: Session, query: str = None, category_id: int = None, 
                    min_price: float = None, max_price: float = None,
                    sort_by: str = None, sort_order: str = "asc",
                    page: int = 1, limit: int = 20) -> List[Product]:
    """Search and filter products with proper validation."""
    q = db.query(Product)
    
    if query:
        q = q.filter(Product.name.ilike(f"%{query}%"))
    if category_id:
        q = q.filter(Product.category_id == category_id)
    if min_price is not None:
        q = q.filter(Product.price >= min_price)
    if max_price is not None:
        q = q.filter(Product.price <= max_price)
    
    if sort_by and hasattr(Product, sort_by):
        sort_attr = getattr(Product, sort_by)
        q = q.order_by(sort_attr.desc() if sort_order == "desc" else sort_attr.asc())
    
    offset = (page - 1) * limit
    return q.offset(offset).limit(limit).all()

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
