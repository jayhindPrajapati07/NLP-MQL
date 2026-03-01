import os
from motor.motor_asyncio import AsyncIOMotorClient

SYSTEM_DB_URI = os.getenv("SYSTEM_DB_URI", "mongodb://admin:adminpassword@localhost:27017")
SYSTEM_DB_NAME = "nlp_dashboard_system"

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(SYSTEM_DB_URI)
    print("Connected to MongoDB System Database")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        print("Closed connection to MongoDB System Database")

def get_db():
    return db.client[SYSTEM_DB_NAME]
