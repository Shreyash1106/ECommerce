from typing import List
from pydantic import BaseModel

class DashboardSummary(BaseModel):
    total_users: int
    total_products: int
    total_orders: int
    total_revenue: float

    class Config:
        orm_mode = True

class SalesDataPoint(BaseModel):
    date: str  # ISO format (YYYY-MM-DD) for daily, YYYY-MM for monthly, YYYY for yearly
    revenue: float

class SalesAnalytics(BaseModel):
    daily_sales: List[SalesDataPoint]
    monthly_sales: List[SalesDataPoint]
    yearly_sales: List[SalesDataPoint]

    class Config:
        orm_mode = True

class TopProduct(BaseModel):
    product_name: str
    total_orders: int
    total_revenue: float

    class Config:
        orm_mode = True

class RecentOrder(BaseModel):
    order_id: int
    user_id: int
    product_id: int
    quantity: int
    total_price: float
    created_at: str

    class Config:
        orm_mode = True
