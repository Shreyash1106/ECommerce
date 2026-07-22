from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict, model_validator

class UserCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20, pattern=r"^[+]?[\d\s-]{10,20}$")
    password: str = Field(..., min_length=8)
    role: Literal["customer", "vendor"] = Field(default="customer")

class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    username: Optional[str] = Field(None, min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20, pattern=r"^[+]?[\d\s-]{10,20}$")
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
    first_name: str
    last_name: str
    username: str
    email: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Literal["customer", "vendor", "admin"]
    notify_new_orders: bool
    notify_low_stock_alerts: bool
    notify_user_activity: bool
    notify_system_updates: bool
    is_verified: bool
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class MessageResponse(BaseModel):
    message: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

