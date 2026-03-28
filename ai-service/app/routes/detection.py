from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
import cv2
import numpy as np
import io
from typing import List, Dict, Optional
from datetime import datetime

from app.services.face_detection import FaceDetectionService
from app.services.person_tracking import PersonTrackingService
from app.services.behavior_analysis import BehaviorAnalysisService

router = APIRouter()

# Initialize services
face_service = FaceDetectionService()
tracking_service = PersonTrackingService()
behavior_service = BehaviorAnalysisService()

@router.post("/detection/analyze-frame")
async def analyze_frame(
    file: UploadFile = File(...),
    analyze_faces: bool = Form(True),
    analyze_behavior: bool = Form(True),
    enable_tracking: bool = Form(True)
):
    """Analyze a single frame for faces and behavior"""
    try:
        # Read and decode image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "frame_shape": {
                "height": frame.shape[0],
                "width": frame.shape[1],
                "channels": frame.shape[2] if len(frame.shape) > 2 else 1
            },
            "faces": [],
            "persons": [],
            "tracking": {},
            "analysis_time": 0
        }
        
        start_time = time.time()
        
        # Face detection
        if analyze_faces:
            faces = face_service.recognize_faces(frame)
            results["faces"] = faces
            
            # Convert faces to person detections for tracking
            person_detections = []
            for face in faces:
                person_detection = {
                    "bbox": face["bbox"],
                    "confidence": face["confidence"],
                    "type": "person"
                }
                person_detections.append(person_detection)
            
            # Person tracking
            if enable_tracking:
                tracked_persons = tracking_service.update_tracks(person_detections)
                results["persons"] = tracked_persons
                results["tracking"] = tracking_service.get_track_statistics()
            
            # Behavior analysis
            if analyze_behavior:
                for i, person in enumerate(results["persons"]):
                    behavior = behavior_service.analyze_behavior(frame, person["bbox"])
                    person["behavior"] = behavior
        
        results["analysis_time"] = time.time() - start_time
        
        return JSONResponse(content=results)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/detection/detect-faces")
async def detect_faces_only(file: UploadFile = File(...)):
    """Detect faces only (lightweight endpoint)"""
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        faces = face_service.detect_faces(frame)
        
        return JSONResponse(content={
            "timestamp": datetime.now().isoformat(),
            "faces_detected": len(faces),
            "faces": faces
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face detection failed: {str(e)}")

@router.get("/detection/service-status")
async def get_service_status():
    """Get detection service status"""
    return JSONResponse(content={
        "face_detection": face_service.get_service_info(),
        "person_tracking": tracking_service.get_service_info(),
        "behavior_analysis": {
            "analyzers_count": len(behavior_service.analyzers),
            "cpu_optimized": True
        }
    })

@router.post("/detection/register-face")
async def register_face(
    file: UploadFile = File(...),
    employee_id: str = Form(...),
    employee_name: str = Form(...)
):
    """Register a new face for recognition"""
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        success = face_service.register_face(frame, employee_id, employee_name)
        
        if success:
            return JSONResponse(content={
                "success": True,
                "message": f"Face registered for {employee_name} ({employee_id})",
                "total_registered_faces": face_service.get_known_faces_count()
            })
        else:
            raise HTTPException(status_code=400, detail="No face detected in the image")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face registration failed: {str(e)}")

@router.get("/detection/registered-faces")
async def get_registered_faces():
    """Get list of registered faces"""
    try:
        faces_info = []
        for emp_id, face_data in face_service.known_faces.items():
            faces_info.append({
                "employee_id": emp_id,
                "name": face_data["name"],
                "registered_at": face_data["registered_at"]
            })
        
        return JSONResponse(content={
            "total_faces": len(faces_info),
            "faces": faces_info
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get registered faces: {str(e)}")

# Import time for analysis timing
import time
