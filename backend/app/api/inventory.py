from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.schemas.inventory import InventoryResponse, InventoryCreate, InventoryUpdate
from app.services import inventory_service
from app.database.session import get_db
from app.core.security import get_current_user

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("/", response_model=List[InventoryResponse])
def list_inventory(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return inventory_service.get_inventory(db, skip, limit)

@router.get("/low-stock", response_model=List[InventoryResponse])
def low_stock_items(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return inventory_service.get_low_stock(db)

@router.get("/product/{product_id}", response_model=InventoryResponse)
def get_inventory_by_product(product_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return inventory_service.get_inventory_by_product(db, product_id)

@router.post("/", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED)
def create_inventory(payload: InventoryCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return inventory_service.create_inventory(db, payload)

@router.put("/product/{product_id}", response_model=InventoryResponse)
def update_inventory(product_id: int, payload: InventoryUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return inventory_service.update_inventory(db, product_id, payload)
