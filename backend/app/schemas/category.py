from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]

    model_config = ConfigDict(from_attributes=True)
