"""
Database Migration Script: Add User Timestamp Fields
Run this script to add the new columns to the existing site_user table.
"""
import sys
sys.path.append('.')

from database import engine
from sqlalchemy import text

def migrate():
    """Add created_at, updated_at, last_login_at, and status columns to site_user table."""
    
    migration_queries = [
        """
        ALTER TABLE site_user 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NULL;
        """,
        """
        ALTER TABLE site_user 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NULL;
        """,
        """
        ALTER TABLE site_user 
        ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP DEFAULT NULL;
        """,
        """
        ALTER TABLE site_user 
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
        """
    ]
    
    with engine.connect() as conn:
        for query in migration_queries:
            try:
                conn.execute(text(query))
                print(f"✓ Executed: {query.strip()[:50]}...")
            except Exception as e:
                # Column might already exist, which is fine
                print(f"⚠ Note: {e}")
        conn.commit()
        print("\n✓ Migration completed successfully!")

if __name__ == "__main__":
    print("=" * 60)
    print("Running User Attributes Migration")
    print("=" * 60)
    migrate()
    print("=" * 60)
