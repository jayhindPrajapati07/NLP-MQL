import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.database import connect_to_mongo, close_mongo_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    print("Starting up the FastAPI application...")
    await connect_to_mongo()
    yield
    # Shutdown actions
    print("Shutting down the FastAPI application...")
    await close_mongo_connection()

app = FastAPI(
    title="Natural Language to MongoDB API",
    description="Backend for querying external MongoDB instances via LLM",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware for Next.js frontend
from app.api.v1.api import api_router

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://0.0.0.0:3000"], # Explicit origins needed instead of * when credentials=True
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
