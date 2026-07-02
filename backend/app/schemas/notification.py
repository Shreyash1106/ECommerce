from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class NotificationBase(BaseModel):
    message: str = Field(..., description="Notification message text")
    type: str = Field(..., description="Notification type, e.g., 'order', 'stock', 'system'")
    is_read: bool = Field(default=False, description="Read status of the notification")

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
