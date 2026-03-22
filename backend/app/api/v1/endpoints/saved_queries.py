from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from pydantic import BaseModel
from app.api.deps import get_current_active_user, get_current_admin_user
from app.models.user import UserInDB
from app.models.saved_query import SavedQueryCreate, SavedQueryResponse
from app.repositories.saved_query import saved_query_repository
from app.repositories.connection import connection_repository
from app.core.encryption import decrypt_uri
from app.services.query import query_execution_service

router = APIRouter()

class SavedQueryAssign(BaseModel):
    assigned_users: List[str]

@router.post("/", response_model=SavedQueryResponse, status_code=status.HTTP_201_CREATED)
async def create_saved_query(
    query_in: SavedQueryCreate,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    
    # Verify the connection belongs to the admin
    conn = await connection_repository.get_by_id(query_in.connection_id)
    if not conn or conn.owner_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Connection not found or access denied")
        
    saved_query = await saved_query_repository.create(query_in=query_in, owner_id=str(current_user.id))
    return saved_query

@router.get("/", response_model=List[SavedQueryResponse])
async def list_saved_queries(
    current_user: UserInDB = Depends(get_current_active_user)
):
    if current_user.is_admin:
        return await saved_query_repository.get_all_by_owner(str(current_user.id))
    else:
        return await saved_query_repository.get_all_for_assigned_user(str(current_user.id))

@router.get("/{query_id}/execute")
async def execute_saved_query(
    query_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Executes a saved query dynamically and returns the results"""
    # 1. Fetch query
    saved_query = await saved_query_repository.get_by_id(query_id)
    if not saved_query:
        raise HTTPException(status_code=404, detail="Saved Query not found")
        
    # 2. Check Permissions
    if not current_user.is_admin and str(current_user.id) not in saved_query.assigned_users:
        raise HTTPException(status_code=403, detail="Not assigned to this query")
        
    if current_user.is_admin and saved_query.owner_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your query")
        
    # 3. Fetch connection to execute against
    conn = await connection_repository.get_by_id(saved_query.connection_id)
    if not conn:
        raise HTTPException(status_code=500, detail="Underlying connection no longer exists")
        
    uri = decrypt_uri(conn.encrypted_uri)
    
    # 4. Execute MQL
    try:
        results = await query_execution_service.execute_mql(
            uri=uri,
            database_name=conn.database_name,
            collection_name=saved_query.collection_name,
            query=saved_query.mql
        )
        return {
            "mql": saved_query.mql,
            "results": results,
            "collection": saved_query.collection_name,
            "visualization_type": saved_query.visualization_type,
            "name": saved_query.name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{query_id}/assign", response_model=SavedQueryResponse)
async def assign_saved_query(
    query_id: str,
    assign_in: SavedQueryAssign,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    saved_query = await saved_query_repository.get_by_id(query_id)
    if not saved_query or saved_query.owner_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Saved Query not found or unowned")
        
    updated = await saved_query_repository.update_assignments(query_id, assign_in.assigned_users)
    return updated

@router.delete("/{query_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_query(
    query_id: str,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    saved_query = await saved_query_repository.get_by_id(query_id)
    if not saved_query or saved_query.owner_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Saved Query not found")
        
    await saved_query_repository.delete(query_id)
