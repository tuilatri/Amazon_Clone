"""
Migration script for Order Timestamps (Option A)
Adds created_at and completed_at columns to shop_order table.
Backfills created_at from order_date for existing orders.

Run this script after updating models.py to add the new columns.
Usage: python migrate_order_timestamps.py
"""

from database import SessionLocal, engine
from sqlalchemy import text
from datetime import datetime, timezone

def migrate_order_timestamps():
    """
    1. Add created_at and completed_at columns if they don't exist
    2. Backfill created_at from order_date for existing orders
    3. Leave completed_at as NULL for existing orders
    """
    db = SessionLocal()
    
    try:
        # Check if columns already exist
        check_columns_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'shop_order' 
            AND column_name IN ('created_at', 'completed_at')
        """)
        result = db.execute(check_columns_query)
        existing_columns = [row[0] for row in result.fetchall()]
        
        # Add created_at column if it doesn't exist
        if 'created_at' not in existing_columns:
            print("Adding 'created_at' column to shop_order table...")
            add_created_at = text("""
                ALTER TABLE shop_order 
                ADD COLUMN created_at TIMESTAMP NULL
            """)
            db.execute(add_created_at)
            db.commit()
            print("✓ Added 'created_at' column")
        else:
            print("✓ 'created_at' column already exists")
        
        # Add completed_at column if it doesn't exist
        if 'completed_at' not in existing_columns:
            print("Adding 'completed_at' column to shop_order table...")
            add_completed_at = text("""
                ALTER TABLE shop_order 
                ADD COLUMN completed_at TIMESTAMP NULL
            """)
            db.execute(add_completed_at)
            db.commit()
            print("✓ Added 'completed_at' column")
        else:
            print("✓ 'completed_at' column already exists")
        
        # Backfill created_at from order_date for orders where created_at is NULL
        print("\nBackfilling 'created_at' from 'order_date' for existing orders...")
        backfill_query = text("""
            UPDATE shop_order 
            SET created_at = order_date::timestamp 
            WHERE created_at IS NULL AND order_date IS NOT NULL
        """)
        result = db.execute(backfill_query)
        db.commit()
        
        # Get count of updated rows
        count_query = text("SELECT COUNT(*) FROM shop_order WHERE created_at IS NOT NULL")
        count_result = db.execute(count_query).fetchone()
        updated_count = count_result[0] if count_result else 0
        
        print(f"✓ Backfilled 'created_at' for {updated_count} orders")
        
        # Verify: Check orders with NULL completed_at (should be all existing orders)
        verify_query = text("SELECT COUNT(*) FROM shop_order WHERE completed_at IS NULL")
        verify_result = db.execute(verify_query).fetchone()
        null_completed_count = verify_result[0] if verify_result else 0
        
        print(f"\n✓ Orders with 'completed_at' = NULL: {null_completed_count}")
        print("  (This is expected for all existing orders)\n")
        
        print("=" * 50)
        print("Migration completed successfully!")
        print("=" * 50)
        print("\nSummary:")
        print("  - created_at: Populated from order_date (midnight UTC)")
        print("  - completed_at: NULL (will be set on Delivered/Cancelled)")
        
    except Exception as e:
        db.rollback()
        print(f"Error during migration: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 50)
    print("Order Timestamps Migration Script")
    print("=" * 50)
    print()
    migrate_order_timestamps()
