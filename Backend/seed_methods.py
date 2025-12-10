"""
Seed script to insert payment methods, shipping methods, and order statuses into the database.
Run this script once to populate the required lookup tables.
"""

from database import SessionLocal, engine
from models import PaymentType, ShippingMethod, OrderStatus, Base
from sqlalchemy import text

def seed_payment_methods(db):
    """Insert payment methods: COD, Credit Card"""
    payment_methods = [
        {"payment_type_id": 1, "payment_name": "COD"},
        {"payment_type_id": 2, "payment_name": "Credit Card"},
    ]
    
    for pm in payment_methods:
        existing = db.query(PaymentType).filter(PaymentType.payment_type_id == pm["payment_type_id"]).first()
        if not existing:
            new_pm = PaymentType(**pm)
            db.add(new_pm)
            print(f"Added payment method: {pm['payment_name']}")
        else:
            print(f"Payment method already exists: {pm['payment_name']}")
    
    db.commit()

def seed_shipping_methods(db):
    """Insert shipping methods: Standard ($5), Express ($10), Same Day ($20), International ($40)"""
    shipping_methods = [
        {"shipping_method_id": 1, "type": "Standard", "price": 5.00},
        {"shipping_method_id": 2, "type": "Express", "price": 10.00},
        {"shipping_method_id": 3, "type": "Same Day", "price": 20.00},
        {"shipping_method_id": 4, "type": "International", "price": 40.00},
    ]
    
    for sm in shipping_methods:
        existing = db.query(ShippingMethod).filter(ShippingMethod.shipping_method_id == sm["shipping_method_id"]).first()
        if not existing:
            new_sm = ShippingMethod(**sm)
            db.add(new_sm)
            print(f"Added shipping method: {sm['type']} - ${sm['price']}")
        else:
            print(f"Shipping method already exists: {sm['type']}")
    
    db.commit()

def seed_order_statuses(db):
    """Insert order statuses: Pending, Processing, Shipped, Delivered, Cancelled"""
    order_statuses = [
        {"order_status_id": 1, "status": "Pending"},
        {"order_status_id": 2, "status": "Processing"},
        {"order_status_id": 3, "status": "Shipped"},
        {"order_status_id": 4, "status": "Delivered"},
        {"order_status_id": 5, "status": "Cancelled"},
    ]
    
    for os in order_statuses:
        existing = db.query(OrderStatus).filter(OrderStatus.order_status_id == os["order_status_id"]).first()
        if not existing:
            new_os = OrderStatus(**os)
            db.add(new_os)
            print(f"Added order status: {os['status']}")
        else:
            print(f"Order status already exists: {os['status']}")
    
    db.commit()

def main():
    """Main function to seed all lookup tables"""
    print("=" * 50)
    print("Starting database seeding...")
    print("=" * 50)
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("\n--- Seeding Payment Methods ---")
        seed_payment_methods(db)
        
        print("\n--- Seeding Shipping Methods ---")
        seed_shipping_methods(db)
        
        print("\n--- Seeding Order Statuses ---")
        seed_order_statuses(db)
        
        print("\n" + "=" * 50)
        print("Database seeding completed successfully!")
        print("=" * 50)
        
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
