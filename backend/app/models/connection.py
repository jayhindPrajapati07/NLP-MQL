from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.user import PyObjectId

class ConnectionBase(BaseModel):
    name: str = Field(..., description="A friendly name for the connection (e.g. Production Data)")
    database_name: str = Field(..., description="The name of the external database to connect to")

class ConnectionCreate(ConnectionBase):
    uri: str = Field(..., description="The raw MongoDB connection string")

class ConnectionInDB(ConnectionBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    owner_id: str = Field(..., description="User ID who owns this connection")
    encrypted_uri: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class ConnectionResponse(ConnectionBase):
    id: PyObjectId = Field(alias="_id")
    owner_id: str
    created_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
