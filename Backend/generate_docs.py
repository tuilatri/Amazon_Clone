"""
Script to generate documentation files about orders and available methods.
"""

from database import SessionLocal
from models import PaymentType, ShippingMethod, OrderStatus, ShopOrder, OrderLine, SiteUser

db = SessionLocal()

# ============================================
# FILE 1: available_methods.txt
# ============================================
with open('available_methods.txt', 'w', encoding='utf-8') as f:
    f.write('=' * 60 + '\n')
    f.write('AVAILABLE PAYMENT, SHIPPING, AND ORDER STATUS METHODS\n')
    f.write('=' * 60 + '\n\n')
    
    f.write('PAYMENT METHODS\n')
    f.write('-' * 40 + '\n')
    for pm in db.query(PaymentType).order_by(PaymentType.payment_type_id).all():
        f.write(f'  ID: {pm.payment_type_id}\n')
        f.write(f'  Name: {pm.payment_name}\n')
        f.write('\n')
    
    f.write('\nSHIPPING METHODS\n')
    f.write('-' * 40 + '\n')
    for sm in db.query(ShippingMethod).order_by(ShippingMethod.shipping_method_id).all():
        f.write(f'  ID: {sm.shipping_method_id}\n')
        f.write(f'  Type: {sm.type}\n')
        f.write(f'  Price: ${float(sm.price):.2f}\n')
        f.write('\n')
    
    f.write('\nORDER STATUSES\n')
    f.write('-' * 40 + '\n')
    for os_item in db.query(OrderStatus).order_by(OrderStatus.order_status_id).all():
        f.write(f'  ID: {os_item.order_status_id}\n')
        f.write(f'  Status: {os_item.status}\n')
        f.write('\n')

print('Created available_methods.txt')

