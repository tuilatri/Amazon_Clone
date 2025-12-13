from collections import defaultdict
import os
import random
import re
import models
from dotenv import dotenv_values
from fastapi import FastAPI, HTTPException, Depends, status, Request, Form, Body
from typing import List
from pydantic import EmailStr, ValidationError
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, NoResultFound
from passlib.context import CryptContext
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from starlette.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
# from toMongo import insert_new_user_to_mongo
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy import func

# Local imports
from database import engine, SessionLocal
from models import *
from schemas import *
import requests
# from ModelApp.ML_FastAPI_Docker_Heroku import main

# Load environment variables
dotenv_path = os.path.join(os.getcwd(), ".env")
credentials = dotenv_values(dotenv_path)

# Initialize FastAPI app
app = FastAPI()

# Automatically create tables in the database

models.Base.metadata.create_all(bind=engine)
#Do not modify this as need to create table be for insert data
from recommend import (get_search_recommendations, get_collaborative_recommendations,
                       get_item_recommendation, get_association_recommendations)
# from insert_data import *

# @app.on_event("startup")
# async def startup_event():
#     print("Running data insertion task on startup...")
#     insert_product_data()
#     insert_user_data()
#     insert_product_rating_data() 

# CORS Middleware
origins = ["http://localhost:3000"]  # Replace with your frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Password hashing utility
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Generate random 6-digit code for verification
# def generate_verification_code():
#     return str(random.randint(100000, 999999))

