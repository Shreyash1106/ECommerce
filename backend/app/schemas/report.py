from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, ConfigDict

class SalesReport(BaseModel):
    total_sales: int
    total_revenue: float
    monthly_breakdown: List[dict]

class OrderReport(BaseModel):
    total_orders: int
    delivered_orders: int
    pending_orders: int
    cancelled_orders: int

class UserReport(BaseModel):
    total_users: int
    new_users: int
    active_users: int

class RevenueReport(BaseModel):
    daily_revenue: List[dict]
    monthly_revenue: List[dict]
    yearly_revenue: List[dict]

class ReportExportFormat(str, Enum):
    csv = "csv"
    excel = "excel"

class ReportQueryParams(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    format: Optional[ReportExportFormat] = None

    model_config = ConfigDict(from_attributes=True)
