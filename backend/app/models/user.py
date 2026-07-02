from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.database.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(length=255), nullable=False)
    email = Column(String(length=255), unique=True, index=True, nullable=False)
    password = Column(String(length=255), nullable=False)
    role = Column(String(50), default="customer", nullable=False)  # admin, vendor, customer
    notify_new_orders = Column(Integer, default=1, nullable=False)
    notify_low_stock_alerts = Column(Integer, default=1, nullable=False)
    notify_user_activity = Column(Integer, default=1, nullable=False)
    notify_system_updates = Column(Integer, default=1, nullable=False)
    is_verified = Column(Integer, default=0, nullable=False)
    is_admin = Column(Integer, default=0, nullable=False)
    is_active = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")
    addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    wishlist_items = relationship("WishlistItem", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
