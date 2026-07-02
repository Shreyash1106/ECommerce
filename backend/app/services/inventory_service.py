from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.inventory import Inventory
from app.models.product import Product
from app.schemas.inventory import InventoryCreate, InventoryUpdate


def get_inventory(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Inventory).offset(skip).limit(limit).all()


def get_inventory_by_product(db: Session, product_id: int):
    inventory = db.query(Inventory).filter(Inventory.product_id == product_id).first()
    if not inventory:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory not found for product")
    return inventory


def create_inventory(db: Session, payload: InventoryCreate):
    if not db.query(Product).filter(Product.id == payload.product_id).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    if db.query(Inventory).filter(Inventory.product_id == payload.product_id).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inventory already exists for this product")
    inventory = Inventory(**payload.model_dump())
    db.add(inventory)
    db.commit()
    db.refresh(inventory)
    return inventory


def update_inventory(db: Session, product_id: int, payload: InventoryUpdate):
    inventory = db.query(Inventory).filter(Inventory.product_id == product_id).first()
    if not inventory:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(inventory, field, value)
    db.commit()
    db.refresh(inventory)
    return inventory


def get_low_stock(db: Session):
    return db.query(Inventory).filter(Inventory.quantity <= Inventory.low_stock_threshold).all()
