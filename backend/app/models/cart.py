from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False, default=1)

    # Relationships for convenience
    user = relationship("User", back_populates="cart_items")
    product = relationship("Product")