# ============================================
# FILE 2: order_tracing_guide.txt
# ============================================
with open('order_tracing_guide.txt', 'w', encoding='utf-8') as f:
    f.write('=' * 60 + '\n')
    f.write('ORDER TRACING AND RETRIEVAL GUIDE\n')
    f.write('=' * 60 + '\n\n')
    
    f.write('DATABASE TABLES INVOLVED\n')
    f.write('-' * 40 + '\n')
    f.write('1. shop_order - Main order table\n')
    f.write('2. order_line - Individual items in each order\n')
    f.write('3. site_user - User who placed the order\n')
    f.write('4. product - Product details\n')
    f.write('5. payment_type - Payment method used\n')
    f.write('6. shipping_method - Shipping method selected\n')
    f.write('7. order_status - Current status of order\n\n')
    
    f.write('SHOP_ORDER TABLE STRUCTURE\n')
    f.write('-' * 40 + '\n')
    f.write('  - order_id (PK): Unique order identifier\n')
    f.write('  - user_id (FK): Links to site_user table\n')
    f.write('  - order_date: Date the order was placed\n')
    f.write('  - order_total: Total amount including shipping\n')
    f.write('  - payment_method_id (FK): Links to payment_type\n')
    f.write('  - shipping_method_id (FK): Links to shipping_method\n')
    f.write('  - order_status_id (FK): Links to order_status\n\n')
    
    f.write('ORDER_LINE TABLE STRUCTURE\n')
    f.write('-' * 40 + '\n')
    f.write('  - ordered_product_id (PK): Unique line item ID\n')
    f.write('  - order_id (FK): Links to shop_order\n')
    f.write('  - product_id (FK): Links to product table\n')
    f.write('  - qty: Quantity ordered\n')
    f.write('  - price: Price per item\n\n')
    
    f.write('SQL QUERIES TO TRACE ORDERS\n')
    f.write('-' * 40 + '\n\n')
    
    f.write('1. Get all orders for a user by email:\n')
    f.write("   SELECT so.* FROM shop_order so\n")
    f.write("   JOIN site_user su ON so.user_id = su.user_id\n")
    f.write("   WHERE su.email_address = 'guest01@gmail.com';\n\n")
    
    f.write('2. Get specific order details by order_id:\n')
    f.write('   SELECT * FROM shop_order WHERE order_id = 11;\n\n')
    
    f.write('3. Get order items/lines for an order:\n')
    f.write('   SELECT ol.*, p.product_name\n')
    f.write('   FROM order_line ol\n')
    f.write('   JOIN product p ON ol.product_id = p.product_id\n')
    f.write('   WHERE ol.order_id = 11;\n\n')
    
    f.write('4. Full order with all details:\n')
    f.write('   SELECT so.order_id, so.order_date, so.order_total,\n')
    f.write('          su.email_address, su.user_name,\n')
    f.write('          pt.payment_name, sm.type AS shipping_type,\n')
    f.write('          sm.price AS shipping_price, os.status\n')
    f.write('   FROM shop_order so\n')
    f.write('   JOIN site_user su ON so.user_id = su.user_id\n')
    f.write('   JOIN payment_type pt ON so.payment_method_id = pt.payment_type_id\n')
    f.write('   JOIN shipping_method sm ON so.shipping_method_id = sm.shipping_method_id\n')
    f.write('   JOIN order_status os ON so.order_status_id = os.order_status_id\n')
    f.write('   WHERE so.order_id = 11;\n\n')
    
    f.write('API ENDPOINTS FOR ORDER RETRIEVAL\n')
    f.write('-' * 40 + '\n')
    f.write('1. GET /api/payment-methods - List payment options\n')
    f.write('2. GET /api/shipping-methods - List shipping options\n')
    f.write('3. POST /api/create-order - Create new order\n')
    f.write('4. POST /order/{order_id} - Get order details\n')
    f.write('5. POST /order/history - Get user order history\n\n')
    
    f.write('PYTHON CODE TO TRACE AN ORDER\n')
    f.write('-' * 40 + '\n')
    f.write('from database import SessionLocal\n')
    f.write('from models import ShopOrder, OrderLine, SiteUser\n\n')
    f.write('db = SessionLocal()\n\n')
    f.write('# Find user\n')
    f.write('user = db.query(SiteUser).filter(\n')
    f.write('    SiteUser.email_address == "guest01@gmail.com"\n')
    f.write(').first()\n\n')
    f.write('# Get all orders for user\n')
    f.write('orders = db.query(ShopOrder).filter(\n')
    f.write('    ShopOrder.user_id == user.user_id\n')
    f.write(').all()\n\n')
    f.write('for order in orders:\n')
    f.write('    print(f"Order ID: {order.order_id}")\n')
    f.write('    print(f"Date: {order.order_date}")\n')
    f.write('    print(f"Total: {order.order_total}")\n')
    f.write('    # Get order lines\n')
    f.write('    lines = db.query(OrderLine).filter(\n')
    f.write('        OrderLine.order_id == order.order_id\n')
    f.write('    ).all()\n')
    f.write('    for line in lines:\n')
    f.write('        print(f"  - {line.product_id}: {line.qty} x {line.price}")\n\n')
    f.write('db.close()\n\n')
    
    f.write('EXAMPLE: ORDERS FOR TEST ACCOUNT\n')
    f.write('-' * 40 + '\n')
    
    # Get actual orders for the test user
    user = db.query(SiteUser).filter(SiteUser.email_address == 'guest01@gmail.com').first()
    if user:
        orders = db.query(ShopOrder).filter(ShopOrder.user_id == user.user_id).order_by(ShopOrder.order_id.desc()).all()
        f.write(f'User: {user.email_address} (ID: {user.user_id})\n')
        f.write(f'Total Orders: {len(orders)}\n\n')
        for order in orders[:5]:  # Show last 5 orders
            f.write(f'Order #{order.order_id}\n')
            f.write(f'  Date: {order.order_date}\n')
            f.write(f'  Total: ${float(order.order_total):.2f}\n')
            f.write(f'  Payment Method ID: {order.payment_method_id}\n')
            f.write(f'  Shipping Method ID: {order.shipping_method_id}\n')
            f.write(f'  Status ID: {order.order_status_id}\n')
            lines = db.query(OrderLine).filter(OrderLine.order_id == order.order_id).all()
            f.write(f'  Items ({len(lines)}):\n')
            for line in lines:
                f.write(f'    - Product: {line.product_id}, Qty: {line.qty}, Price: ${float(line.price):.2f}\n')
            f.write('\n')
    else:
        f.write('Test user not found.\n')

print('Created order_tracing_guide.txt')
db.close()
print('Done!')
