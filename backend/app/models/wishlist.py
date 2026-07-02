from sqlalchemy import Column, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database.base import Base

class WishlistItem(Base):
    __tablename__ = "wishlist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships (optional for eager loading)
    user = relationship("User", back_populates="wishlist_items")
    product = relationship("Product", back_populates="wishlisted_by")
