from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database.base import Base

class SavedSearch(Base):
    __tablename__ = "saved_searches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    search_query = Column(String(1000), nullable=False)  # JSON string of search parameters
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # relationship back to User
    user = relationship("User", back_populates="saved_searches")
