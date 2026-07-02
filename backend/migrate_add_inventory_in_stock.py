"""
Database Migration Script: Add in_stock field to inventory table

Run this script to update the database schema for the inventory in_stock field.
"""

from sqlalchemy import text
from app.database.session import engine, SessionLocal


def migrate():
    """Add in_stock column to inventory table."""
    db = SessionLocal()
    
    try:
        print("Starting migration: Adding in_stock field to inventory table...")
        
        # Check if column already exists
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'inventory' 
                AND column_name = 'in_stock'
            """))
            existing_columns = [row[0] for row in result]
        
        # Add in_stock column if it doesn't exist
        if 'in_stock' not in existing_columns:
            print("Adding 'in_stock' column...")
            with engine.connect() as conn:
                conn.execute(text("""
                    ALTER TABLE inventory 
                    ADD COLUMN in_stock BOOLEAN DEFAULT TRUE
                """))
                conn.commit()
            print("✓ 'in_stock' column added successfully")
        else:
            print("✓ 'in_stock' column already exists")
        
        # Update existing records with in_stock based on quantity
        print("Updating existing inventory records...")
        with engine.connect() as conn:
            conn.execute(text("""
                UPDATE inventory 
                SET in_stock = CASE 
                    WHEN quantity > 0 THEN TRUE 
                    ELSE FALSE 
                END
                WHERE in_stock IS NULL
            """))
            conn.commit()
        print("✓ Existing records updated successfully")
        
        print("\n✅ Migration completed successfully!")
        print("\nNew column added to inventory table:")
        print("  - in_stock (BOOLEAN, default: TRUE)")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    migrate()
