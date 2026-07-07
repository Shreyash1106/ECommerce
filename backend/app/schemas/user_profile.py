from datetime import datetime
from pydantic import BaseModel, ConfigDict

class UserProfile(BaseModel):
    id: int
    first_name: str
    last_name: str
    username: str
    email: str
    phone: str | None = None
    avatar_url: str | None = None
    role: str
    is_verified: bool
    is_active: bool
    created_at: datetime
    total_orders: int
    total_spent: float

    model_config = ConfigDict(from_attributes=True)
