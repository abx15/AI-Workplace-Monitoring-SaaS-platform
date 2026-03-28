from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
import cv2
import numpy as np
import io
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import asyncio
import json

from app.services.face_detection import FaceDetectionService
from app.services.person_tracking import PersonTrackingService
from app.services.behavior_analysis import BehaviorAnalysisService

router = APIRouter()

# Initialize services
face_service = FaceDetectionService()
tracking_service = PersonTrackingService()
behavior_service = BehaviorAnalysisService()

# In-memory storage for monitoring data
monitoring_sessions = {}
alerts_buffer = []

@router.post("/monitoring/start-session")
async def start_monitoring_session(
    session_id: str = Form(...),
    camera_id: str = Form(...),
    sensitivity: str = Form("medium")  # low, medium, high
):
    """Start a new monitoring session"""
    try:
        sensitivity_levels = {
            "low": {"motion_threshold": 0.02, "behavior_threshold": 0.5},
            "medium": {"motion_threshold": 0.05, "behavior_threshold": 0.7},
            "high": {"motion_threshold": 0.1, "behavior_threshold": 0.8}
        }
        
        monitoring_sessions[session_id] = {
            "session_id": session_id,
            "camera_id": camera_id,
            "started_at": datetime.now(),
            "last_activity": datetime.now(),
            "sensitivity": sensitivity_levels.get(sensitivity, sensitivity_levels["medium"]),
            "frames_processed": 0,
            "alerts_generated": 0,
            "persons_detected": set(),
            "status": "active"
        }
        
        return JSONResponse(content={
            "success": True,
            "session_id": session_id,
            "message": "Monitoring session started",
            "sensitivity": sensitivity
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start session: {str(e)}")

@router.post("/monitoring/process-frame")
async def process_monitoring_frame(
    file: UploadFile = File(...),
    session_id: str = Form(...),
    enable_alerts: bool = Form(True)
):
    """Process a frame for monitoring"""
    try:
        if session_id not in monitoring_sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = monitoring_sessions[session_id]
        
        # Read and decode image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Update session
        session["frames_processed"] += 1
        session["last_activity"] = datetime.now()
        
        # Perform analysis
        results = {
            "timestamp": datetime.now().isoformat(),
            "session_id": session_id,
            "frame_number": session["frames_processed"],
            "faces": [],
            "persons": [],
            "alerts": [],
            "statistics": {}
        }
        
        # Face detection and recognition
        faces = face_service.recognize_faces(frame)
        results["faces"] = faces
        
        # Person tracking
        if faces:
            person_detections = [{"bbox": face["bbox"], "confidence": face["confidence"]} for face in faces]
            tracked_persons = tracking_service.update_tracks(person_detections)
            
            for i, person in enumerate(tracked_persons):
                # Get corresponding face data if available
                face_data = faces[i] if i < len(faces) else {}
                
                # Behavior analysis
                behavior = behavior_service.analyze_behavior(frame, person["bbox"])
                
                person_data = {
                    "track_id": person.get("track_id"),
                    "bbox": person["bbox"],
                    "confidence": person["confidence"],
                    "employee_id": face_data.get("employee_id"),
                    "name": face_data.get("name", "Unknown"),
                    "recognized": face_data.get("recognized", False),
                    "behavior": behavior
                }
                
                results["persons"].append(person_data)
                
                # Update session persons detected
                if face_data.get("employee_id"):
                    session["persons_detected"].add(face_data["employee_id"])
                
                # Generate alerts if enabled
                if enable_alerts:
                    alerts = _generate_alerts(person_data, session["sensitivity"])
                    results["alerts"].extend(alerts)
                    session["alerts_generated"] += len(alerts)
        
        # Statistics
        results["statistics"] = {
            "total_frames": session["frames_processed"],
            "total_alerts": session["alerts_generated"],
            "unique_persons": len(session["persons_detected"]),
            "session_duration": (datetime.now() - session["started_at"]).total_seconds()
        }
        
        return JSONResponse(content=results)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Frame processing failed: {str(e)}")

@router.get("/monitoring/session/{session_id}/status")
async def get_session_status(session_id: str):
    """Get monitoring session status"""
    try:
        if session_id not in monitoring_sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = monitoring_sessions[session_id]
        
        # Check if session is stale (no activity for 5 minutes)
        if (datetime.now() - session["last_activity"]).total_seconds() > 300:
            session["status"] = "stale"
        
        return JSONResponse(content={
            "success": True,
            "session": session,
            "tracking_stats": tracking_service.get_track_statistics()
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get session status: {str(e)}")

@router.post("/monitoring/stop-session")
async def stop_monitoring_session(session_id: str):
    """Stop a monitoring session"""
    try:
        if session_id not in monitoring_sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = monitoring_sessions[session_id]
        session["status"] = "stopped"
        session["stopped_at"] = datetime.now()
        
        duration = (session["stopped_at"] - session["started_at"]).total_seconds()
        
        return JSONResponse(content={
            "success": True,
            "message": "Monitoring session stopped",
            "session_summary": {
                "session_id": session_id,
                "duration_seconds": duration,
                "frames_processed": session["frames_processed"],
                "alerts_generated": session["alerts_generated"],
                "unique_persons_detected": len(session["persons_detected"])
            }
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop session: {str(e)}")

@router.get("/monitoring/alerts")
async def get_recent_alerts(limit: int = 50):
    """Get recent monitoring alerts"""
    try:
        # Return recent alerts from buffer
        recent_alerts = alerts_buffer[-limit:] if alerts_buffer else []
        
        return JSONResponse(content={
            "success": True,
            "total_alerts": len(recent_alerts),
            "alerts": recent_alerts
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get alerts: {str(e)}")

def _generate_alerts(person_data: Dict, sensitivity: Dict) -> List[Dict]:
    """Generate alerts based on person behavior"""
    alerts = []
    behavior = person_data.get("behavior", {})
    
    # Sleeping alert
    if behavior.get("activity", {}).get("status") == "sleeping":
        if behavior.get("activity", {}).get("confidence", 0) > sensitivity["behavior_threshold"]:
            alerts.append({
                "type": "sleeping_detected",
                "severity": "high",
                "message": f"Person {person_data.get('name', 'Unknown')} appears to be sleeping",
                "timestamp": datetime.now().isoformat(),
                "person_id": person_data.get("track_id"),
                "confidence": behavior["activity"]["confidence"]
            })
    
    # Inactivity alert
    if behavior.get("motion", {}).get("status") == "no_motion":
        consecutive_idle = behavior.get("activity", {}).get("consecutive_idle_frames", 0)
        if consecutive_idle > 60:  # 2 seconds at 30fps
            alerts.append({
                "type": "prolonged_inactivity",
                "severity": "medium",
                "message": f"Prolonged inactivity detected for {person_data.get('name', 'Unknown')}",
                "timestamp": datetime.now().isoformat(),
                "person_id": person_data.get("track_id"),
                "idle_frames": consecutive_idle
            })
    
    # Unknown person alert
    if not person_data.get("recognized", False):
        alerts.append({
            "type": "unknown_person",
            "severity": "medium",
            "message": "Unknown person detected",
            "timestamp": datetime.now().isoformat(),
            "person_id": person_data.get("track_id"),
            "confidence": person_data.get("confidence", 0)
        })
    
    # Store alerts in buffer
    alerts_buffer.extend(alerts)
    
    # Keep buffer size manageable
    if len(alerts_buffer) > 1000:
        alerts_buffer[:] = alerts_buffer[-500:]
    
    return alerts

@router.get("/monitoring/statistics")
async def get_monitoring_statistics():
    """Get overall monitoring statistics"""
    try:
        active_sessions = len([s for s in monitoring_sessions.values() if s["status"] == "active"])
        total_frames = sum(s["frames_processed"] for s in monitoring_sessions.values())
        total_alerts = sum(s["alerts_generated"] for s in monitoring_sessions.values())
        
        return JSONResponse(content={
            "success": True,
            "statistics": {
                "active_sessions": active_sessions,
                "total_sessions": len(monitoring_sessions),
                "total_frames_processed": total_frames,
                "total_alerts_generated": total_alerts,
                "registered_faces": face_service.get_known_faces_count(),
                "active_tracks": len(tracking_service.active_tracks)
            },
            "service_status": {
                "face_detection": face_service.get_service_info(),
                "person_tracking": tracking_service.get_service_info()
            }
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")
