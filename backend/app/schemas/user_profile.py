from datetime import datetime
from pydantic import BaseModel, ConfigDict

class UserProfile(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime
    total_orders: int
    total_spent: float

    model_config = ConfigDict(from_attributes=True)
