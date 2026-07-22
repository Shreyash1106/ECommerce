from typing import List
from fastapi import APIRouter, Depends, status, Path, HTTPException
from sqlalchemy.orm import Session

from app.schemas.address import AddressCreate, AddressUpdate, AddressResponse
from app.services import address_service
from app.database.session import get_db
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(tags=["Addresses"])

@router.get("", response_model=List[AddressResponse])
def get_user_addresses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all saved addresses for current authenticated user."""
    return address_service.get_addresses(db, user_id=current_user.id)

@router.post("", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
def create_address(
    payload: AddressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new address for current user."""
    return address_service.create_address(db, user_id=current_user.id, payload=payload)

@router.get("/{address_id}", response_model=AddressResponse)
def get_address(
    address_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get address by ID."""
    return address_service.get_address_by_id(db, address_id=address_id, user_id=current_user.id)

@router.put("/{address_id}", response_model=AddressResponse)
def update_address(
    payload: AddressUpdate,
    address_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update address by ID."""
    return address_service.update_address(db, address_id=address_id, user_id=current_user.id, payload=payload)

@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(
    address_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete address by ID."""
    address_service.delete_address(db, address_id=address_id, user_id=current_user.id)
    return None

@router.put("/{address_id}/default", response_model=AddressResponse)
def set_default_address(
    address_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Set address as primary default address."""
    return address_service.set_default_address(db, address_id=address_id, user_id=current_user.id)
