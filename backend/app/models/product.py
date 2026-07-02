from sqlalchemy import Column, Integer, String, Text, Float, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(length=255), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    image_url = Column(String(length=255), nullable=True)

    category = relationship("Category", back_populates="products")
    product_images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    inventory = relationship("Inventory", back_populates="product", uselist=False)
    wishlisted_by = relationship("WishlistItem", back_populates="product")
    orders = relationship("Order", back_populates="product")
