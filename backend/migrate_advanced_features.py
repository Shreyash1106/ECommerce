"""
Database Migration Script: Add advanced features tables and fields

This script adds:
1. saved_searches table
2. price_history table
3. color, size, material fields to products table
"""

from sqlalchemy import text
from app.database.session import engine, SessionLocal


def migrate():
    """Add advanced features tables and fields."""
    db = SessionLocal()
    
    try:
        print("Starting migration: Adding advanced features...")
        
        # ============================================
        # Create saved_searches table
        # ============================================
        print("\n1. Creating saved_searches table...")
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'saved_searches'
                )
            """))
            table_exists = result.scalar()
        
        if not table_exists:
            with engine.connect() as conn:
                conn.execute(text("""
                    CREATE TABLE saved_searches (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        name VARCHAR(255) NOT NULL,
                        search_query TEXT NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                """))
                conn.execute(text("""
                    CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id)
                """))
                conn.commit()
            print("[OK] saved_searches table created")
        else:
            print("[OK] saved_searches table already exists")
        
        # ============================================
        # Create price_history table
        # ============================================
        print("\n2. Creating price_history table...")
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'price_history'
                )
            """))
            table_exists = result.scalar()
        
        if not table_exists:
            with engine.connect() as conn:
                conn.execute(text("""
                    CREATE TABLE price_history (
                        id SERIAL PRIMARY KEY,
                        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                        price FLOAT NOT NULL,
                        recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    )
                """))
                conn.execute(text("""
                    CREATE INDEX idx_price_history_product_id ON price_history(product_id)
                """))
                conn.execute(text("""
                    CREATE INDEX idx_price_history_recorded_at ON price_history(recorded_at)
                """))
                conn.commit()
            print("[OK] price_history table created")
        else:
            print("[OK] price_history table already exists")
        
        # ============================================
        # Add color, size, material to products table
        # ============================================
        print("\n3. Adding advanced filter fields to products table...")
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'products' 
                AND column_name IN ('color', 'size', 'material')
            """))
            existing_columns = [row[0] for row in result]
        
        # Add color column
        if 'color' not in existing_columns:
            print("  - Adding 'color' column...")
            with engine.connect() as conn:
                conn.execute(text("""
                    ALTER TABLE products 
                    ADD COLUMN color VARCHAR(100)
                """))
                conn.commit()
            print("  [OK] 'color' column added")
        else:
            print("  [OK] 'color' column already exists")
        
        # Add size column
        if 'size' not in existing_columns:
            print("  - Adding 'size' column...")
            with engine.connect() as conn:
                conn.execute(text("""
                    ALTER TABLE products 
                    ADD COLUMN size VARCHAR(50)
                """))
                conn.commit()
            print("  [OK] 'size' column added")
        else:
            print("  [OK] 'size' column already exists")
        
        # Add material column
        if 'material' not in existing_columns:
            print("  - Adding 'material' column...")
            with engine.connect() as conn:
                conn.execute(text("""
                    ALTER TABLE products 
                    ADD COLUMN material VARCHAR(100)
                """))
                conn.commit()
            print("  [OK] 'material' column added")
        else:
            print("  [OK] 'material' column already exists")
        
        print("\n✅ Migration completed successfully!")
        print("\nSummary:")
        print("  [OK] saved_searches table created")
        print("  [OK] price_history table created")
        print("  [OK] color, size, material columns added to products table")
        
    except Exception as e:
        print(f"\n[ERROR] Migration failed: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    migrate()
