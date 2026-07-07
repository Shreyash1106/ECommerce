from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
import os
from dotenv import load_dotenv, find_dotenv

# Load environment variables from .env file at project root
load_dotenv(find_dotenv(), override=True)

POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "ECommerce")


# Build the PostgreSQL URL for SQLAlchemy
SQLALCHEMY_DATABASE_URL = (
    f"postgresql+psycopg2://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
)

# Create the engine with connection pooling and optimizations
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=False,  # Disable SQL logging for performance
    poolclass=QueuePool,
    pool_size=20,  # Number of connections to keep in pool
    max_overflow=40,  # Max overflow connections
    pool_pre_ping=True,  # Test connections before using
    pool_recycle=3600,  # Recycle connections after 1 hour
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to be used in FastAPI routes (optional)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
