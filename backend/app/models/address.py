from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base

class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    line1 = Column(String(length=255), nullable=False)
    line2 = Column(String(length=255), nullable=True)
    city = Column(String(length=100), nullable=False)
    state = Column(String(length=100), nullable=False)
    zip_code = Column(String(length=20), nullable=False)
    country = Column(String(length=100), nullable=False)
    phone_number = Column(String(length=20), nullable=True)
    is_default = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="addresses")
