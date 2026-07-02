from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import csv
import io

from app.core.security import get_current_admin_user
from app.database.session import get_db
from app.services.report_service import (
    get_sales_report,
    get_order_report,
    get_user_report,
    get_revenue_report,
)
from app.schemas.report import (
    SalesReport,
    OrderReport,
    UserReport,
    RevenueReport,
    ReportExportFormat,
)

router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
    dependencies=[Depends(get_current_admin_user)],
)

def _parse_date(date_str: Optional[str]) -> Optional[datetime]:
    if date_str:
        try:
            return datetime.fromisoformat(date_str)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format, must be ISO string")
    return None

@router.get("/sales", response_model=SalesReport)
def sales_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    format: Optional[ReportExportFormat] = Query(None),
    db: Session = Depends(get_db),
):
    start = _parse_date(start_date)
    end = _parse_date(end_date)
    data = get_sales_report(db, start_date=start, end_date=end)
    if format == ReportExportFormat.csv:
        # Build CSV
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["total_sales", "total_revenue"])
        writer.writerow([data["total_sales"], data["total_revenue"]])
        writer.writerow([])
        writer.writerow(["month", "revenue"])
        for row in data["monthly_breakdown"]:
            writer.writerow([row["month"], row["revenue"]])
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=sales_report.csv"},
        )
    if format == ReportExportFormat.excel:
        raise HTTPException(status_code=501, detail="Excel export not implemented yet")
    return data

@router.get("/orders", response_model=OrderReport)
def orders_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    format: Optional[ReportExportFormat] = Query(None),
    db: Session = Depends(get_db),
):
    start = _parse_date(start_date)
    end = _parse_date(end_date)
    data = get_order_report(db, start_date=start, end_date=end)
    if format == ReportExportFormat.csv:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["total_orders", "delivered_orders", "pending_orders", "cancelled_orders"])
        writer.writerow([data["total_orders"], data["delivered_orders"], data["pending_orders"], data["cancelled_orders"]])
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=orders_report.csv"},
        )
    if format == ReportExportFormat.excel:
        raise HTTPException(status_code=501, detail="Excel export not implemented yet")
    return data

@router.get("/users", response_model=UserReport)
def users_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    format: Optional[ReportExportFormat] = Query(None),
    db: Session = Depends(get_db),
):
    start = _parse_date(start_date)
    end = _parse_date(end_date)
    data = get_user_report(db, start_date=start, end_date=end)
    if format == ReportExportFormat.csv:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["total_users", "new_users", "active_users"])
        writer.writerow([data["total_users"], data["new_users"], data["active_users"]])
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=users_report.csv"},
        )
    if format == ReportExportFormat.excel:
        raise HTTPException(status_code=501, detail="Excel export not implemented yet")
    return data

@router.get("/revenue", response_model=RevenueReport)
def revenue_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    format: Optional[ReportExportFormat] = Query(None),
    db: Session = Depends(get_db),
):
    start = _parse_date(start_date)
    end = _parse_date(end_date)
    data = get_revenue_report(db, start_date=start, end_date=end)
    if format == ReportExportFormat.csv:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["daily_revenue"])
        for row in data["daily_revenue"]:
            writer.writerow([row["date"], row["revenue"]])
        writer.writerow([])
        writer.writerow(["monthly_revenue"])
        for row in data["monthly_revenue"]:
            writer.writerow([row["month"], row["revenue"]])
        writer.writerow([])
        writer.writerow(["yearly_revenue"])
        for row in data["yearly_revenue"]:
            writer.writerow([row["year"], row["revenue"]])
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=revenue_report.csv"},
        )
    if format == ReportExportFormat.excel:
        raise HTTPException(status_code=501, detail="Excel export not implemented yet")
    return data
