from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from datetime import datetime
from sqlalchemy.orm import relationship
from app.database.base import Base

class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    url = Column(String, nullable=False)
    public_id = Column(String, nullable=False)

    product = relationship("Product", back_populates="product_images")
