from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, cast, Date
from datetime import datetime, timedelta
from app.database.session import get_db
from app.core.security import get_current_user, get_current_admin_user, get_current_vendor_user
from app.models.user import User
from app.models.order import Order
from app.models.product import Product
from app.models.category import Category
from app.services import analytics_service
from app.constants.analytics import (
    DASHBOARD_TOP_PRODUCTS_LIMIT,
    DASHBOARD_RECENT_ORDERS_LIMIT,
    DAYS_30,
)

router = APIRouter(tags=["Analytics"])


@router.get("/dashboard")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    try:
        summary = analytics_service.get_dashboard_summary(db)
        sales = analytics_service.get_sales_analytics(db)
        top_products = analytics_service.get_top_selling_products(db, limit=DASHBOARD_TOP_PRODUCTS_LIMIT)
        recent_orders = analytics_service.get_recent_orders(db, limit=DASHBOARD_RECENT_ORDERS_LIMIT)
        return {
            "total_revenue": summary["total_revenue"],
            "total_orders": summary["total_orders"],
            "total_products": summary["total_products"],
            "total_users": summary["total_users"],
            "new_customers": summary["new_customers"],
            "revenue_trend": summary["revenue_trend"],
            "orders_trend": summary["orders_trend"],
            "products_trend": summary["products_trend"],
            "users_trend": summary["users_trend"],
            "revenue_data": sales["monthly_sales"],
            "monthly_orders": sales["monthly_orders"],
            "top_products": [
                {"id": i, "name": p["product_name"], "sales": p["total_orders"], "revenue": p["total_revenue"]}
                for i, p in enumerate(top_products, 1)
            ],
            "recent_orders": [
                {
                    "id": o["order_id"],
                    "user_id": o["user_id"],
                    "product_id": o["product_id"],
                    "customer": o["customer"],
                    "email": o["email"],
                    "product_name": o["product_name"],
                    "quantity": o["quantity"],
                    "total_price": o["total_price"],
                    "status": o["status"],
                    "created_at": o["created_at"],
                }
                for o in recent_orders
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/vendor")
def get_vendor_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_vendor_user)
):
    try:
        summary = analytics_service.get_dashboard_summary(db)
        sales = analytics_service.get_sales_analytics(db)
        return {
            "total_revenue": summary["total_revenue"],
            "total_orders": summary["total_orders"],
            "total_products": summary["total_products"],
            "new_customers": summary["new_customers"],
            "revenue_trend": summary["revenue_trend"],
            "orders_trend": summary["orders_trend"],
            "products_trend": summary["products_trend"],
            "revenue_data": sales["monthly_sales"],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/revenue")
def get_revenue_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    try:
        sales = analytics_service.get_sales_analytics(db)
        return {
            "daily_sales": sales["daily_sales"],
            "monthly_sales": sales["monthly_sales"],
            "yearly_sales": sales["yearly_sales"],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/orders")
def get_orders_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    try:
        now = datetime.utcnow()
        rows = (
            db.query(
                cast(Order.created_at, Date).label("day"),
                func.count(Order.id).label("orders")
            )
            .filter(Order.created_at >= now - timedelta(days=DAYS_30))
            .group_by(cast(Order.created_at, Date))
            .order_by(cast(Order.created_at, Date))
            .all()
        )
        return {
            "daily_orders": [
                {"date": str(day), "orders": int(orders)}
                for day, orders in rows
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/customers")
def get_customers_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    try:
        now = datetime.utcnow()
        rows = (
            db.query(
                cast(User.created_at, Date).label("day"),
                func.count(User.id).label("new_customers")
            )
            .filter(User.created_at >= now - timedelta(days=DAYS_30))
            .group_by(cast(User.created_at, Date))
            .order_by(cast(User.created_at, Date))
            .all()
        )
        return {
            "daily_new_customers": [
                {"date": str(day), "new_customers": int(count)}
                for day, count in rows
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/categories")
def get_categories_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    try:
        COLORS = ["#6366f1", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"]
        rows = (
            db.query(
                Category.name,
                func.coalesce(func.sum(Order.total_price), 0).label("revenue")
            )
            .join(Product, Product.category_id == Category.id)
            .join(Order, Order.product_id == Product.id)
            .group_by(Category.id, Category.name)
            .order_by(desc("revenue"))
            .all()
        )
        return {
            "categories": [
                {"name": name, "value": float(revenue), "color": COLORS[i % len(COLORS)]}
                for i, (name, revenue) in enumerate(rows)
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/top-products")
def get_top_products_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    try:
        products = analytics_service.get_top_selling_products(db, limit=10)
        return {"top_products": products}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
