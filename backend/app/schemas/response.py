from typing import Generic, TypeVar, Optional, List, Any
from pydantic import BaseModel

T = TypeVar("T")

class ErrorItem(BaseModel):
    field: Optional[str] = None
    message: str

class PaginatedMeta(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int

class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[T] = None
    meta: Optional[PaginatedMeta] = None
    errors: Optional[List[ErrorItem]] = None

def success_response(data: Any = None, message: str = "Operation completed successfully", meta: Optional[PaginatedMeta] = None) -> dict:
    res = {
        "success": True,
        "message": message,
        "data": data,
    }
    if meta is not None:
        res["meta"] = meta.model_dump() if hasattr(meta, "model_dump") else meta
    return res

def error_response(message: str = "An error occurred", errors: Optional[List[dict]] = None) -> dict:
    return {
        "success": False,
        "message": message,
        "errors": errors or [],
    }
