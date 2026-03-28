import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import base64
from datetime import datetime
import random

app = FastAPI(
    title="AI Workplace Monitor Service",
    version="1.0.0"
)

# CORS Middleware
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    os.getenv("BACKEND_URL", "http://localhost:5000")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class Detection(BaseModel):
    person_id: str
    employee_id: Optional[str]
    name: str
    status: str  # 'active', 'idle', 'sleeping'
    confidence: float
    bbox: dict  # {x, y, w, h}

class FrameAnalysisResult(BaseModel):
    camera_id: str
    company_id: str
    timestamp: str
    detections: List[Detection]
    total_persons: int
    processing_time_ms: float

class AlertCreate(BaseModel):
    camera_id: str
    company_id: str
    employee_id: Optional[str]
    type: str
    screenshot_url: Optional[str]

@app.on_event("startup")
async def startup_event():
    print("🚀 AI Service starting up...")
    print("✅ AI Service ready (Simplified Mode)")

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "models_loaded": True,
        "timestamp": datetime.utcnow().isoformat(),
        "processing_time_ms": 120
    }

@app.post("/detect/frame", response_model=FrameAnalysisResult)
async def detect_frame(data: dict):
    try:
        camera_id = data.get("camera_id")
        company_id = data.get("company_id")
        frame_base64 = data.get("frame_base64")
        
        if not frame_base64 or not camera_id or not company_id:
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        # Simulate processing time
        import time
        start_time = time.time()
        
        # Mock AI processing - generate random detections
        detections = []
        num_persons = random.randint(0, 3)
        
        for i in range(num_persons):
            status = random.choice(['active', 'idle', 'sleeping'])
            confidence = random.uniform(0.7, 0.95)
            
            detection = Detection(
                person_id=f"person_{int(time.time()*1000)}_{i}",
                employee_id=f"emp_{random.randint(1000, 9999)}" if random.random() > 0.3 else None,
                name=random.choice(["John Doe", "Jane Smith", "Unknown"]) if random.random() > 0.5 else "Unknown",
                status=status,
                confidence=confidence,
                bbox={
                    "x": random.randint(50, 300),
                    "y": random.randint(50, 200),
                    "w": random.randint(80, 150),
                    "h": random.randint(120, 200)
                }
            )
            detections.append(detection)
        
        processing_time = (time.time() - start_time) * 1000
        
        result = FrameAnalysisResult(
            camera_id=camera_id,
            company_id=company_id,
            timestamp=datetime.utcnow().isoformat(),
            detections=detections,
            total_persons=len(detections),
            processing_time_ms=processing_time
        )
        
        # Send alert to backend if sleeping or unknown person detected
        for detection in detections:
            if detection.status == 'sleeping' or detection.name == 'Unknown':
                await send_alert_to_backend(result, detection)
        
        return result
        
    except Exception as e:
        print(f"Frame detection error: {e}")
        raise HTTPException(status_code=500, detail="Frame processing failed")

async def send_alert_to_backend(result: FrameAnalysisResult, detection: Detection):
    try:
        import httpx
        backend_url = os.getenv("BACKEND_URL", "http://localhost:5000")
        
        alert_data = {
            "cameraId": result.camera_id,
            "employeeId": detection.employee_id,
            "alertType": "sleeping" if detection.status == 'sleeping' else "unauthorized",
            "severity": "high",
            "message": f"{'Employee detected sleeping' if detection.status == 'sleeping' else 'Unauthorized person detected'}",
            "metadata": {
                "confidence": detection.confidence,
                "bbox": detection.bbox,
                "timestamp": result.timestamp
            }
        }
        
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(f"{backend_url}/api/alerts/create", json=alert_data)
            if response.status_code == 201:
                print(f"🚨 Alert sent to backend: {alert_data['alertType']}")
            
    except Exception as e:
        print(f"Failed to send alert to backend: {e}")

@app.post("/analyze/video")
async def analyze_video(data: dict):
    job_id = f"job_{int(datetime.now().timestamp())}"
    
    return {
        "success": True,
        "job_id": job_id,
        "message": "Video analysis queued (Simplified Mode)"
    }

@app.get("/analyze/status/{job_id}")
async def get_job_status(job_id: str):
    return {
        "job_id": job_id,
        "status": "completed",
        "message": "Analysis completed (Simplified Mode)"
    }

if __name__ == "__main__":
    port = int(os.getenv("AI_SERVICE_PORT", 8000))
    print(f"🤖 Starting AI Service on port {port}")
    uvicorn.run("simple_main:app", host="0.0.0.0", port=port, reload=True)
