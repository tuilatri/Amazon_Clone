"""
Database setup script for user roles.
1. Adds role column to site_user table if not exists
2. Updates all existing users to role=2 (Normal User)
3. Creates Admin 1: admin@gmail.com
4. Creates Admin 2: trihaminh2004@gmail.com
"""

from database import SessionLocal, engine
from models import SiteUser, Base
from sqlalchemy import text
import bcrypt

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def setup_roles():
    db = SessionLocal()
    
    try:
        # 1. Add role column if it doesn't exist (PostgreSQL)
        try:
            db.execute(text("ALTER TABLE site_user ADD COLUMN IF NOT EXISTS role INTEGER DEFAULT 2"))
            db.commit()
            print("✓ Added role column to site_user table (or it already exists)")
        except Exception as e:
            db.rollback()
            print(f"Note: {e}")
        
        # 2. Update all existing users to role = 2 (Normal User)
        result = db.execute(text("UPDATE site_user SET role = 2 WHERE role IS NULL"))
        db.commit()
        print(f"✓ Updated {result.rowcount} users to role=2 (Normal User)")
        
        # 3. Create Admin 1
        admin1_email = "admin@gmail.com"
        admin1 = db.query(SiteUser).filter(SiteUser.email_address == admin1_email).first()
        
        if admin1:
            # Update existing user to admin
            admin1.role = 1
            admin1.user_name = "admin"
            admin1.password = hash_password("!Admin1234")
            print(f"✓ Updated existing user {admin1_email} to Admin role")
        else:
            # Create new admin user
            admin1 = SiteUser(
                user_name="admin",
                email_address="admin@gmail.com",
                phone_number="0123456789",
                password=hash_password("!Admin1234"),
                age=30,
                gender="Other",
                city="Ho Chi Minh City",
                role=1  # Admin
            )
            db.add(admin1)
            print(f"✓ Created Admin 1: {admin1_email}")
        
        # 4. Create Admin 2
        admin2_email = "trihaminh2004@gmail.com"
        admin2 = db.query(SiteUser).filter(SiteUser.email_address == admin2_email).first()
        
        if admin2:
            # Update existing user to admin
            admin2.role = 1
            admin2.user_name = "Hà Minh Trí"
            admin2.password = hash_password("!Haminhtri0812")
            print(f"✓ Updated existing user {admin2_email} to Admin role")
        else:
            # Create new admin user
            admin2 = SiteUser(
                user_name="Hà Minh Trí",
                email_address="trihaminh2004@gmail.com",
                phone_number="0909773173",
                password=hash_password("!Haminhtri0812"),
                age=20,
                gender="Male",
                city="Ho Chi Minh City",
                role=1  # Admin
            )
            db.add(admin2)
            print(f"✓ Created Admin 2: {admin2_email}")
        
        db.commit()
        
        # 5. Verify admin count
        admin_count = db.query(SiteUser).filter(SiteUser.role == 1).count()
        print(f"\n✓ Total number of admin accounts: {admin_count}")
        
        if admin_count > 2:
            print("⚠ Warning: More than 2 admin accounts exist!")
        
        print("\n✓ Database setup completed successfully!")
        print("\nAdmin Accounts:")
        print("  1. admin@gmail.com / !Admin1234")
        print("  2. trihaminh2004@gmail.com / !Haminhtri0812")
        
    except Exception as e:
        db.rollback()
        print(f"Error setting up roles: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    setup_roles()
