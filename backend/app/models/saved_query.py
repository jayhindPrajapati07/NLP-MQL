from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from app.models.user import PyObjectId

class SavedQueryBase(BaseModel):
    name: str = Field(..., description="Friendly name for the saved query")
    connection_id: str = Field(..., description="ID of the MongoDB connection used")
    mql: Any = Field(..., description="The generated MongoDB query")
    visualization_type: str = Field(..., description="The chart type (table, bar, line, pie)")
    collection_name: str = Field(..., description="The collection the MQL was run against")

class SavedQueryCreate(SavedQueryBase):
    pass

class SavedQueryInDB(SavedQueryBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    owner_id: str = Field(..., description="Admin who created the saved query")
    assigned_users: List[str] = Field(default=[], description="List of generic user IDs who can view this")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class SavedQueryResponse(SavedQueryBase):
    id: PyObjectId = Field(alias="_id")
    owner_id: str
    assigned_users: List[str]
    created_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
