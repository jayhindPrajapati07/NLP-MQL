from motor.motor_asyncio import AsyncIOMotorClient

class SchemaService:
    @staticmethod
    async def extract_schema(uri: str, database_name: str) -> dict:
        """
        Connects to an external MongoDB database, samples 1 document from each
        collection, and returns a schema representation mapping collection names to
        their fields and types.
        """
        client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
        try:
            db = client[database_name]
            collections = await db.list_collection_names()
            
            schema = {}
            for col_name in collections:
                # Exclude system collections
                if col_name.startswith("system."):
                    continue
                    
                sample_doc = await db[col_name].find_one()
                if sample_doc:
                    # Extract keys and their types
                    fields = {key: type(value).__name__ for key, value in sample_doc.items()}
                    schema[col_name] = fields
                else:
                    schema[col_name] = "Collection is empty."
            
            return schema
        finally:
            client.close()

schema_service = SchemaService()
