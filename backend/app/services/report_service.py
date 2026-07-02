from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc

from app.models.user import User
from app.models.order import Order
from app.models.product import Product


def _apply_date_filter(query, model, start_date: Optional[datetime], end_date: Optional[datetime]):
    if start_date:
        query = query.filter(model.created_at >= start_date)
    if end_date:
        query = query.filter(model.created_at <= end_date)
    return query


def get_sales_report(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> Dict[str, Any]:
    """Return total sales count, total revenue, and monthly breakdown."""
    base_q = db.query(func.count(Order.id).label('total_sales'), func.coalesce(func.sum(Order.total_price), 0).label('total_revenue'))
    base_q = _apply_date_filter(base_q, Order, start_date, end_date)
    total_sales, total_revenue = base_q.one()

    # Monthly breakdown
    monthly_q = (
        db.query(func.date_trunc('month', Order.created_at).label('month'), func.coalesce(func.sum(Order.total_price), 0).label('revenue'))
    )
    monthly_q = _apply_date_filter(monthly_q, Order, start_date, end_date)
    monthly_q = monthly_q.group_by('month').order_by('month')
    monthly = [{"month": month.strftime('%Y-%m'), "revenue": float(rev)} for month, rev in monthly_q.all()]

    return {
        "total_sales": int(total_sales or 0),
        "total_revenue": float(total_revenue or 0.0),
        "monthly_breakdown": monthly,
    }


def get_order_report(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> Dict[str, Any]:
    """Return order statistics. Status fields are placeholders due to missing status column."""
    base_q = db.query(func.count(Order.id).label('total_orders'))
    base_q = _apply_date_filter(base_q, Order, start_date, end_date)
    total_orders = base_q.scalar() or 0

    # Placeholder status counts (all orders considered as 'delivered')
    delivered = total_orders
    pending = 0
    cancelled = 0

    return {
        "total_orders": int(total_orders),
        "delivered_orders": delivered,
        "pending_orders": pending,
        "cancelled_orders": cancelled,
    }


def get_user_report(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> Dict[str, Any]:
    """Return user statistics. New/active users are placeholders as model lacks timestamps."""
    total_users = db.query(func.count(User.id)).scalar() or 0
    new_users = 0
    active_users = 0
    return {
        "total_users": int(total_users),
        "new_users": new_users,
        "active_users": active_users,
    }


def get_revenue_report(db: Session, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> Dict[str, Any]:
    """Return daily, monthly, yearly revenue aggregates."""
    # Daily
    daily_q = db.query(func.date_trunc('day', Order.created_at).label('day'), func.coalesce(func.sum(Order.total_price), 0).label('revenue'))
    daily_q = _apply_date_filter(daily_q, Order, start_date, end_date)
    daily_q = daily_q.group_by('day').order_by('day')
    daily = [{"date": day.strftime('%Y-%m-%d'), "revenue": float(rev)} for day, rev in daily_q.all()]

    # Monthly
    monthly_q = db.query(func.date_trunc('month', Order.created_at).label('month'), func.coalesce(func.sum(Order.total_price), 0).label('revenue'))
    monthly_q = _apply_date_filter(monthly_q, Order, start_date, end_date)
    monthly_q = monthly_q.group_by('month').order_by('month')
    monthly = [{"month": month.strftime('%Y-%m'), "revenue": float(rev)} for month, rev in monthly_q.all()]

    # Yearly
    yearly_q = db.query(func.date_trunc('year', Order.created_at).label('year'), func.coalesce(func.sum(Order.total_price), 0).label('revenue'))
    yearly_q = _apply_date_filter(yearly_q, Order, start_date, end_date)
    yearly_q = yearly_q.group_by('year').order_by('year')
    yearly = [{"year": year.strftime('%Y'), "revenue": float(rev)} for year, rev in yearly_q.all()]

    return {
        "daily_revenue": daily,
        "monthly_revenue": monthly,
        "yearly_revenue": yearly,
    }
