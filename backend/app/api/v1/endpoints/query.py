from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.api.deps import get_current_active_user
from app.models.user import UserInDB
from app.repositories.connection import connection_repository
from app.core.encryption import decrypt_uri
from app.services.schema import schema_service
from app.services.llm import llm_service
from app.services.query import query_execution_service

router = APIRouter()

class QueryRequest(BaseModel):
    natural_language: str
    connection_id: str

class QueryResponse(BaseModel):
    mql: dict | list
    results: list
    collection: str

@router.post("/", response_model=QueryResponse)
async def ask_question(
    query_req: QueryRequest,
    current_user: UserInDB = Depends(get_current_active_user)
):
    # 1. Fetch connection profile
    conn = await connection_repository.get_by_id(query_req.connection_id)
    if not conn or conn.owner_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Connection not found or access denied")
        
    uri = decrypt_uri(conn.encrypted_uri)
    
    try:
        # 2. Extract schema
        schema = await schema_service.extract_schema(
            uri=uri, database_name=conn.database_name
        )
        
        # 3. Request LLM to generate MQL
        mql_output = await llm_service.generate_mql(
            natural_language_query=query_req.natural_language,
            schema_context=schema
        )
        
        target_collection = mql_output.get("collection")
        mql_query = mql_output.get("query")
        
        if not target_collection or not mql_query:
            raise ValueError("LLM failed to output a target collection and query.")
            
        # 4. Execute MQL
        results = await query_execution_service.execute_mql(
            uri=uri,
            database_name=conn.database_name,
            collection_name=target_collection,
            query=mql_query
        )
        
        return QueryResponse(
            mql=mql_query,
            results=results,
            collection=target_collection
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
