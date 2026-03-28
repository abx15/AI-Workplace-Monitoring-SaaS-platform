import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

# Import routes
from app.routes.detection import router as detection_router
from app.routes.face import router as face_router
from app.routes.monitoring import router as monitoring_router

# Create FastAPI app
app = FastAPI(
    title="Lightweight AI Workplace Monitor",
    description="CPU-optimized AI workplace monitoring with face detection and behavior analysis",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    os.getenv("BACKEND_URL", "http://localhost:5000"),
    "http://localhost:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(detection_router, prefix="/api/v1")
app.include_router(face_router, prefix="/api/v1")
app.include_router(monitoring_router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    """Initialize lightweight AI services"""
    print("🚀 Lightweight AI Workplace Monitor Starting...")
    print("📊 CPU-Optimized Features:")
    print("   ✅ Face Detection (MediaPipe)")
    print("   ✅ Person Tracking")
    print("   ✅ Behavior Analysis")
    print("   ✅ Anomaly Detection")
    print("   ✅ Real-time Alerts")
    print("   ✅ Video Processing")
    print("✅ AI Service Ready!")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Lightweight AI Workplace Monitor",
        "version": "3.0.0",
        "status": "running",
        "features": [
            "Face Detection",
            "Person Tracking", 
            "Behavior Analysis",
            "Anomaly Detection",
            "Real-time Alerts",
            "Video Processing"
        ],
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "detection": "/api/v1/detection",
            "face": "/api/v1/face",
            "monitoring": "/api/v1/monitoring"
        },
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Lightweight health check"""
    try:
        from app.services.face_detection import FaceDetectionService
        from app.services.person_tracking import PersonTrackingService
        from app.services.behavior_analysis import BehaviorAnalysisService
        
        face_service = FaceDetectionService()
        tracking_service = PersonTrackingService()
        behavior_service = BehaviorAnalysisService()
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "face_detection": {
                    "loaded": face_service.model_loaded,
                    "model": "MediaPipe Face Detection"
                },
                "person_tracking": {
                    "active_tracks": len(tracking_service.active_tracks)
                },
                "behavior_analysis": {
                    "analyzers": len(behavior_service.analyzers)
                }
            },
            "system": {
                "cpu_optimized": True,
                "gpu_required": False,
                "memory_efficient": True
            }
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

if __name__ == "__main__":
    port = int(os.getenv("AI_SERVICE_PORT", 8000))
    host = os.getenv("AI_SERVICE_HOST", "0.0.0.0")
    
    print(f"🤖 Starting Lightweight AI Service on {host}:{port}")
    print(f"📖 API Documentation: http://{host}:{port}/docs")
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=False,  # Production ready
        log_level="info"
    )
