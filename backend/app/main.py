from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.tasks.scheduler import start_scheduler, stop_scheduler
from app.routers import telemetry, control, calibration, co2, ai

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("microalgae.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Microalgae Carbon Capture Backend...")
    start_scheduler()
    yield
    logger.info("Shutting down background workers...")
    stop_scheduler()

app = FastAPI(
    title="IoT Microalgae Carbon Capture & Recovery API",
    description="Intelligent monitoring, control, biological kinetics modeling, and AI Copilot for photobioreactor systems.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(telemetry.router)
app.include_router(control.router)
app.include_router(calibration.router)
app.include_router(co2.router)
app.include_router(ai.router)

@app.get("/")
async def root():
    return {
        "system": "IoT-BASED CARBON CAPTURE AND RECOVERY SYSTEM USING MICROALGAE",
        "status": "operational",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "algae-backend",
        "defaultDevice": settings.DEFAULT_DEVICE_ID
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
