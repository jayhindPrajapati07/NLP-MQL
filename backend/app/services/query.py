from motor.motor_asyncio import AsyncIOMotorClient
import ast

class QueryExecutionService:
    @staticmethod
    async def execute_mql(uri: str, database_name: str, collection_name: str, query: dict | list) -> list:
        """
        Executes a validated MongoDB query against the target database.
        Returns the raw results as a list of dictionaries.
        """
        client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
        try:
            db = client[database_name]
            coll = db[collection_name]
            
            # Simple validation to ensure string queries are converted to dicts if they accidently slip through
            if isinstance(query, str):
                query = ast.literal_eval(query)
                
            # Disallow aggregations that output data
            if isinstance(query, list):
                for stage in query:
                    if "$out" in stage or "$merge" in stage:
                        raise ValueError("Mutation stages are not allowed.")
                cursor = coll.aggregate(query)
                results = []
                async for document in cursor:
                    # Convert ObjectIds to strings for JSON serialization
                    if "_id" in document:
                        document["_id"] = str(document["_id"])
                    results.append(document)
                return results
            elif isinstance(query, dict):
                cursor = coll.find(query)
                results = []
                async for document in cursor:
                    if "_id" in document:
                        document["_id"] = str(document["_id"])
                    results.append(document)
                return results
            else:
                raise ValueError("Query must be a dictionary (find) or list (aggregate)")
        finally:
            client.close()

query_execution_service = QueryExecutionService()
