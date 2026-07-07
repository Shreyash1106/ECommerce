from sqlalchemy import Column, Integer, String, DateTime, func, Boolean
from sqlalchemy.orm import relationship
from app.database.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(length=100), nullable=False)
    last_name = Column(String(length=100), nullable=False)
    username = Column(String(length=50), unique=True, index=True, nullable=False)
    email = Column(String(length=255), unique=True, index=True, nullable=False)
    phone = Column(String(length=20), unique=True, index=True, nullable=True)
    avatar_url = Column(String(length=1024), nullable=True)
    password = Column(String(length=255), nullable=False)
    role = Column(String(50), default="customer", nullable=False)  # admin, vendor, customer
    notify_new_orders = Column(Boolean, default=True, nullable=False)
    notify_low_stock_alerts = Column(Boolean, default=True, nullable=False)
    notify_user_activity = Column(Boolean, default=True, nullable=False)
    notify_system_updates = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")
    addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    wishlist_items = relationship("WishlistItem", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")

    saved_searches = relationship("SavedSearch", back_populates="user", cascade="all, delete-orphan")
