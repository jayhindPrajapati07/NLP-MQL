from app.core.database import get_db
from app.models.saved_query import SavedQueryInDB, SavedQueryCreate
from bson import ObjectId

class SavedQueryRepository:
    def __init__(self):
        self.collection_name = "saved_queries"

    @property
    def collection(self):
        return get_db()[self.collection_name]

    async def create(self, query_in: SavedQueryCreate, owner_id: str) -> SavedQueryInDB:
        query_dict = query_in.model_dump()
        query_dict["owner_id"] = owner_id
        # By default, assigned_users is empty list, unless specified
        if "assigned_users" not in query_dict:
            query_dict["assigned_users"] = []
            
        result = await self.collection.insert_one(query_dict)
        query_dict["_id"] = result.inserted_id
        return SavedQueryInDB(**query_dict)

    async def get_by_id(self, query_id: str) -> SavedQueryInDB | None:
        if not ObjectId.is_valid(query_id):
            return None
        query_dict = await self.collection.find_one({"_id": ObjectId(query_id)})
        if query_dict:
            return SavedQueryInDB(**query_dict)
        return None

    async def get_all_by_owner(self, owner_id: str) -> list[SavedQueryInDB]:
        cursor = self.collection.find({"owner_id": owner_id}).sort("created_at", -1)
        queries = []
        async for query_dict in cursor:
            queries.append(SavedQueryInDB(**query_dict))
        return queries
        
    async def get_all_for_assigned_user(self, user_id: str) -> list[SavedQueryInDB]:
        cursor = self.collection.find({"assigned_users": user_id}).sort("created_at", -1)
        queries = []
        async for query_dict in cursor:
            queries.append(SavedQueryInDB(**query_dict))
        return queries

    async def delete(self, query_id: str) -> bool:
        if not ObjectId.is_valid(query_id):
            return False
        result = await self.collection.delete_one({"_id": ObjectId(query_id)})
        return result.deleted_count > 0

    async def update_assignments(self, query_id: str, assigned_users: list[str]) -> SavedQueryInDB:
        await self.collection.update_one(
            {"_id": ObjectId(query_id)},
            {"$set": {"assigned_users": assigned_users}}
        )
        return await self.get_by_id(query_id)

saved_query_repository = SavedQueryRepository()
