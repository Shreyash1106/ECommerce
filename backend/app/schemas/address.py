from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class AddressBase(BaseModel):
    line1: str = Field(..., min_length=1, max_length=255, description="Street address line 1")
    line2: Optional[str] = Field(None, max_length=255, description="Apartment, suite, unit, etc.")
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    zip_code: str = Field(..., min_length=1, max_length=20)
    country: str = Field(default="India", min_length=1, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    is_default: bool = Field(default=False)

class AddressCreate(AddressBase):
    pass

class AddressUpdate(BaseModel):
    line1: Optional[str] = Field(None, min_length=1, max_length=255)
    line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    state: Optional[str] = Field(None, min_length=1, max_length=100)
    zip_code: Optional[str] = Field(None, min_length=1, max_length=20)
    country: Optional[str] = Field(None, min_length=1, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)
    is_default: Optional[bool] = None

class AddressResponse(AddressBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)
