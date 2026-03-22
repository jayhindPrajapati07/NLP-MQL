from app.core.database import get_db
from app.models.connection import ConnectionInDB, ConnectionCreate
from app.core.encryption import encrypt_uri
from bson import ObjectId

class ConnectionRepository:
    def __init__(self):
        self.collection_name = "connections"

    @property
    def collection(self):
        return get_db()[self.collection_name]

    async def create(self, conn_in: ConnectionCreate, owner_id: str) -> ConnectionInDB:
        conn_dict = conn_in.model_dump()
        raw_uri = conn_dict.pop("uri")
        conn_dict["encrypted_uri"] = encrypt_uri(raw_uri)
        conn_dict["owner_id"] = owner_id
        
        result = await self.collection.insert_one(conn_dict)
        conn_dict["_id"] = result.inserted_id
        return ConnectionInDB(**conn_dict)

    async def get_by_id(self, conn_id: str) -> ConnectionInDB | None:
        if not ObjectId.is_valid(conn_id):
            return None
        conn_dict = await self.collection.find_one({"_id": ObjectId(conn_id)})
        if conn_dict:
            return ConnectionInDB(**conn_dict)
        return None

    async def get_all_by_owner(self, owner_id: str) -> list[ConnectionInDB]:
        cursor = self.collection.find({"owner_id": owner_id})
        connections = []
        async for conn_dict in cursor:
            connections.append(ConnectionInDB(**conn_dict))
        return connections

    async def update(self, conn_id: str, conn_in: ConnectionCreate) -> ConnectionInDB | None:
        if not ObjectId.is_valid(conn_id):
            return None
        
        conn_dict = conn_in.model_dump()
        raw_uri = conn_dict.pop("uri")
        conn_dict["encrypted_uri"] = encrypt_uri(raw_uri)
        
        await self.collection.update_one(
            {"_id": ObjectId(conn_id)},
            {"$set": conn_dict}
        )
        return await self.get_by_id(conn_id)

    async def delete(self, conn_id: str) -> bool:
        if not ObjectId.is_valid(conn_id):
            return False
        result = await self.collection.delete_one({"_id": ObjectId(conn_id)})
        return result.deleted_count > 0

connection_repository = ConnectionRepository()
