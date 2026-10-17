from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from src.presentation.api.routers.health_router import router as health_router
from src.presentation.api.routers.voice_router import router as voice_router
from src.presentation.api.routers.patient_router import router as patient_router
from src.presentation.api.routers.medication_router import router as medication_router
from src.presentation.api.routers.emergency_router import router as emergency_router
from src.presentation.websockets.hardware_stream import router as websocket_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("cura.api")

app = FastAPI(
    title="CURA — Adaptive AI Assistant API",
    description="Clean Architecture REST & WebSocket service for Edge AI, Mobile, Desktop GUI, and Mini CURA hardware.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Policy for Multi-Team development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Error Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": str(exc),
            }
        }
    )

# Include API Routers under /api/v1
api_v1_prefix = "/api/v1"
app.include_router(health_router, prefix=api_v1_prefix)
app.include_router(voice_router, prefix=api_v1_prefix)
app.include_router(patient_router, prefix=api_v1_prefix)
app.include_router(medication_router, prefix=api_v1_prefix)
app.include_router(emergency_router, prefix=api_v1_prefix)

# Include WebSocket Routers
app.include_router(websocket_router)

@app.get("/")
async def root():
    return {
        "project": "CURA",
        "description": "Adaptive AI Assistant Core Engine",
        "docs": "/docs",
        "api_v1": "/api/v1",
    }
