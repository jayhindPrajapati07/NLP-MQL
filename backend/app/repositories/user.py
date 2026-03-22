from app.core.database import get_db
from app.models.user import UserInDB, UserCreate
from app.core.security import get_password_hash
from bson import ObjectId

class UserRepository:
    def __init__(self):
        self.collection_name = "users"

    @property
    def collection(self):
        return get_db()[self.collection_name]

    async def get_by_email(self, email: str) -> UserInDB | None:
        user_dict = await self.collection.find_one({"email": email})
        if user_dict:
            return UserInDB(**user_dict)
        return None

    async def get_by_id(self, user_id: str) -> UserInDB | None:
        if not ObjectId.is_valid(user_id):
            return None
        user_dict = await self.collection.find_one({"_id": ObjectId(user_id)})
        if user_dict:
            return UserInDB(**user_dict)
        return None

    async def create(self, user_in: UserCreate) -> UserInDB:
        user_dict = user_in.model_dump()
        user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
        result = await self.collection.insert_one(user_dict)
        user_dict["_id"] = result.inserted_id
        return UserInDB(**user_dict)

    async def get_all(self) -> list[UserInDB]:
        cursor = self.collection.find({})
        users = await cursor.to_list(length=1000)
        return [UserInDB(**u) for u in users]

    async def delete(self, user_id: str) -> bool:
        if not ObjectId.is_valid(user_id):
            return False
        result = await self.collection.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0

user_repository = UserRepository()
