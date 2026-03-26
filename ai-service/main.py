"""
STEP 15 — Detection Flow (Full Pipeline)

Camera RTSP Feed
      ↓
Capture Frame (OpenCV)
      ↓
┌─────────────────────┐
│  Parallel Processing │
│  YOLO → Persons     │
│  InsightFace → Faces│
└─────────────────────┘
      ↓
Merge Results
(Match face to person bbox)
      ↓
Classify Status
(Active / Idle / Sleeping)
      ↓
Draw Overlay
(Boxes + Labels + Status)
      ↓
Send via WebSocket → Frontend
      ↓
Save to MongoDB (ai_logs)
      ↓
Alert Check
      ↓
If Alert:
  → Screenshot → Cloudinary
  → POST → Node.js Backend
  → Socket.io → Frontend notification
"""

import os
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from app.routes import detect, recognize, analyze
from app.services.face_service import FaceService
from app.services.yolo_service import YOLOService
from app.config.db import test_connections
from app.utils.preprocess import decode_base64_image
from app.utils.draw_boxes import draw_detection_overlay, frame_to_base64
from datetime import datetime
import json
import asyncio

app = FastAPI(
    title="AI Workplace Monitor Service",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
        os.getenv("BACKEND_URL", "http://localhost:5000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("AI Service starting up...")
    test_connections()
    
    # STEP 16 — Model singleton pattern
    # Load models once and store in app.state
    print("Loading AI Models...")
    app.state.face_service = FaceService()
    app.state.yolo_service = YOLOService()
    print("AI Service ready ✅")

# Include Routers
app.include_router(detect.router, prefix="/detect", tags=["Detection"])
app.include_router(recognize.router, prefix="/recognize", tags=["Face Recognition"])
app.include_router(analyze.router, prefix="/analyze", tags=["Video Analysis"])

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "models_loaded": hasattr(app.state, "face_service") and hasattr(app.state, "yolo_service"),
        "timestamp": datetime.utcnow().isoformat()
    }

# STEP 13 — WebSocket Handler
@app.websocket("/ws/camera/{camera_id}")
async def websocket_endpoint(websocket: WebSocket, camera_id: str):
    await websocket.accept()
    print(f"WebSocket connected: {camera_id}")
    
    company_id = websocket.query_params.get("company_id", "default")
    
    try:
        while True:
            # Receive frame from client (base64)
            data = await websocket.receive_text()
            
            try:
                frame_data = json.loads(data)
                frame_base64 = frame_data.get("frame")
            except:
                frame_base64 = data # Assume raw string if not JSON
                
            if not frame_base64:
                continue
                
            frame = decode_base64_image(frame_base64)
            if frame is None:
                continue
                
            # Process Frame (Fast Mode)
            # 1. YOLO
            yolo_results = app.state.yolo_service.process_frame(frame)
            # 2. Face (Optional: every Nth frame for performance?)
            face_results = app.state.face_service.process_frame_faces(frame, company_id)
            
            # Merge results (Simplified for WS)
            detections = []
            for y_det in yolo_results:
                # Basic matching logic or just return both
                detections.append({
                    "bbox": y_det['bbox'],
                    "status": y_det['status'],
                    "name": "Processing..." # Real name can be matched as in detect.py
                })
            
            # Draw Overlay
            annotated_frame = draw_detection_overlay(frame, detections)
            annotated_base64 = frame_to_base64(annotated_frame)
            
            # Send back to frontend
            await websocket.send_json({
                "frame": annotated_base64,
                "detections": detections,
                "timestamp": datetime.utcnow().isoformat()
            })
            
    except WebSocketDisconnect:
        print(f"WebSocket disconnected: {camera_id}")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        # Cleanup if needed
        pass

if __name__ == "__main__":
    port = int(os.getenv("AI_SERVICE_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
