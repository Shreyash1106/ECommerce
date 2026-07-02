"""
Database Migration Script: Add brand, rating, and discount_percentage fields to products table

Run this script to update the database schema for the advanced search feature.
"""

from sqlalchemy import text
from app.database.session import engine, SessionLocal


def migrate():
    """Add new columns to products table."""
    db = SessionLocal()
    
    try:
        print("Starting migration: Adding brand, rating, and discount_percentage fields to products table...")
        
        # Check if columns already exist
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'products' 
                AND column_name IN ('brand', 'rating', 'discount_percentage')
            """))
            existing_columns = [row[0] for row in result]
        
        # Add brand column if it doesn't exist
        if 'brand' not in existing_columns:
            print("Adding 'brand' column...")
            with engine.connect() as conn:
                conn.execute(text("""
                    ALTER TABLE products 
                    ADD COLUMN brand VARCHAR(255)
                """))
                conn.commit()
            print("✓ 'brand' column added successfully")
        else:
            print("✓ 'brand' column already exists")
        
        # Add rating column if it doesn't exist
        if 'rating' not in existing_columns:
            print("Adding 'rating' column...")
            with engine.connect() as conn:
                conn.execute(text("""
                    ALTER TABLE products 
                    ADD COLUMN rating FLOAT DEFAULT 0.0
                """))
                conn.commit()
            print("✓ 'rating' column added successfully")
        else:
            print("✓ 'rating' column already exists")
        
        # Add discount_percentage column if it doesn't exist
        if 'discount_percentage' not in existing_columns:
            print("Adding 'discount_percentage' column...")
            with engine.connect() as conn:
                conn.execute(text("""
                    ALTER TABLE products 
                    ADD COLUMN discount_percentage FLOAT DEFAULT 0.0
                """))
                conn.commit()
            print("✓ 'discount_percentage' column added successfully")
        else:
            print("✓ 'discount_percentage' column already exists")
        
        # Update existing products with default values
        print("Updating existing products with default values...")
        with engine.connect() as conn:
            conn.execute(text("""
                UPDATE products 
                SET rating = COALESCE(rating, 0.0),
                    discount_percentage = COALESCE(discount_percentage, 0.0)
                WHERE rating IS NULL OR discount_percentage IS NULL
            """))
            conn.commit()
        print("✓ Existing products updated successfully")
        
        print("\n✅ Migration completed successfully!")
        print("\nNew columns added to products table:")
        print("  - brand (VARCHAR(255))")
        print("  - rating (FLOAT, default: 0.0)")
        print("  - discount_percentage (FLOAT, default: 0.0)")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    migrate()
