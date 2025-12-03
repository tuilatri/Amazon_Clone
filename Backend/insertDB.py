# file này dùng để test backend khi chưa có frontend và dataset

from passlib.context import CryptContext
import random
import uuid
from decimal import Decimal
from models import SiteUser, Product, ProductItem, ProductCategory
from database import SessionLocal


# Giả sử bạn đã có danh sách categories và products
categories = ["Books", "Electronics", "Toys", "Sports Equipment", "Automotive"]
products = [
    {"name": "Smartphone", "image": "smartphone.jpg"},
    {"name": "Laptop", "image": "laptop.jpg"},
    {"name": "Air Conditioner", "image": "air_conditioner.jpg"},
    {"name": "Sneakers", "image": "sneakers.jpg"},
    {"name": "Electric Kettle", "image": "kettle.jpg"}
]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def insert_data():
    session = SessionLocal()
    try:
        # Insert admin user
        password_hash = hash_password("adminpassword123")
        admin_user = SiteUser(
            user_name="admin",
            email_address="admin@example.com",
            phone_number="1234567890",
            password=password_hash
        )
        session.add(admin_user)

        # Insert categories
        category_objects = []
        for category_name in categories:
            category = ProductCategory(category_name=category_name)
            session.add(category)
            category_objects.append(category)

        session.commit()  # Commit categories to get IDs

        # Insert products and product items
        for product in products:
            random_category = random.choice(category_objects)

            # Tạo product_id bằng UUID
            new_product = Product(
                product_id=str(uuid.uuid4()),
                product_name=product["name"],
                main_category=random_category.category_name,
                main_category_encoded=product["name"].lower().replace(" ", "_"),
                sub_category=random_category.category_name,
                sub_category_encoded=product["name"].lower().replace(" ", "_"),
                product_image=product["image"],
                product_link=f"/products/{product['name'].lower().replace(' ', '_')}",
                average_rating=random.uniform(1, 5),
                no_of_ratings=random.randint(1, 100),
                discount_price_usd=Decimal(random.uniform(10, 500)).quantize(Decimal("0.01")),
                actual_price_usd=Decimal(random.uniform(10, 1000)).quantize(Decimal("0.01")),
                category_id=random_category.category_id
            )
            session.add(new_product)

            # Tạo product_item_id bằng UUID
            product_item = ProductItem(
                product_item_id=str(uuid.uuid4()),
                product_id=new_product.product_id,
                SKU=f"SKU-{random.randint(1000, 9999)}",
                price=Decimal(random.uniform(10, 1000)).quantize(Decimal("0.01")),
                is_in_stock=True,
                product_image=new_product.product_image
            )
            session.add(product_item)

        session.commit()
        print("Admin user, categories, products, and product items inserted successfully.")

    except Exception as e:
        session.rollback()
        print(f"An error occurred: {e}")
    finally:
        session.close()

insert_data()
