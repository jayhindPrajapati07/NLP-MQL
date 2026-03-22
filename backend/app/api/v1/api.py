from fastapi import APIRouter
from app.api.v1.endpoints import auth, connections, query, saved_queries, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(connections.router, prefix="/connections", tags=["connections"])
api_router.include_router(query.router, prefix="/query", tags=["query"])
api_router.include_router(saved_queries.router, prefix="/saved-queries", tags=["saved_queries"])
