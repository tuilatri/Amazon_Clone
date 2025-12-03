import pandas as pd
from sqlalchemy.orm import sessionmaker
from database import engine, SessionLocal
from models import Product, ProductRating, SiteUser
from sqlalchemy.exc import IntegrityError
import os

# Path to your CSV files (adjust if necessary)
CSV_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ModelApp", "Data")
product_csv_path = os.path.join(CSV_DIR, "new_product.csv")
user_data_csv_path = os.path.join(CSV_DIR, "new_user_data.csv")
product_rating_csv_path = os.path.join(CSV_DIR, "new_ratings.csv")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def insert_product_data():
    if not os.path.exists(product_csv_path):
        print(f"File not found: {product_csv_path}")
        return

    product_df = pd.read_csv(product_csv_path)
    session = SessionLocal()
    print("--- Bắt đầu nhập Product ---")
    
   # Insert Product Data
    for index, row in product_df.iterrows():
        try:
            # Kiểm tra xem sản phẩm đã tồn tại chưa để tránh lỗi trùng lặp khi chạy lại
            existing_product = session.query(Product).filter(Product.product_id == str(row['id'])).first()
            if existing_product:
                continue

            new_product = Product(
                product_id=str(row['id']), # Ép kiểu string cho chắc chắn
                product_name=row['name'][:200] if isinstance(row['name'], str) else "Unknown",
                main_category=row['main_category'],
                main_category_encoded=row['main_category_encoded'],
                sub_category=row['sub_category'],
                sub_category_encoded=row['sub_category_encoded'],
                product_image=row['image'] if isinstance(row['image'], str) and len(row['image']) <= 255 else None,
                product_link=row['link'] if isinstance(row['link'], str) and len(row['link']) <= 255 else None,
                average_rating=row['ratings'],
                no_of_ratings=row['no_of_ratings'],
                discount_price_usd=row['discount_price_usd'],
                actual_price_usd=row['actual_price_usd'],
                category_id=None 
            )
            session.add(new_product)

            if index % 100 == 0: 
                print(f"Product processed: {index}")
                session.commit()

        except IntegrityError as e:
            session.rollback()
            print(f"Error inserting product: {row.get('name', 'Unknown')} - {e}")
        except Exception as e:
            session.rollback()
            print(f"Unexpected error at product index {index}: {e}")

    session.commit()
    session.close()
    print("--- Hoàn tất nhập Product ---")
    
def insert_user_data():
    if not os.path.exists(user_data_csv_path):
        print(f"File not found: {user_data_csv_path}")
        return

    user_data_df = pd.read_csv(user_data_csv_path)
    session = SessionLocal()
    print("--- Bắt đầu nhập User ---")
    
    for index, row in user_data_df.iterrows():
        try:
            new_user = SiteUser(
                # Vì file csv user của bạn có thể không có email/pass/phone nên ta để trống hoặc lấy từ csv nếu có
                age=row['age'],
                gender=row['gender'],
                city=row['city'],
                # Tạm thời để user_name là User + index nếu không có cột name
                user_name=f"User_{index}", 
                # Lưu ý: email và phone phải unique, nếu CSV không có thì để Null (vì models cho phép nullable)
            )
            session.add(new_user)
            
            if index % 100 == 0: 
                session.commit()
            
        except IntegrityError as e:
            session.rollback()
            print(f"User Integrity Error at {index}: {e}")
            
    session.commit()
    session.close()
    print("--- Hoàn tất nhập User ---")
    
def insert_product_rating_data():
    if not os.path.exists(product_rating_csv_path):
        print(f"File not found: {product_rating_csv_path}")
        return

    product_rating_df = pd.read_csv(product_rating_csv_path)
    session = SessionLocal()
    print("--- Bắt đầu nhập Rating ---")
    
    for index, row in product_rating_df.iterrows():
        try:
            # Logic của bạn tốt: kiểm tra user và product tồn tại mới insert
            user = session.query(SiteUser).filter(SiteUser.user_id == row['user_id']).first()
            product = session.query(Product).filter(Product.product_id == str(row['productid'])).first()

            if user and product:
                new_rating = ProductRating(
                    user_id=row['user_id'],
                    product_id=str(row['productid']),
                    rating=row['rating']
                )
                session.add(new_rating)
            
            if index % 100 == 0:
                print(f"Rating processed: {index}")
                session.commit()

        except IntegrityError as e:
            session.rollback()
            # print(f"Error inserting rating: {e}") # Có thể bỏ comment để debug kỹ hơn

    session.commit()
    session.close()
    print("--- Hoàn tất nhập Rating ---")

# --- PHẦN QUAN TRỌNG NHẤT: GỌI HÀM ĐỂ CHẠY ---
if __name__ == "__main__":
    print("Bắt đầu quy trình nạp dữ liệu...")
    
    # 1. Nạp User trước (để có user_id cho bảng rating)
    insert_user_data()
    
    # 2. Nạp Product (để có product_id cho bảng rating)
    insert_product_data()
    
    # 3. Nạp Rating (cần cả User và Product đã tồn tại)
    insert_product_rating_data()
    
    print("Đã nạp xong toàn bộ dữ liệu!")