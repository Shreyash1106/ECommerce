import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text, inspect
from app.database.session import engine
from app.database.base import Base
import app.models

logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

def run_migrations():
    """Create all tables and add any missing columns automatically."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created/verified")
    except Exception as e:
        logger.error(f"Database create_all error: {e}")

    # Auto-add missing columns (safe to run every startup)
    # Only hardcoded table/column names are used — no user input involved
    ALLOWED_TABLES = {"users", "products", "orders", "inventory", "notifications"}
    missing_columns = [
        ("users", "is_active", "INTEGER NOT NULL DEFAULT 1"),
        ("users", "notify_new_orders", "INTEGER NOT NULL DEFAULT 1"),
        ("users", "notify_low_stock_alerts", "INTEGER NOT NULL DEFAULT 1"),
        ("users", "notify_user_activity", "INTEGER NOT NULL DEFAULT 1"),
        ("users", "notify_system_updates", "INTEGER NOT NULL DEFAULT 1"),
        ("orders", "status", "VARCHAR(50) NOT NULL DEFAULT 'Pending'"),
    ]
    inspector = inspect(engine)
    with engine.connect() as conn:
        for table, column, col_def in missing_columns:
            if table not in ALLOWED_TABLES:
                logger.warning(f"Skipping unknown table '{table}'")
                continue
            try:
                existing = [c["name"] for c in inspector.get_columns(table)]
                if column not in existing:
                    conn.execute(text(f'ALTER TABLE "{table}" ADD COLUMN "{column}" {col_def}'))
                    conn.commit()
                    logger.info(f"Added column '{column}' to '{table}'")
            except Exception as e:
                logger.warning(f"Could not add column '{column}' to '{table}': {e}")

run_migrations()

app = FastAPI(
    title="E-Commerce API",
    description="Production-ready E-Commerce Backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600
)

try:
    from app.api import auth, products, orders, notifications, analytics, search, inventory, reports, email_verification, admin
    logger.info("All routers imported")
except Exception as e:
    logger.error(f"Router import error: {e}")
    raise

app.include_router(auth.router,              prefix="/api/auth")
app.include_router(products.router,          prefix="/api/products")
app.include_router(orders.router,            prefix="/api/orders")
app.include_router(notifications.router,     prefix="/api/notifications")
app.include_router(analytics.router,         prefix="/api/analytics")
app.include_router(search.router,            prefix="/api/search")
app.include_router(inventory.router,         prefix="/api")
app.include_router(reports.router,           prefix="/api")
app.include_router(email_verification.router)
app.include_router(admin.router,             prefix="/api/admin")

@app.get("/")
def root():
    return {"message": "E-Commerce API", "version": "1.0.0", "status": "running", "docs": "/docs"}

@app.get("/api/health")
def health():
    return {"status": "ok", "message": "API running"}

@app.exception_handler(Exception)
async def global_exception(request: Request, exc: Exception):
    logger.error(f"Error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "type": type(exc).__name__}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
