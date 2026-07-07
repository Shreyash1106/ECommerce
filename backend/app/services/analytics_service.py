from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, cast, Date, extract
from datetime import datetime, timedelta

from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from app.constants.analytics import (
    DAYS_30, DAYS_60, DAYS_365,
    TOP_PRODUCTS_LIMIT, RECENT_ORDERS_LIMIT,
    TREND_DECIMAL_PLACES
)


def get_total_users(db: Session) -> int:
    return db.query(func.count(User.id)).scalar() or 0


def get_total_products(db: Session) -> int:
    return db.query(func.count(Product.id)).scalar() or 0


def get_total_orders(db: Session) -> int:
    return db.query(func.count(Order.id)).scalar() or 0


def get_total_revenue(db: Session) -> float:
    # Sum total_price across orders, default to 0.0, and cast to float
    return float(db.query(func.coalesce(func.sum(Order.total_price), 0.0)).scalar())


def get_new_customers(db: Session) -> int:
    cutoff = datetime.utcnow() - timedelta(days=DAYS_30)
    return db.query(func.count(User.id)).filter(User.created_at >= cutoff).scalar() or 0


def _trend(current: float, previous: float) -> float:
    if previous == 0:
        return 0.0
    return round(((current - previous) / previous) * 100, TREND_DECIMAL_PLACES)


def get_revenue_trend(db: Session) -> float:
    now = datetime.utcnow()
    cur = db.query(func.coalesce(func.sum(Order.total_price), 0.0)).filter(
        Order.created_at >= now - timedelta(days=DAYS_30)
    ).scalar() or 0.0
    prev = db.query(func.coalesce(func.sum(Order.total_price), 0.0)).filter(
        Order.created_at >= now - timedelta(days=DAYS_60),
        Order.created_at < now - timedelta(days=DAYS_30)
    ).scalar() or 0.0
    return _trend(cur, prev)


def get_orders_trend(db: Session) -> float:
    now = datetime.utcnow()
    cur = db.query(func.count(Order.id)).filter(Order.created_at >= now - timedelta(days=DAYS_30)).scalar() or 0
    prev = db.query(func.count(Order.id)).filter(
        Order.created_at >= now - timedelta(days=DAYS_60),
        Order.created_at < now - timedelta(days=DAYS_30)
    ).scalar() or 0
    return _trend(cur, prev)


def get_products_trend(db: Session) -> float:
    now = datetime.utcnow()
    cur = db.query(func.count(Product.id)).filter(Product.created_at >= now - timedelta(days=DAYS_30)).scalar() or 0
    prev = db.query(func.count(Product.id)).filter(
        Product.created_at >= now - timedelta(days=DAYS_60),
        Product.created_at < now - timedelta(days=DAYS_30)
    ).scalar() or 0
    return _trend(cur, prev)


def get_users_trend(db: Session) -> float:
    now = datetime.utcnow()
    cur = db.query(func.count(User.id)).filter(User.created_at >= now - timedelta(days=DAYS_30)).scalar() or 0
    prev = db.query(func.count(User.id)).filter(
        User.created_at >= now - timedelta(days=DAYS_60),
        User.created_at < now - timedelta(days=DAYS_30)
    ).scalar() or 0
    return _trend(cur, prev)


def get_dashboard_summary(db: Session) -> Dict[str, Any]:
    return {
        "total_users": get_total_users(db),
        "total_products": get_total_products(db),
        "total_orders": get_total_orders(db),
        "total_revenue": get_total_revenue(db),
        "new_customers": get_new_customers(db),
        "revenue_trend": get_revenue_trend(db),
        "orders_trend": get_orders_trend(db),
        "products_trend": get_products_trend(db),
        "users_trend": get_users_trend(db),
    }


def get_sales_analytics(db: Session) -> Dict[str, List[Dict[str, Any]]]:
    now = datetime.utcnow()

    # Daily - last 30 days grouped by date
    daily_rows = (
        db.query(
            cast(Order.created_at, Date).label("day"),
            func.coalesce(func.sum(Order.total_price), 0).label("revenue")
        )
        .filter(Order.created_at >= now - timedelta(days=DAYS_30))
        .group_by(cast(Order.created_at, Date))
        .order_by(cast(Order.created_at, Date))
        .all()
    )
    daily_data = [{"date": str(day), "revenue": float(rev)} for day, rev in daily_rows]

    # Monthly - last 12 months grouped by year+month
    monthly_rows = (
        db.query(
            extract("year", Order.created_at).label("year"),
            extract("month", Order.created_at).label("month"),
            func.coalesce(func.sum(Order.total_price), 0).label("revenue")
        )
        .filter(Order.created_at >= now - timedelta(days=DAYS_365))
        .group_by(
            extract("year", Order.created_at),
            extract("month", Order.created_at)
        )
        .order_by(
            extract("year", Order.created_at),
            extract("month", Order.created_at)
        )
        .all()
    )
    monthly_data = [
        {"month": f"{int(year)}-{int(month):02d}", "revenue": float(rev)}
        for year, month, rev in monthly_rows
    ]
    # Build monthly order counts using the same grouping
    monthly_orders = [
        {"month": f"{int(year)}-{int(month):02d}", "orders": int(db.query(func.count(Order.id))
            .filter(extract("year", Order.created_at) == year, extract("month", Order.created_at) == month)
            .scalar() or 0)}
        for year, month, _ in monthly_rows
    ]

    # Yearly
    yearly_rows = (
        db.query(
            extract("year", Order.created_at).label("year"),
            func.coalesce(func.sum(Order.total_price), 0).label("revenue")
        )
        .group_by(extract("year", Order.created_at))
        .order_by(extract("year", Order.created_at))
        .all()
    )
    yearly_data = [{"year": str(int(year)), "revenue": float(rev)} for year, rev in yearly_rows]

    return {
        "daily_sales": daily_data,
        "monthly_sales": monthly_data,
        "yearly_sales": yearly_data,
        "monthly_orders": monthly_orders,
    }


def get_top_selling_products(db: Session, limit: int = TOP_PRODUCTS_LIMIT) -> List[Dict[str, Any]]:
    subquery = (
        db.query(
            Order.product_id.label("product_id"),
            func.sum(Order.quantity).label("total_quantity"),
            func.coalesce(func.sum(Order.total_price), 0).label("total_revenue")
        )
        .group_by(Order.product_id)
        .subquery()
    )
    rows = (
        db.query(Product.name, subquery.c.total_quantity, subquery.c.total_revenue)
        .join(subquery, Product.id == subquery.c.product_id)
        .order_by(desc(subquery.c.total_quantity))
        .limit(limit)
        .all()
    )
    return [
        {"product_name": name, "total_orders": int(qty), "total_revenue": float(rev)}
        for name, qty, rev in rows
    ]


def get_recent_orders(db: Session, limit: int = RECENT_ORDERS_LIMIT) -> List[Dict[str, Any]]:
    from sqlalchemy.orm import joinedload
    rows = (
        db.query(Order)
        .options(joinedload(Order.user), joinedload(Order.product))
        .order_by(desc(Order.created_at))
        .limit(limit)
        .all()
    )
    return [
        {
            "order_id": o.id,
            "user_id": o.user_id,
            "product_id": o.product_id,
            "customer": f"{o.user.first_name} {o.user.last_name}" if o.user else f"User #{o.user_id}",
            "email": o.user.email if o.user else "",
            "product_name": o.product.name if o.product else f"Product #{o.product_id}",
            "quantity": o.quantity,
            "total_price": float(o.total_price),
            "status": o.status,
            "created_at": o.created_at.isoformat(),
        }
        for o in rows
    ]
