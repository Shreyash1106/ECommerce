from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.address import Address
from app.schemas.address import AddressCreate, AddressUpdate

def get_addresses(db: Session, user_id: int) -> List[Address]:
    """Get all saved addresses for a user, ordered by is_default DESC and ID DESC."""
    return db.query(Address).filter(Address.user_id == user_id).order_by(Address.is_default.desc(), Address.id.desc()).all()

def get_address_by_id(db: Session, address_id: int, user_id: int) -> Address:
    """Get specific address by ID belonging to user."""
    addr = db.query(Address).filter(Address.id == address_id, Address.user_id == user_id).first()
    if not addr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )
    return addr

def _unset_other_defaults(db: Session, user_id: int, exclude_id: int = None):
    """Internal helper to set is_default=False on all other user addresses."""
    q = db.query(Address).filter(Address.user_id == user_id)
    if exclude_id:
        q = q.filter(Address.id != exclude_id)
    q.update({"is_default": False}, synchronize_session=False)

def create_address(db: Session, user_id: int, payload: AddressCreate) -> Address:
    """Create a new address for user."""
    # Check existing count
    existing_count = db.query(Address).filter(Address.user_id == user_id).count()
    
    # If this is the user's first address or is_default is explicitly True, set default
    should_be_default = payload.is_default or existing_count == 0

    if should_be_default:
        _unset_other_defaults(db, user_id=user_id)

    db_address = Address(
        user_id=user_id,
        line1=payload.line1,
        line2=payload.line2,
        city=payload.city,
        state=payload.state,
        zip_code=payload.zip_code,
        country=payload.country,
        phone_number=payload.phone_number,
        is_default=should_be_default
    )
    db.add(db_address)
    db.commit()
    db.refresh(db_address)
    return db_address

def update_address(db: Session, address_id: int, user_id: int, payload: AddressUpdate) -> Address:
    """Update an existing address for user."""
    db_address = get_address_by_id(db, address_id, user_id)
    update_data = payload.model_dump(exclude_unset=True)

    if update_data.get("is_default") is True:
        _unset_other_defaults(db, user_id=user_id, exclude_id=address_id)

    for field, val in update_data.items():
        setattr(db_address, field, val)

    db.commit()
    db.refresh(db_address)
    return db_address

def delete_address(db: Session, address_id: int, user_id: int) -> None:
    """Delete an address by ID."""
    db_address = get_address_by_id(db, address_id, user_id)
    was_default = db_address.is_default

    db.delete(db_address)
    db.commit()

    # If deleted address was default, promote the latest remaining address to default
    if was_default:
        latest = db.query(Address).filter(Address.user_id == user_id).order_by(Address.id.desc()).first()
        if latest:
            latest.is_default = True
            db.commit()

def set_default_address(db: Session, address_id: int, user_id: int) -> Address:
    """Set specified address as default."""
    target = get_address_by_id(db, address_id, user_id)
    _unset_other_defaults(db, user_id=user_id, exclude_id=address_id)
    target.is_default = True
    db.commit()
    db.refresh(target)
    return target