# Email Configuration
conf = ConnectionConfig(
    MAIL_USERNAME=credentials['EMAIL'],
    MAIL_PASSWORD=credentials['PASSWORD'],
    MAIL_FROM=credentials['EMAIL'],
    MAIL_PORT=465,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=True,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# Temporary in-memory storage for email -> verification code
# verification_codes = {}

# -------------------------------
# Root and Test Endpoints
# -------------------------------

@app.post("/")
async def root():
    return {"message": "CORS is working"}

# -------------------------------
# User Authentication
# -------------------------------
#Login and register
@app.get("/getUserProfile")
async def getUserInfoByEmail(email: str, db: Session = Depends(get_db)):
    existing_user = db.query(SiteUser).filter(SiteUser.email_address == email).first()
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if user has address - if not, return null values
    user_addresses = db.query(UserAddress).filter(UserAddress.user_id == existing_user.user_id).all()
    
    if not user_addresses:
        # User doesn't have address yet - return user info with null address fields
        return {
            "data": {
                "name": existing_user.user_name,
                "email": existing_user.email_address,
                "phone": existing_user.phone_number,
                "age": existing_user.age,
                "gender": existing_user.gender,
                "city": existing_user.city,
                "unit_number": None,
                "street_number": None,
                "address_line1": None,
                "address_line2": None,
                "region": None,
                "postal_code": None,
            }
        }
    
    address = db.query(Address).filter(Address.address_id == user_addresses[0].address_id).first()
    if not address:
        # Address record not found - return null values
        return {
            "data": {
                "name": existing_user.user_name,
                "email": existing_user.email_address,
                "phone": existing_user.phone_number,
                "age": existing_user.age,
                "gender": existing_user.gender,
                "city": existing_user.city,
                "unit_number": None,
                "street_number": None,
                "address_line1": None,
                "address_line2": None,
                "region": None,
                "postal_code": None,
            }
        }

    return {
        "data": {
            "name": existing_user.user_name,
            "email": existing_user.email_address,
            "phone": existing_user.phone_number,
            "age": existing_user.age,
            "gender": existing_user.gender,
            "city": existing_user.city,
            "unit_number": address.unit_number,
            "street_number": address.street_number,
            "address_line1": address.address_line1,
            "address_line2": address.address_line2,
            "region": address.region,
            "postal_code": address.postal_code,
        }
    }
@app.post("/register")
async def register_user(user: UserResponse, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(SiteUser).filter(SiteUser.email_address == user.email_address).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email address already registered")

    # Generate and store verification code
    # verification_code = generate_verification_code()
    # verification_codes[user.email_address] = verification_code

    # Send email with verification code
    # html = f"<p>Your verification code is: <strong>{verification_code}</strong></p>"
    # message = MessageSchema(subject="Verification Code", recipients=[user.email_address], body=html, subtype=MessageType.html)
    # fm = FastMail(conf)
    # await fm.send_message(message)
    
    # return {"message": "Registration successful. Please check your email for verification."}
    return {"message": "Registration successful."}

# @app.post("/verify-email/")
# async def verify_email(emailValidate: EmailVadidate):
#     email = emailValidate.email
#     code = emailValidate.code
#     if email not in verification_codes:
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email not found. Please register first.")
    
#     if verification_codes[email] != code:
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification code.")
    
#     # Code is correct - remove it from temporary store
#     del verification_codes[email]
#     return {"message": "Email verified successfully."}

# @app.post("/postRegister/")
# async def postRegister(user: UserRegisterRequest, db: Session = Depends(get_db)):
#     # Check if a user with the given email already exists
#     existing_user = db.query(SiteUser).filter(SiteUser.email_address == user.email_address).first()
#     if existing_user:
#         raise HTTPException(status_code=400, detail="User with this email already exists.")

#     # Hash the password
#     hashed_password = hash_password(user.password)

#     try:
#         # Create the SiteUser instance
#         db_user = SiteUser(
#             user_name=user.user_name,
#             age=user.age,
#             gender=user.gender,
#             email_address=user.email_address,
#             phone_number=user.phone_number,
#             city=user.city,
#             password=hashed_password,
#         )
        
#         # Add the user to the session and commit
#         db.add(db_user)
#         db.commit()
#         db.refresh(db_user)
#         new_user = {
#             "age": user.age,
#             "gender": user.gender,
#             "city": user.city
#         }
#         result = insert_new_user_to_mongo(new_user)
#         print(result)
#         # Return the new user's data
#         return {
#             "user": {
#                 "user_id": db_user.user_id,
#                 "user_name": db_user.user_name,
#                 "age": db_user.age,
#                 "gender": db_user.gender,
#                 "email_address": db_user.email_address,
#                 "city": db_user.city,
#             }
#         }
#     except IntegrityError as e:
#         db.rollback()
#         if "unique constraint" in str(e.orig):
#             raise HTTPException(status_code=400, detail="A user with this email already exists.")
#         raise HTTPException(status_code=400, detail="Database integrity error: " + str(e.orig))
#     except Exception as e:
#         db.rollback()
#         raise HTTPException(status_code=500, detail="An unexpected error occurred: " + str(e))

# @app.post("/postRegister/")
# async def postRegister(user: UserRegisterRequest, db: Session = Depends(get_db)):
#     # Kiểm tra email trùng
#     existing_user = db.query(SiteUser).filter(SiteUser.email_address == user.email_address).first()
#     if existing_user:
#         raise HTTPException(status_code=400, detail="User with this email already exists.")

#     hashed_password = hash_password(user.password)

#     try:
#         # 1. Tạo user trong PostgreSQL (DB chính)
#         db_user = SiteUser(
#             user_name=user.user_name,
#             age=user.age,
#             gender=user.gender,
#             email_address=user.email_address,
#             phone_number=user.phone_number,
#             city=user.city,
#             password=hashed_password,
#         )
        
#         db.add(db_user)
#         db.commit()
#         db.refresh(db_user)  # Bây giờ an toàn vì đã commit

#         # 2. Lưu vào MongoDB cho recommendation (dùng user_id thật)
#         mongo_result = insert_new_user_to_mongo(
#             user_data={
#                 "age": user.age,
#                 "gender": user.gender,
#                 "city": user.city
#             },
#             postgres_user_id=db_user.user_id  # <<< QUAN TRỌNG: dùng user_id thật
#         )
#         print("MongoDB result:", mongo_result)

#         # Trả về thông tin user
#         return {
#             "message": "Registration successful",
#             "user": {
#                 "user_id": db_user.user_id,
#                 "user_name": db_user.user_name,
#                 "email_address": db_user.email_address,
#                 "phone_number": db_user.phone_number,
#                 "age": db_user.age,
#                 "gender": db_user.gender,
#                 "city": db_user.city,
#             }
#         }

#     except IntegrityError as e:
#         db.rollback()
#         raise HTTPException(status_code=400, detail="Email hoặc số điện thoại đã được sử dụng")
#     except Exception as e:
#         db.rollback()
#         print("Lỗi đăng ký:", e)
#         raise HTTPException(status_code=500, detail="Đăng ký thất bại")

@app.post("/postRegister/")
async def postRegister(user: UserRegisterRequest, db: Session = Depends(get_db)):
    # 1. Kiểm tra trùng lặp (Email & SĐT)
    existing_email = db.query(SiteUser).filter(SiteUser.email_address == user.email_address).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email này đã được sử dụng.")
    
    existing_phone = db.query(SiteUser).filter(SiteUser.phone_number == user.phone_number).first()
    if existing_phone:
        raise HTTPException(status_code=400, detail="Số điện thoại này đã được sử dụng.")

    hashed_password = hash_password(user.password)

    try:
        # 2. Tạo user trong PostgreSQL (DB chính)
        db_user = SiteUser(
            user_name=user.user_name,
            age=user.age,
            gender=user.gender,
            email_address=user.email_address,
            phone_number=user.phone_number,
            city=user.city,
            password=hashed_password,
            role=user.role,  # Use role from request (2=Users, 3=Suppliers)
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user) 

        # --- ĐÃ XÓA PHẦN LƯU VÀO MONGODB THEO YÊU CẦU CỦA BẠN ---
        # Phần này trước đây gây lỗi vì chưa import hàm, giờ bỏ đi là xong.
        
        # 3. Trả về kết quả thành công
        return {
            "message": "Registration successful",
            "user": {
                "user_id": db_user.user_id,
                "user_name": db_user.user_name,
                "email_address": db_user.email_address,
                "phone_number": db_user.phone_number,
                "age": db_user.age,
                "gender": db_user.gender,
                "city": db_user.city,
            }
        }

    except IntegrityError as e:
        db.rollback()
        print(f"Integrity Error: {e}")
        raise HTTPException(status_code=400, detail="Email hoặc số điện thoại đã tồn tại (Lỗi Database)")
    except Exception as e:
        db.rollback()
        print(f"Lỗi hệ thống: {e}") # Sẽ in ra lỗi cụ thể ở terminal nếu có cái khác
        raise HTTPException(status_code=500, detail="Đăng ký thất bại do lỗi hệ thống")
    
@app.post("/login")
async def login(user: LoginRequire, db: Session = Depends(get_db)):
    # Determine if the input is an email or a username
    if is_email(user.phone_number_or_email):
        existing_user = db.query(SiteUser).filter(SiteUser.email_address == user.phone_number_or_email).first()
    else:
        existing_user = db.query(SiteUser).filter(SiteUser.phone_number == user.phone_number_or_email).first()
    if not existing_user:
        print("User not found in query:", user.phone_number_or_email)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found"
        )

    # Verify the password
    if not verify_password(user.password, existing_user.password):
        hash_password1 = hash_password(user.password)
        print("User not found in query:", hash_password1)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Generate and store verification code
    # verification_code = generate_verification_code()
    # verification_codes[existing_user.email_address] = verification_code

    # Email content with verification code
    # html = f"""
    # <p>Dear {existing_user.user_name},</p>
    # <p>Your verification code is: <strong>{verification_code}</strong></p>
    # <p>Thank you,</p>
    # <p>AI Shopping System</p>
    # """

    # # Send email with verification code
    # message = MessageSchema(
    #     subject="Verification Code",
    #     recipients=[existing_user.email_address],
    #     body=html,
    #     subtype=MessageType.html
    # )

    # fm = FastMail(conf)
    # await fm.send_message(message)

    # Create user response
    user_response = UserResponse(
        user_name=existing_user.user_name,
        email_address=existing_user.email_address,
        phone_number=existing_user.phone_number,
        password=existing_user.password,
        age=existing_user.age,
        gender=existing_user.gender,
        city=existing_user.city,
        role=existing_user.role if existing_user.role else 2  # Default to Normal User
    )

    # return {
    #     "message": "Email sent successfully. Please check your email for verification.",
    #     "user": user_response
    # }
    return {
        "message": "Login successful",
        "user": user_response
    }

@app.post("/postLogin/")
async def postLogin(user: LoginRequire, db: Session = Depends(get_db)):
    # Determine if the input is an email or a username
    if is_email(user.phone_number_or_email):
        existing_user = db.query(SiteUser).filter(SiteUser.email_address == user.phone_number_or_email).first()
    else:
        existing_user = db.query(SiteUser).filter(SiteUser.phone_number == user.phone_number_or_email).first()

    if not existing_user:
        print("User not found in query:", user.phone_number_or_email)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found"
        )
    # Verify the password
    if not verify_password(user.password, existing_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    user_response = UserResponse(
        user_name=existing_user.user_name,
        email_address=existing_user.email_address,
        phone_number=existing_user.phone_number,
        password = existing_user.password
    )

    return {"message": "Login successful", "user": user_response}


# -------------------------------
# 2. User profile api
    # profile display
    # profile update
    # If-else for checking user address status
        # if doesnt have -> create new
        # if have -> update
    # logout
# -------------------------------
@app.post("/postUpdate")
async def postUpdate(changeInfo: UpdateRequire, db: Session = Depends(get_db)):
    # Find the user based on the provided email
    user = db.query(SiteUser).filter(SiteUser.email_address == changeInfo.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update user personal information
    user.user_name = changeInfo.name
    user.phone_number = changeInfo.phone
    user.age = changeInfo.age
    user.gender = changeInfo.gender
    user.city = changeInfo.city
    db.commit()  # Commit the updated user info

    # Check if the user has existing addresses
    user_addresses = db.query(UserAddress).filter(UserAddress.user_id == user.user_id).all()

    if not user_addresses:
        # If no addresses exist, create and link a new address
        new_address = Address(
            unit_number=changeInfo.unit_number,
            street_number=changeInfo.street_number,
            address_line1=changeInfo.address_line1,
            address_line2=changeInfo.address_line2,
            region=changeInfo.region,
            postal_code=changeInfo.postal_code,
        )
        db.add(new_address)
        db.commit()  # Save the new address
        db.refresh(new_address)

        # Link the new address to the user in UserAddress table
        new_user_address = UserAddress(
            user_id=user.user_id,
            address_id=new_address.address_id,
            is_default=True  # Mark this address as the default
        )
        db.add(new_user_address)
        db.commit()  # Save the user-address link

        return {"message": "New address created and linked to user.", "data": {
            "user": {
                "name": user.user_name,
                "email": user.email_address,
                "phone": user.phone_number,
                "age": user.age,
                "gender": user.gender,
                "city": user.city
            },
            "address": {
                "unit_number": new_address.unit_number,
                "street_number": new_address.street_number,
                "address_line1": new_address.address_line1,
                "address_line2": new_address.address_line2,
                "region": new_address.region,
                "postal_code": new_address.postal_code
            }
        }}

    else:
        # If addresses exist, update the first address (or modify logic as needed)
        address = db.query(Address).filter(Address.address_id == user_addresses[0].address_id).first()
        if address:
            address.unit_number = changeInfo.unit_number
            address.street_number = changeInfo.street_number
            address.address_line1 = changeInfo.address_line1
            address.address_line2 = changeInfo.address_line2
            address.region = changeInfo.region
            address.postal_code = changeInfo.postal_code
            db.commit()  # Commit the updated address

        else:
            raise HTTPException(status_code=404, detail="Address not found for user")

    # Return updated user and address data
    return {"message": "User information updated successfully", "data": {
        "user": {
            "name": user.user_name,
            "email": user.email_address,
            "phone": user.phone_number,
            "age": user.age,
            "gender": user.gender,
            "city": user.city
        },
        "address": {
            "unit_number": address.unit_number if address else None,
            "street_number": address.street_number if address else None,
            "address_line1": address.address_line1 if address else None,
            "address_line2": address.address_line2 if address else None,
            "region": address.region if address else None,
            "postal_code": address.postal_code if address else None
        }
    }}

# -------------------------------
# Forgot Password
# -------------------------------

@app.post("/forgetpassword")
async def forgetpassword(email: FPEmail, db: Session = Depends(get_db)):
    existing_user = db.query(SiteUser).filter(SiteUser.email_address == email.email).first()
    if not existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Your Email Has Not Registered!!!")

    # Generate and store verification code
    verification_code = generate_verification_code()
    verification_codes[email.email] = verification_code

    # Send email with verification code
    html = f"<p>Your verification code is: <strong>{verification_code}</strong></p>"
    message = MessageSchema(subject="Password Reset Code", recipients=[email.email], body=html, subtype=MessageType.html)
    fm = FastMail(conf)
    # await fm.send_message(message)
    
    return {"message": "Please check your email for the verification code."}

@app.post("/postForgetPassword/")
async def postForgetPassword(changeInfo: ChangePasswordInfor, db: Session = Depends(get_db)):
    if changeInfo.newPassword != changeInfo.confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # Hash the new password
    hashed_password = hash_password(changeInfo.newPassword)

    # Update the password in the database
    user = db.query(SiteUser).filter(SiteUser.email_address == changeInfo.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password = hashed_password
    db.commit()

    return {"message": "Password changed successfully"}

# -------------------------------
# Utility Functions
# -------------------------------

def is_email(input_str):
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, input_str) is not None
    
# 3. Home page (Store page)
    # home page display
    # recommend product (do after have ai model)
    # categories (show different product categories)
@app.get("/getAllProduct/")
async def get_all_products(db: Session = Depends(get_db)):
    all_products = db.query(Product).all()  # Returns a list of Product objects

    # Group products by main category
    grouped_products_by_category = defaultdict(list)

    for product in all_products:
        grouped_products_by_category[product.main_category].append(product)

    # Result to hold top 20 products for each main category
    result = {}

    # Process each main category
    for main_category, products in grouped_products_by_category.items():
        # Sort products first by number of ratings (highest), then by average rating (highest)
        sorted_products = sorted(products, key=lambda p: (p.no_of_ratings, p.average_rating), reverse=True)
        
        # Take top 20 products
        top_products = sorted_products[:20]

        # Prepare the result format for the top 20 products
        result[main_category] = [
            {
                "product_id": product.product_id,
                "product_name": product.product_name,
                "main_category": product.main_category,
                "main_category_encoded": product.main_category_encoded,
                "sub_category": product.sub_category,
                "sub_category_encoded": product.sub_category_encoded,
                "product_image": product.product_image,
                "product_link": product.product_link,
                "average_rating": product.average_rating,
                "no_of_ratings": product.no_of_ratings,
                "discount_price_usd": product.discount_price_usd,
                "actual_price_usd": product.actual_price_usd,
                "category_id": product.category_id
            }
            for product in top_products
        ]

    return result
    

@app.get("/getHomePageProduct/")
async def get_home_page_product(userid: int, db: Session = Depends(get_db)):
    
    result = get_collaborative_recommendations(str(userid))
    
    all_products = db.query(Product).filter(
        Product.product_id.in_(result)
    ).all()  # Returns a list of Product objects
    
    return [
        {
            "product_id": product.product_id,
            "product_name": product.product_name,
            "main_category": product.main_category,
            "main_category_encoded": product.main_category_encoded,
            "sub_category": product.sub_category,
            "sub_category_encoded": product.sub_category_encoded,
            "product_image": product.product_image,
            "product_link": product.product_link,
            "average_rating": product.average_rating,
            "no_of_ratings": product.no_of_ratings,
            "discount_price_usd": product.discount_price_usd,
            "actual_price_usd": product.actual_price_usd,
        }
        for product in all_products
    ]


# Get products by category name
@app.get("/getProductbyCategory/", response_model=List[dict])
async def get_products_by_category(categoryencode: str, db: Session = Depends(get_db)):
    # Query products based on categoryencode
    products_by_category = db.query(Product).filter(Product.main_category_encoded == categoryencode).all()

    if not products_by_category:
        raise HTTPException(status_code=404, detail="No products found for this category")

    return [
        {
            "product_id": product.product_id,
            "product_name": product.product_name,
            "main_category": product.main_category,
            "main_category_encoded": product.main_category_encoded,
            "sub_category": product.sub_category,
            "sub_category_encoded": product.sub_category_encoded,
            "product_image": product.product_image,
            "product_link": product.product_link,
            "average_rating": product.average_rating,
            "no_of_ratings": product.no_of_ratings,
            "discount_price_usd": product.discount_price_usd,
            "actual_price_usd": product.actual_price_usd,
            "category_id": product.category_id,
        }
        for product in products_by_category
    ]


# Get ALL products from database as a flat list (for Product page with no category filter)
@app.get("/getAllProductsFlat/", response_model=List[dict])
async def get_all_products_flat(db: Session = Depends(get_db)):
    """Return all products from database as a flat list for the Product page."""
    all_products = db.query(Product).all()

    if not all_products:
        raise HTTPException(status_code=404, detail="No products found")

    return [
        {
            "product_id": product.product_id,
            "product_name": product.product_name,
            "main_category": product.main_category,
            "main_category_encoded": product.main_category_encoded,
            "sub_category": product.sub_category,
            "sub_category_encoded": product.sub_category_encoded,
            "product_image": product.product_image,
            "product_link": product.product_link,
            "average_rating": product.average_rating,
            "no_of_ratings": product.no_of_ratings,
            "discount_price_usd": product.discount_price_usd,
            "actual_price_usd": product.actual_price_usd,
            "category_id": product.category_id,
        }
        for product in all_products
    ]


# Get highest rated products (for Cart page when empty)
@app.get("/getHighestRatedProducts/", response_model=List[dict])
async def get_highest_rated_products(db: Session = Depends(get_db)):
    """Return top 50 products sorted by highest average rating and number of ratings."""
    highest_rated = db.query(Product).order_by(
        Product.average_rating.desc(),
        Product.no_of_ratings.desc()
    ).limit(50).all()

    if not highest_rated:
        return []

    return [
        {
            "product_id": product.product_id,
            "product_name": product.product_name,
            "main_category": product.main_category,
            "main_category_encoded": product.main_category_encoded,
            "sub_category": product.sub_category,
            "sub_category_encoded": product.sub_category_encoded,
            "product_image": product.product_image,
            "product_link": product.product_link,
            "average_rating": product.average_rating,
            "no_of_ratings": product.no_of_ratings,
            "discount_price_usd": product.discount_price_usd,
            "actual_price_usd": product.actual_price_usd,
            "category_id": product.category_id,
        }
        for product in highest_rated
    ]


# Get all categories
@app.get("/getAllCategory/")
async def get_all_categories(db: Session = Depends(get_db)):
    # Query the database and get a list of categories
    all_category = db.query(Product.main_category).distinct().all()  # Get distinct categories
    # Extract the main_category values from the result tuple
    categories = [category[0] for category in all_category]
    return {"categories": categories}


# ------------------------------
# 4. Search Products Page
# ------------------------------

# done
@app.get("/products/search", response_model=ProductResponse)
async def search_products(query: str = "", db: Session = Depends(get_db)):
    """Search products by name or category."""

    product_ids = get_search_recommendations(query)
    
    products = db.query(Product).filter(
        Product.product_id.in_(product_ids)
    ).all()

    if not products:
        return JSONResponse(status_code=404, content={"message": "No products found."})
    
    return {"products": products}

# ------------------------------
# 4.1. Product Detail Page
# ------------------------------

@app.get("/Item/{product_id}")
async def get_product_detail(product_id: str, db: Session = Depends(get_db)):
    """Fetch detailed information for a specific product."""
    
    product = db.query(Product).filter(
        Product.product_id == product_id
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return [
        {
            "product_id": product.product_id,
            "product_name": product.product_name,
            "main_category": product.main_category,
            "main_category_encoded": product.main_category_encoded,
            "sub_category": product.sub_category,
            "sub_category_encoded": product.sub_category_encoded,
            "product_image": product.product_image,
            "product_link": product.product_link,
            "average_rating": product.average_rating,
            "no_of_ratings": product.no_of_ratings,
            "discount_price_usd": product.discount_price_usd,
            "actual_price_usd": product.actual_price_usd,
        }
    ]


@app.get("/RelatedItem/{product_id}")
async def related_item(product_id: str, db: Session = Depends(get_db)):
    product_ids = get_item_recommendation(product_id)
    
    products = db.query(Product).filter(
        Product.product_id.in_(product_ids)
    ).all()

    if not products:
        return JSONResponse(status_code=404, content={"message": "No products found."})
    
    return {"products": products}
    

@app.post("/addToCart/")
async def add_to_cart(request: AddToCartRequest, db: Session = Depends(get_db)):
    product_id = request.product_id.strip()  # Ensure no trailing spaces
    user_email = request.user_email

    # Get user and product
    user = db.query(SiteUser).filter(SiteUser.email_address == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Get or create shopping cart
    cart = db.query(ShoppingCart).filter(ShoppingCart.user_id == user.user_id).first()
    if not cart:
        cart = ShoppingCart(user_id=user.user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    # Check for existing cart item
    cart_item = db.query(ShoppingCartItem).filter(
        ShoppingCartItem.shopping_cart_id == cart.shopping_cart_id,
        ShoppingCartItem.product_id == product.product_id
    ).first()

    if cart_item:
        cart_item.quantity += request.quantity
    else:
        new_cart_item = ShoppingCartItem(
            shopping_cart_id=cart.shopping_cart_id,
            product_id=product.product_id,
            quantity=request.quantity,
            price=product.discount_price_usd
        )
        db.add(new_cart_item)

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database commit failed: {e}")

    return {"message": "Product added to cart successfully"}



# ------------------------------
# 5. Cart Page
# ------------------------------

# @app.get("/cart")
# async def view_cart(db: Session = Depends(get_db)):
#     """View all items in the cart and calculate total price."""
#     cart_items = db.query(ShoppingCartItem).all()

#     if not cart_items:
#         return {"cart": [], "total_price": 0}

#     total_price = sum(item.quantity * float(item.price) for item in cart_items)
#     return {
#         "cart": [
#             {
#                 "product_id": item.product_item_id,
#                 "quantity": item.quantity,
#                 "price": float(item.price),
#             }
#             for item in cart_items
#         ],
#         "total_price": total_price,
#     }

# @app.delete("/cart/remove/{product_id}")
# async def remove_from_cart(product_id: int, db: Session = Depends(get_db)):
#     """Remove a product from the cart."""
#     cart_item = db.query(ShoppingCartItem).filter(ShoppingCartItem.product_item_id == product_id).first()

#     if not cart_item:
#         raise HTTPException(status_code=404, detail="Cart item not found")

#     db.delete(cart_item)
#     db.commit()
#     return {"message": "Item removed from cart."}

# @app.post("/cart/checkout")
# async def checkout(db: Session = Depends(get_db)):
#     """Checkout the cart and clear all items."""
#     cart_items = db.query(ShoppingCartItem).all()

#     if not cart_items:
#         raise HTTPException(status_code=400, detail="Cart is empty")

#     # Simulate order creation (details like user and payment skipped for now)
#     order_total = sum(item.quantity * float(item.price) for item in cart_items)
#     db.query(ShoppingCartItem).delete()
#     db.commit()

#     return {"message": "Checkout successful.", "order_total": order_total}

@app.post("/cart/add")
async def add_to_cart(
    product_id: int = Body(..., embed=True),
    quantity: int = Body(..., embed=True),
    db: Session = Depends(get_db),
):
    """
    Add a product to the cart or update its quantity if already in the cart.
    """
    if quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")

    # Check if product exists
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if the product is already in the cart
    cart_item = db.query(ShoppingCartItem).filter(ShoppingCartItem.product_item_id == product_id).first()

    if cart_item:
        cart_item.quantity += quantity
    else:
        # Add new item to the cart
        new_cart_item = ShoppingCartItem(product_item_id=product_id, quantity=quantity, price=product.discount_price_usd)
        db.add(new_cart_item)

    db.commit()

    return {"message": f"{quantity} unit(s) of '{product.product_name}' added to cart."}

# ------------------------------
# Additional Features from Frontend Observed in Product.js
# ------------------------------

@app.post("/categories")
async def get_product_categories(db: Session = Depends(get_db)):
    """
    Fetch distinct product categories for filtering.
    """
    categories = db.query(Product.main_category).distinct().all()
    return {"categories": [category[0] for category in categories]}

# ------------------------------
# Cart Display
# ------------------------------

@app.post("/cartRelatedItems")
async def cart_related_items(
    request: CartFetch,
    db: Session = Depends(get_db),
):
    # Find user by email
    user = db.query(SiteUser).filter(SiteUser.email_address == request.user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Find the shopping cart for this user
    cart = db.query(ShoppingCart).filter(ShoppingCart.user_id == user.user_id).first()
    if not cart:
        return {"products": []}

    cart_id = cart.shopping_cart_id

    # Check the request type if you want, but since this is for related items, we only need to display
    # and find product_ids from the cart items.
    if request.type == "display":
        cart_items = (
            db.query(ShoppingCartItem, Product)
            .join(Product, ShoppingCartItem.product_id == Product.product_id)
            .filter(ShoppingCartItem.shopping_cart_id == cart_id)
            .all()
        )

        if not cart_items:
            return {"products": []}

        product_ids_in_cart = [item.ShoppingCartItem.product_id for item in cart_items]

        recommended_product_ids = get_association_recommendations(product_ids_in_cart)

        recommended_products = db.query(Product).filter(
            Product.product_id.in_(recommended_product_ids)
        ).all()

        if not recommended_products:
            return JSONResponse(status_code=404, content={"message": "No related products found."})

        return {
            "products": [
                {
                    "product_id": product.product_id,
                    "product_name": product.product_name,
                    "product_image": product.product_image,
                    "product_link": product.product_link,
                    "average_rating": product.average_rating,
                    "no_of_ratings": product.no_of_ratings,
                    "discount_price_usd": str(product.discount_price_usd),
                    "actual_price_usd": str(product.actual_price_usd),
                }
                for product in recommended_products
            ]
        }

    # If request.type is not "display", you can handle other cases or return an error
    return JSONResponse(status_code=400, content={"message": "Invalid request type."})


@app.post("/cart")
async def handle_cart(
    request: CartFetch,
    db: Session = Depends(get_db),
):
    # Find user by email
    user = db.query(SiteUser).filter(SiteUser.email_address == request.user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find the shopping cart
    cart = db.query(ShoppingCart).filter(ShoppingCart.user_id == user.user_id).first()
    if not cart:
        return {"cart": []}
    cart_id = cart.shopping_cart_id

    if request.type == "display":
        # Fetch cart items and associated product information
        cart_items = (
            db.query(ShoppingCartItem, Product)
            .join(Product, ShoppingCartItem.product_id == Product.product_id)
            .filter(ShoppingCartItem.shopping_cart_id == cart_id)
            .all()
        )
        
        if not cart_items:
            return {"cart": []}
        
        # Format the response
        return {
            "cart": [
                {
                    "shopping_cart_id": item.ShoppingCartItem.shopping_cart_id,
                    "product_id": item.Product.product_id,
                    "quantity": item.ShoppingCartItem.quantity,
                    "price": item.ShoppingCartItem.price,
                    "product_name": item.Product.product_name,
                    "product_image": item.Product.product_image,
                    "average_rating": item.Product.average_rating,
                    "discount_price_usd": str(item.Product.discount_price_usd),  # Ensure proper serialization
                    "actual_price_usd": str(item.Product.actual_price_usd),
                }
                for item in cart_items
            ]
        }

    elif request.type == "remove":
        # Remove a specific product from the cart
        cart_item = (
            db.query(ShoppingCartItem)
            .filter(
                ShoppingCartItem.shopping_cart_id == cart_id,
                ShoppingCartItem.product_id == request.product_id
            )
            .first()
        )
        if not cart_item:
            raise HTTPException(status_code=404, detail="Product not found in cart")
        
        db.delete(cart_item)
        db.commit()
        return {"message": f"Product {request.product_id} removed from cart."}

    elif request.type == "remove-all":
        db.query(ShoppingCartItem).filter(ShoppingCartItem.shopping_cart_id == cart_id).delete()
        db.commit()
        return {"message": "All items removed from cart."}

    elif request.type == "update-quantity":
        cart_item = (
            db.query(ShoppingCartItem)
            .filter(
                ShoppingCartItem.shopping_cart_id == cart_id,
                ShoppingCartItem.product_id == request.product_id
            )
            .first()
        )
        if not cart_item:
            raise HTTPException(status_code=404, detail="Item not found in cart")
        cart_item.quantity = request.quantity
        db.commit()
        return {"message": "Quantity updated successfully"}

    else:
        raise HTTPException(status_code=400, detail="Invalid operation type")

# ------------------------------
# Remove Item from Cart
# ------------------------------

@app.post("/cart/remove")
async def remove_from_cart(product_id: int = Body(..., embed=True), db: Session = Depends(get_db)):
    """
    Remove a specific item from the cart by product_id.
    """
    cart_item = db.query(ShoppingCartItem).filter(ShoppingCartItem.product_item_id == product_id).first()

    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed from cart."}

# ------------------------------
# Checkout (Clear Cart)
# ------------------------------

@app.post("/cart/checkout")
async def checkout(db: Session = Depends(get_db)):
    """
    Clear the cart and complete the checkout process.
    """
    cart_items = db.query(ShoppingCartItem).all()

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Simulate order processing
    order_total = sum(item.quantity * float(item.price) for item in cart_items)

    # Clear the cart
    db.query(ShoppingCartItem).delete()
    db.commit()

    return {"message": "Checkout successful", "order_total": order_total}

# ------------------------------
# Payment Methods API
# ------------------------------

@app.get("/api/payment-methods")
async def get_payment_methods(db: Session = Depends(get_db)):
    """
    Fetch all available payment methods from PaymentType table.
    """
    payment_methods = db.query(PaymentType).all()
    
    return {
        "payment_methods": [
            {
                "id": pm.payment_type_id,
                "name": pm.payment_name
            }
            for pm in payment_methods
        ]
    }

# ------------------------------
# Shipping Methods API
# ------------------------------

@app.get("/api/shipping-methods")
async def get_shipping_methods(db: Session = Depends(get_db)):
    """
    Fetch all available shipping methods with their prices.
    """
    shipping_methods = db.query(ShippingMethod).all()
    
    return {
        "shipping_methods": [
            {
                "id": sm.shipping_method_id,
                "type": sm.type,
                "price": float(sm.price)
            }
            for sm in shipping_methods
        ]
    }

# ------------------------------
# Create Order API
# ------------------------------

@app.post("/api/create-order")
async def create_order_api(request: CreateOrderRequest, db: Session = Depends(get_db)):
    """
    Create a new order with selected payment and shipping methods.
    Saves the order to shop_order and order_line tables.
    """
    from datetime import datetime
    
    # Find the user by email
    user = db.query(SiteUser).filter(SiteUser.email_address == request.user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate payment method exists
    payment_method = db.query(PaymentType).filter(PaymentType.payment_type_id == request.payment_method_id).first()
    if not payment_method:
        raise HTTPException(status_code=400, detail="Invalid payment method")
    
    # Validate shipping method exists
    shipping_method = db.query(ShippingMethod).filter(ShippingMethod.shipping_method_id == request.shipping_method_id).first()
    if not shipping_method:
        raise HTTPException(status_code=400, detail="Invalid shipping method")
    
    if not request.items or len(request.items) == 0:
        raise HTTPException(status_code=400, detail="No items in order")
    
    # Calculate order total (items + shipping)
    items_total = sum(item.quantity * item.price for item in request.items)
    shipping_cost = float(shipping_method.price)
    order_total = items_total + shipping_cost
    
    try:
        # Create the order
        new_order = ShopOrder(
            user_id=user.user_id,
            order_date=datetime.now().date(),
            order_total=order_total,
            payment_method_id=request.payment_method_id,  # References payment_type_id
            shipping_method_id=request.shipping_method_id,
            order_status_id=1,  # 'Pending' status
        )
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        
        # Add order lines for each item
        for item in request.items:
            order_line = OrderLine(
                order_id=new_order.order_id,
                product_id=item.product_id,  # Changed from product_item_id
                qty=item.quantity,
                price=item.price,
            )
            db.add(order_line)

        
        db.commit()
        
        # Clear user's cart items that were ordered
        shopping_cart = db.query(ShoppingCart).filter(ShoppingCart.user_id == user.user_id).first()
        if shopping_cart:
            for item in request.items:
                cart_item = db.query(ShoppingCartItem).filter(
                    ShoppingCartItem.shopping_cart_id == shopping_cart.shopping_cart_id,
                    ShoppingCartItem.product_id == item.product_id
                ).first()
                if cart_item:
                    db.delete(cart_item)
            db.commit()
        
        return {
            "message": "Order created successfully",
            "order_id": new_order.order_id,
            "order_total": float(order_total),
            "items_total": float(items_total),
            "shipping_cost": shipping_cost,
            "payment_method": payment_method.payment_name,
            "shipping_method": shipping_method.type
        }
        
    except Exception as e:
        db.rollback()
        print(f"Error creating order: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

# ------------------------------
# 6. Order Page
# ------------------------------

@app.post("/order/history")
async def get_order_history(user_email: str = Body(..., embed=True), db: Session = Depends(get_db)):
    """Fetch all orders for a user by email."""
    # Find user by email
    user = db.query(SiteUser).filter(SiteUser.email_address == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all orders for this user
    orders = db.query(ShopOrder).filter(ShopOrder.user_id == user.user_id).order_by(ShopOrder.order_date.desc()).all()
    
    result = []
    for order in orders:
        # Get order lines with product details
        order_lines = db.query(OrderLine).filter(OrderLine.order_id == order.order_id).all()
        
        items = []
        for line in order_lines:
            # Get product details
            product = db.query(Product).filter(Product.product_id == line.product_id).first()
            items.append({
                "product_id": line.product_id,
                "qty": line.qty,
                "price": float(line.price),
                "product_name": product.product_name if product else "Unknown Product",
                "product_image": product.product_image if product else ""
            })
        
        result.append({
            "order_id": order.order_id,
            "order_date": str(order.order_date),
            "order_total": float(order.order_total),
            "payment_method_id": order.payment_method_id,
            "shipping_method_id": order.shipping_method_id,
            "order_status_id": order.order_status_id,
            "items": items
        })
    
    return {"orders": result, "total_count": len(result)}

@app.get("/order/{order_id}")
async def get_order_detail(order_id: int, db: Session = Depends(get_db)):
    """Fetch details of a specific order."""
    order = db.query(ShopOrder).filter(ShopOrder.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Get order lines with product details
    order_lines = db.query(OrderLine).filter(OrderLine.order_id == order.order_id).all()
    
    items = []
    for line in order_lines:
        product = db.query(Product).filter(Product.product_id == line.product_id).first()
        items.append({
            "product_id": line.product_id,
            "qty": line.qty,
            "price": float(line.price),
            "product_name": product.product_name if product else "Unknown Product",
            "product_image": product.product_image if product else ""
        })
    
    return {
        "order_id": order.order_id,
        "order_date": str(order.order_date),
        "order_total": float(order.order_total),
        "payment_method_id": order.payment_method_id,
        "shipping_method_id": order.shipping_method_id,
        "order_status_id": order.order_status_id,
        "items": items
    }

# ------------------------------
# Cancel Order API
# ------------------------------

@app.post("/order/cancel")
async def cancel_order(
    order_id: int = Body(..., embed=True),
    user_email: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """
    Cancel an order - only allowed if order status is Pending (id=1).
    Changes order status to Cancelled (id=5).
    """
    # Find user by email
    user = db.query(SiteUser).filter(SiteUser.email_address == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find the order
    order = db.query(ShopOrder).filter(ShopOrder.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Verify the order belongs to this user
    if order.user_id != user.user_id:
        raise HTTPException(status_code=403, detail="You are not authorized to cancel this order")
    
    # Check if order is in Pending status (id=1)
    if order.order_status_id != 1:
        raise HTTPException(
            status_code=400, 
            detail="Only orders with Pending status can be cancelled"
        )
    
    # Update status to Cancelled (id=5)
    order.order_status_id = 5
    db.commit()
    
    return {
        "message": "Order cancelled successfully",
        "order_id": order.order_id,
        "new_status": "Cancelled"
    }


# ------------------------------
# Checkout Display
# ------------------------------

@app.post("/get_association_recommendations")
async def display_checkout(ids: list[str], db: Session = Depends(get_db)):

    return
@app.post("/checkout/display")
async def display_checkout(db: Session = Depends(get_db)):
    """
    Fetch items in the cart, total price, and available payment and shipping methods.
    """
    cart_items = db.query(ShoppingCartItem).all()

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total_price = sum(item.quantity * float(item.price) for item in cart_items)

    payment_methods = db.query(UserPaymentMethod).all()
    shipping_methods = db.query(ShippingMethod).all()

    return {
        "cart_items": [
            {
                "product_id": item.product_item_id,
                "name": item.product_item.product_name if item.product_item else "Unknown Product",
                "price": float(item.price),
                "quantity": item.quantity,
                "imageUrl": item.product_item.product_image if item.product_item else "",
            }
            for item in cart_items
        ],
        "total_price": total_price,
        "payment_methods": [
            {"id": method.payment_method_id, "provider": method.provider, "account_number": method.account_number}
            for method in payment_methods
        ],
        "shipping_methods": [
            {"id": method.shipping_method_id, "type": method.type, "price": float(method.price)}
            for method in shipping_methods
        ],
    }

# ------------------------------
# Order Create
# ------------------------------

@app.post("/checkout/create-order")
async def create_order(
    payment_method_id: int = Body(..., embed=True),
    shipping_method_id: int = Body(..., embed=True),
    db: Session = Depends(get_db),
):
    """
    Create an order with the selected payment and shipping methods.
    """
    cart_items = db.query(ShoppingCartItem).all()

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total_price = sum(item.quantity * float(item.price) for item in cart_items)

    # Create the order
    new_order = ShopOrder(
        user_id=1,  # Replace with actual user ID from authentication
        order_date=datetime.now(),
        order_total=total_price,
        payment_method_id=payment_method_id,
        shipping_method_id=shipping_method_id,
        order_status_id=1,  # Assuming '1' is the ID for 'Pending' status
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Add order lines
    for item in cart_items:
        order_line = OrderLine(
            order_id=new_order.order_id,
            product_item_id=item.product_item_id,
            qty=item.quantity,
            price=item.price,
        )
        db.add(order_line)

    # Clear the cart
    db.query(ShoppingCartItem).delete()
    db.commit()

    return {"message": "Order created successfully", "order_id": new_order.order_id}

# ------------------------------
# Order Display
# ------------------------------

@app.post("/order/{order_id}")
async def get_order(order_id: int, db: Session = Depends(get_db)):
    """
    Fetch and display details for a specific order by order_id.
    """
    order = db.query(ShopOrder).filter(ShopOrder.order_id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "order_id": order.order_id,
        "order_date": order.order_date,
        "total_price": float(order.order_total),
        "status": order.order_status.status if order.order_status else "Unknown",
        "items": [
            {"product_id": line.product_item_id, "quantity": line.qty, "price": float(line.price)}
            for line in order.order_lines
        ],
        "payment_method": {
            "provider": order.payment_method.provider,
            "account_number": order.payment_method.account_number,
        } if order.payment_method else None,
        "shipping_method": {
            "type": order.shipping_method.type,
            "price": float(order.shipping_method.price),
        } if order.shipping_method else None,
    }

# ------------------------------
# Order History
# ------------------------------

@app.post("/order/history")
async def get_order_history(db: Session = Depends(get_db)):
    """
    Fetch a list of all past orders for the user.
    """
    orders = db.query(ShopOrder).filter(ShopOrder.user_id == 1).all()  # Replace with actual user ID

    if not orders:
        return {"message": "No past orders found", "orders": []}

    return [
        {
            "order_id": order.order_id,
            "order_date": order.order_date,
            "total_price": float(order.order_total),
            "status": order.order_status.status if order.order_status else "Unknown",
        }
        for order in orders
    ]

# ------------------------------
# Payment Processing (Simulated)
# ------------------------------

@app.post("/payment/process")
async def process_payment(order_id: int = Body(..., embed=True), db: Session = Depends(get_db)):
    """
    Simulate payment processing for a specific order.
    """
    order = db.query(ShopOrder).filter(ShopOrder.order_id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Simulate payment processing
    order.order_status_id = 2  # Assuming '2' is the ID for 'Completed' status
    db.commit()

    return {"message": "Payment processed successfully", "order_id": order.order_id}


# 4 Search products page
    # products display

# 4.1. Product detail page
    # product details display/{product_id}
    # add to cart
        # if a product already in cart, add quantity
    
# 5. Cart page
    # cart display
    # calculate total price
    # remove item from cart
    # cart checkout
    
# 6. Order page
    # checkout display (display items, total price, payment, shipping methods)
    # order create (provide payment and shipping methods)
    # order display/{order_id}
    # order history
    # payment
    
"""
Summary of API Endpoints:
User Authentication:
    POST /login
    POST /register
    GET /check-email
User Profile:
    GET /profile
    POST /profile/update
    GET /user-address
    POST /user-address
    POST /logout
Home Page:
    GET /home
    GET /categories
    GET /recommended-products
Product Pages:
    GET /products
    GET /products/{product_id}
    POST /add-to-cart
Cart:
    GET /cart
    POST /cart/checkout
    POST /remove-from-cart
Order:
    GET /checkout
    POST /order/create
    GET /order/{order_id}
    GET /order-history
    POST /payment
"""
