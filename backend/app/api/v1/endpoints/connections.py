from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_active_user, get_current_admin_user
from app.models.user import UserInDB
from app.models.connection import ConnectionCreate, ConnectionResponse, ConnectionInDB
from app.repositories.connection import connection_repository
from app.core.encryption import decrypt_uri
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter()

@router.post("/", response_model=ConnectionResponse)
async def create_connection(
    conn_in: ConnectionCreate,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    # Try connecting to the provided URI to validate it
    try:
        test_client = AsyncIOMotorClient(conn_in.uri, serverSelectionTimeoutMS=2000)
        await test_client.server_info()
        test_client.close()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to connect to MongoDB: {str(e)}"
        )
    
    conn = await connection_repository.create(conn_in=conn_in, owner_id=str(current_user.id))
    return conn

@router.get("/", response_model=list[ConnectionResponse])
async def read_connections(
    current_user: UserInDB = Depends(get_current_active_user)
):
    conns = await connection_repository.get_all_by_owner(owner_id=str(current_user.id))
    return conns

@router.put("/{conn_id}", response_model=ConnectionResponse)
async def update_connection(
    conn_id: str,
    conn_in: ConnectionCreate,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    # Try connecting to the provided URI to validate it
    try:
        test_client = AsyncIOMotorClient(conn_in.uri, serverSelectionTimeoutMS=2000)
        await test_client.server_info()
        test_client.close()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to connect to MongoDB: {str(e)}"
        )
        
    conn = await connection_repository.get_by_id(conn_id)
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    if conn.owner_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not enough privileges")
        
    updated_conn = await connection_repository.update(conn_id, conn_in=conn_in)
    return updated_conn

@router.delete("/{conn_id}")
async def delete_connection(
    conn_id: str,
    current_user: UserInDB = Depends(get_current_admin_user)
):
    conn = await connection_repository.get_by_id(conn_id)
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    if conn.owner_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not enough privileges")
    
    await connection_repository.delete(conn_id)
    return {"status": "success"}
