from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String, func
from sqlalchemy.orm import relationship
from app.database.base import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True, index=True)
    payment_id = Column(String(100), unique=True, index=True, nullable=False)
    transaction_id = Column(String(100), unique=True, index=True, nullable=False)
    receipt_number = Column(String(100), unique=True, index=True, nullable=False)
    gateway_name = Column(String(50), default="MockPay Enterprise", nullable=False)
    payment_method = Column(String(50), default="Credit Card", nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD", nullable=False)
    status = Column(String(50), default="Pending", nullable=False)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User")
    order = relationship("Order")
