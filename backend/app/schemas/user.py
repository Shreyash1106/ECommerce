from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict, model_validator

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Optional[str] = Field(default="customer")  # admin, vendor, customer

class UserUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    notify_new_orders: Optional[bool] = None
    notify_low_stock_alerts: Optional[bool] = None
    notify_user_activity: Optional[bool] = None
    notify_system_updates: Optional[bool] = None

class PasswordUpdate(BaseModel):
    current_password: str = Field(..., min_length=8)
    new_password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)

    @model_validator(mode="after")
    def passwords_match(cls, values):
        if values.new_password != values.confirm_password:
            raise ValueError("New password and confirm password must match")
        return values

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    notify_new_orders: bool
    notify_low_stock_alerts: bool
    notify_user_activity: bool
    notify_system_updates: bool
    is_admin: int
    is_verified: int
    is_active: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
