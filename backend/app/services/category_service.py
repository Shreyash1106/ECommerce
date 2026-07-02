from typing import List
from fastapi import HTTPException, status

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate

def create_category(db, category_in: CategoryCreate) -> Category:
    db_category = Category(name=category_in.name, description=category_in.description)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_categories(db, skip: int = 0, limit: int = 100) -> List[Category]:
    return db.query(Category).offset(skip).limit(limit).all()

def get_category(db, category_id: int) -> Category:
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category

def update_category(db, category_id: int, category_in: CategoryUpdate) -> Category:
    db_category = get_category(db, category_id)
    if category_in.name is not None:
        db_category.name = category_in.name
    if category_in.description is not None:
        db_category.description = category_in.description
    db.commit()
    db.refresh(db_category)
    return db_category

def delete_category(db, category_id: int) -> None:
    db_category = get_category(db, category_id)
    db.delete(db_category)
    db.commit()
