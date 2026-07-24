from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, asc
from fastapi import HTTPException, status
import re
import unicodedata

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
    """Create a new product with validation and automatic inventory creation."""
    if product_in.category_id:
        category = db.query(Category).filter(Category.id == product_in.category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category with ID {product_in.category_id} does not exist."
            )
    
    db_product = Product(
        name=product_in.name,
        category_id=product_in.category_id,
        description=product_in.description,
        price=product_in.price,
        brand=product_in.brand,
        rating=product_in.rating or 0.0,
        discount_percentage=product_in.discount_percentage or 0.0,
        color=product_in.color,
        size=product_in.size,
        material=product_in.material,
        image_url=product_in.image_url
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    # Automatically create inventory record
    stock_qty = product_in.stock if product_in.stock is not None else 0
    inv = Inventory(
        product_id=db_product.id,
        quantity=stock_qty,
        in_stock=stock_qty > 0
    )
    db.add(inv)
    db.commit()
    db.refresh(db_product)

    return db_product

def get_products(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    q: Optional[str] = None,
    category_id: Optional[int] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    in_stock: Optional[bool] = None,
    sort_by: Optional[str] = "created_at"
) -> List[Product]:
    """Get products with comprehensive filtering and sorting."""
    query = db.query(Product).options(joinedload(Product.inventory), joinedload(Product.category))

    # 1. Search Query Filter
    if q and q.strip():
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.description.ilike(search_term),
                Product.brand.ilike(search_term)
            )
        )

    # 2. Category Filter
    if category_id is not None and category_id > 0:
        query = query.filter(Product.category_id == category_id)

    # 3. Brand Filter
    if brand and brand.strip() and brand.lower() != "all":
        query = query.filter(Product.brand.ilike(f"%{brand.strip()}%"))

    # 4. Price Bounds Filter
    if min_price is not None and min_price >= 0:
        query = query.filter(Product.price >= min_price)
    if max_price is not None and max_price > 0:
        query = query.filter(Product.price <= max_price)

    # 5. Rating Filter
    if min_rating is not None and min_rating > 0:
        query = query.filter(Product.rating >= min_rating)

    # 6. In Stock Filter
    if in_stock:
        query = query.join(Inventory).filter(Inventory.quantity > 0)

    # 7. Sorting Order
    if sort_by == "price_asc":
        query = query.order_by(asc(Product.price))
    elif sort_by == "price_desc":
        query = query.order_by(desc(Product.price))
    elif sort_by == "rating":
        query = query.order_by(desc(Product.rating))
    elif sort_by == "discount":
        query = query.order_by(desc(Product.discount_percentage))
    else:
        query = query.order_by(desc(Product.created_at))

    return query.offset(skip).limit(limit).all()

def get_product_by_id(db: Session, product_id: int) -> Product:
    """Get a product by ID with inventory and category."""
    product = db.query(Product).options(joinedload(Product.inventory), joinedload(Product.category)).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    return product

def update_product(db: Session, product_id: int, product_in: ProductUpdate) -> Product:
    """Update an existing product."""
    product = get_product_by_id(db, product_id)
    if product_in.name is not None:
        product.name = product_in.name
    if product_in.description is not None:
        product.description = product_in.description
    if product_in.price is not None:
        product.price = product_in.price
    if product_in.category_id is not None:
        product.category_id = product_in.category_id
    if product_in.brand is not None:
        product.brand = product_in.brand
    if product_in.rating is not None:
        product.rating = product_in.rating
    if product_in.discount_percentage is not None:
        product.discount_percentage = product_in.discount_percentage
    if product_in.image_url is not None:
        product.image_url = product_in.image_url
    if product_in.color is not None:
        product.color = product_in.color
    if product_in.size is not None:
        product.size = product_in.size
    if product_in.material is not None:
        product.material = product_in.material

    if product_in.stock is not None:
        inv = db.query(Inventory).filter(Inventory.product_id == product.id).first()
        if not inv:
            inv = Inventory(product_id=product.id, quantity=product_in.stock, in_stock=product_in.stock > 0)
            db.add(inv)
        else:
            inv.quantity = product_in.stock
            inv.in_stock = product_in.stock > 0

    db.commit()
    db.refresh(product)
    return product

def delete_product(db: Session, product_id: int) -> None:
    """Delete a product by ID."""
    product = get_product_by_id(db, product_id)
    db.delete(product)
    db.commit()

def approve_product(db: Session, product_id: int, is_approved: bool = True) -> Product:
    """Approve or reject a vendor product."""
    product = get_product_by_id(db, product_id)
    product.is_approved = is_approved
    db.commit()
    db.refresh(product)
    return product


