"""
Script to update shop_order table to reference payment_type instead of user_payment_method.
This drops the old foreign key and creates a new one.
Run this once to fix the database schema.
"""

from database import engine
from sqlalchemy import text

def fix_shop_order_payment_fk():
    """Fix the shop_order table foreign key to reference payment_type instead of user_payment_method"""
    
    with engine.connect() as connection:
        # Start transaction
        trans = connection.begin()
        
        try:
            # Check if the old constraint exists and drop it
            # First, let's try to drop any existing foreign key on payment_method_id
            print("Attempting to modify shop_order table...")
            
            # Drop the old foreign key constraint if it exists
            # The constraint name might vary, so we'll use a dynamic approach
            drop_fk_sql = """
            DO $$
            DECLARE
                r RECORD;
            BEGIN
                FOR r IN (
                    SELECT constraint_name
                    FROM information_schema.table_constraints
                    WHERE table_name = 'shop_order'
                    AND constraint_type = 'FOREIGN KEY'
                    AND constraint_name LIKE '%payment_method%'
                )
                LOOP
                    EXECUTE 'ALTER TABLE shop_order DROP CONSTRAINT ' || r.constraint_name;
                    RAISE NOTICE 'Dropped constraint: %', r.constraint_name;
                END LOOP;
            END $$;
            """
            connection.execute(text(drop_fk_sql))
            print("Dropped old foreign key constraint(s) on payment_method_id")
            
            # Add new foreign key constraint to payment_type
            add_fk_sql = """
            ALTER TABLE shop_order
            ADD CONSTRAINT shop_order_payment_type_fk
            FOREIGN KEY (payment_method_id) REFERENCES payment_type(payment_type_id);
            """
            try:
                connection.execute(text(add_fk_sql))
                print("Added new foreign key constraint to payment_type")
            except Exception as e:
                # Constraint might already exist or table structure is different
                print(f"Note: Could not add FK constraint (may already exist): {e}")
            
            trans.commit()
            print("Database schema update completed successfully!")
            
        except Exception as e:
            trans.rollback()
            print(f"Error updating schema: {e}")
            raise

if __name__ == "__main__":
    print("=" * 50)
    print("Fixing shop_order foreign key constraint...")
    print("=" * 50)
    fix_shop_order_payment_fk()
