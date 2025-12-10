"""
Script to update order_line table to use product_id instead of product_item_id.
This drops the old column/FK and adds a new one referencing the product table.
Run this once to fix the database schema.
"""

from database import engine
from sqlalchemy import text

def fix_order_line_product_fk():
    """Fix the order_line table to reference product instead of product_item"""
    
    with engine.connect() as connection:
        # Start transaction
        trans = connection.begin()
        
        try:
            print("Attempting to modify order_line table...")
            
            # Check if product_item_id column exists and rename/replace it
            # First, drop any existing foreign key on product_item_id
            drop_fk_sql = """
            DO $$
            DECLARE
                r RECORD;
            BEGIN
                FOR r IN (
                    SELECT constraint_name
                    FROM information_schema.table_constraints
                    WHERE table_name = 'order_line'
                    AND constraint_type = 'FOREIGN KEY'
                    AND constraint_name LIKE '%product%'
                )
                LOOP
                    EXECUTE 'ALTER TABLE order_line DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
                    RAISE NOTICE 'Dropped constraint: %', r.constraint_name;
                END LOOP;
            END $$;
            """
            connection.execute(text(drop_fk_sql))
            print("Dropped old foreign key constraint(s)")
            
            # Check if product_item_id column exists and rename it to product_id
            check_column_sql = """
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'order_line' AND column_name = 'product_item_id';
            """
            result = connection.execute(text(check_column_sql))
            has_product_item_id = result.fetchone() is not None
            
            if has_product_item_id:
                # Rename the column
                rename_sql = """
                ALTER TABLE order_line RENAME COLUMN product_item_id TO product_id;
                """
                connection.execute(text(rename_sql))
                print("Renamed product_item_id to product_id")
            
            # Check if product_id column exists now
            check_new_column_sql = """
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'order_line' AND column_name = 'product_id';
            """
            result = connection.execute(text(check_new_column_sql))
            has_product_id = result.fetchone() is not None
            
            if not has_product_id:
                # Add the product_id column
                add_column_sql = """
                ALTER TABLE order_line ADD COLUMN product_id VARCHAR(100);
                """
                connection.execute(text(add_column_sql))
                print("Added product_id column")
            
            # Modify column type if needed
            modify_type_sql = """
            ALTER TABLE order_line ALTER COLUMN product_id TYPE VARCHAR(100);
            """
            try:
                connection.execute(text(modify_type_sql))
                print("Modified product_id column type")
            except Exception as e:
                print(f"Note: Could not modify column type (may already be correct): {e}")
            
            # Add new foreign key constraint to product table
            add_fk_sql = """
            ALTER TABLE order_line
            ADD CONSTRAINT order_line_product_fk
            FOREIGN KEY (product_id) REFERENCES product(product_id);
            """
            try:
                connection.execute(text(add_fk_sql))
                print("Added new foreign key constraint to product table")
            except Exception as e:
                print(f"Note: Could not add FK constraint (may already exist): {e}")
            
            trans.commit()
            print("Database schema update completed successfully!")
            
        except Exception as e:
            trans.rollback()
            print(f"Error updating schema: {e}")
            raise

if __name__ == "__main__":
    print("=" * 50)
    print("Fixing order_line table schema...")
    print("=" * 50)
    fix_order_line_product_fk()
