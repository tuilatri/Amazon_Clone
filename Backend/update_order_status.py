"""
Database update script for Orders page enhancement.
1. Add 'Returned' status with order_status_id = 6
2. Clear old order_line and shop_order data
"""

from database import SessionLocal, engine
from models import OrderStatus, OrderLine, ShopOrder

def update_database():
    db = SessionLocal()
    
    try:
        # 1. Check if 'Returned' status already exists
        existing_status = db.query(OrderStatus).filter(OrderStatus.order_status_id == 6).first()
        
        if existing_status:
            print(f"Status with id=6 already exists: '{existing_status.status}'")
            if existing_status.status != 'Returned':
                existing_status.status = 'Returned'
                db.commit()
                print("Updated status name to 'Returned'")
        else:
            # Add new Returned status
            returned_status = OrderStatus(order_status_id=6, status='Returned')
            db.add(returned_status)
            db.commit()
            print("Added 'Returned' status with order_status_id = 6")
        
        # 2. Clear all existing order lines first (foreign key constraint)
        order_lines_count = db.query(OrderLine).count()
        db.query(OrderLine).delete()
        db.commit()
        print(f"Deleted {order_lines_count} order lines")
        
        # 3. Clear all existing orders
        orders_count = db.query(ShopOrder).count()
        db.query(ShopOrder).delete()
        db.commit()
        print(f"Deleted {orders_count} orders")
        
        print("\n✓ Database updates completed successfully!")
        print("  - Added 'Returned' status (id=6)")
        print("  - Cleared all old order history")
        
    except Exception as e:
        db.rollback()
        print(f"Error updating database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    update_database()
