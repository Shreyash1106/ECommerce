from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String, func
from sqlalchemy.orm import relationship
from app.database.base import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False, default=1)
    total_price = Column(Float, nullable=False)
    status = Column(String(50), nullable=False, default="Pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="orders")
    product = relationship("Product", back_populates="orders")

    @property
    def customer(self):
        return f"{self.user.first_name} {self.user.last_name}" if self.user else None

    @property
    def email(self):
        return self.user.email if self.user else None

    @property
    def product_name(self):
        return self.product.name if self.product else None
