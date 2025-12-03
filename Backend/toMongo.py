# toMongo.py – PHIÊN BẢN ĐÃ SỬA HOÀN HẢO
from pymongo.mongo_client import MongoClient
from pymongo.errors import DuplicateKeyError

MONGODB_URI = "mongodb+srv://root:12345@smartonlinemarketplacew.xnnyxwb.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(MONGODB_URI)
db = client["SmartOnlineMarketplaceWebsite"]
user_collection = db["new_user_data"]

def insert_new_user_to_mongo(user_data: dict, postgres_user_id: int):
    """
    Lưu user vào MongoDB cho recommendation
    user_data: chỉ chứa age, gender, city
    postgres_user_id: user_id từ PostgreSQL → dùng làm user_id trong Mongo luôn
    """
    try:
        # Dùng chính user_id từ PostgreSQL → không cần sinh, không sợ trùng!
        user_doc = {
            "user_id": str(postgres_user_id),   # ép string cho đồng bộ với dữ liệu cũ
            "age": user_data["age"],
            "gender": user_data["gender"],
            "city": user_data["city"]
        }
        
        result = user_collection.update_one(
            {"user_id": str(postgres_user_id)},  # nếu đã có thì update
            {"$set": user_doc},
            upsert=True  # nếu chưa có thì insert
        )
        
        if result.upserted_id:
            print(f"[MongoDB] Inserted new user: {postgres_user_id}")
        else:
            print(f"[MongoDB] Updated user: {postgres_user_id}")
            
        return {"status": "success", "mongo_user_id": str(postgres_user_id)}
        
    except Exception as e:
        print(f"[MongoDB] Lỗi khi lưu user {postgres_user_id}: {e}")
        return {"status": "error", "message": str(e)}