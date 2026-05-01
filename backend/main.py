"""
CURIFY AI Navigator — FastAPI Backend
Healthcare Discovery & Pre-Underwriting Platform
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import init_db
from routes.auth import router as auth_router
from routes.search import router as search_router
from routes.underwrite import router as underwrite_router
from routes.hospitals import router as hospitals_router
from routes.patient_profile import router as patient_profile_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    init_db()
    yield


app = FastAPI(
    title="CURIFY AI Navigator",
    description="AI-powered healthcare discovery & pre-underwriting platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount route groups
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(search_router, prefix="/api", tags=["Patient Search"])
app.include_router(underwrite_router, prefix="/api", tags=["Underwriting"])
app.include_router(hospitals_router, prefix="/api", tags=["Hospitals"])
app.include_router(patient_profile_router, prefix="/api", tags=["Patient Profile"])


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "curify-ai-navigator"}
