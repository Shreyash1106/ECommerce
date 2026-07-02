from sqlalchemy import Column, Integer, String, Text
from app.database.base import Base
from sqlalchemy.orm import relationship

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(length=255), nullable=False, unique=True)
    description = Column(Text, nullable=True)

    # Relationship to products
    products = relationship("Product", back_populates="category")
