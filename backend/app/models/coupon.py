from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, func
from app.database.base import Base

class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(length=50), unique=True, nullable=False, index=True)
    discount_type = Column(String(length=20), nullable=False)  # "percentage" or "fixed"
    discount_value = Column(Float, nullable=False)  # percent (0-100) or fixed amount
    max_uses = Column(Integer, nullable=True)  # total usage limit, None = unlimited
    used_count = Column(Integer, default=0, nullable=False)
    expiry_date = Column(DateTime(timezone=True), nullable=True)  # None = no expiry
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def is_valid(self) -> bool:
        """Check if the coupon can still be used."""
        if not self.active:
            return False
        now = datetime.utcnow()
        if self.expiry_date and now > self.expiry_date:
            return False
        if self.max_uses is not None and self.used_count >= self.max_uses:
            return False
        return True
