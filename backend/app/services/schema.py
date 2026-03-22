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
                # Sample up to 5 documents to get a richer schema
                cursor = db[col_name].find().limit(5)
                fields = {}
                async for doc in cursor:
                    for key, value in doc.items():
                        fields[key] = type(value).__name__
                
                if fields:
                    schema[col_name] = fields
                else:
                    schema[col_name] = "Collection is empty."
            
            # Post-process to guess relationships
            for col_name, fields in schema.items():
                if isinstance(fields, dict):
                    relations = []
                    for key in fields.keys():
                        if key.endswith("_id") and key != "_id":
                            potential_target = key.replace("_id", "")
                            # Check if potential_target or potential_target + "s" exists
                            target_col = None
                            if potential_target in collections:
                                target_col = potential_target
                            elif potential_target + "s" in collections:
                                target_col = potential_target + "s"
                            
                            if target_col:
                                relations.append(f"{key} matches {target_col}._id")
                    
                    if relations:
                        schema[col_name]["_relationships_guess"] = relations
            
            return schema
        finally:
            client.close()

schema_service = SchemaService()
