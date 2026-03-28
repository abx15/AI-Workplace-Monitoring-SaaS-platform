from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Dict, Any
import time
import asyncio
from datetime import datetime

from models.ai_models import (
    FrameAnalysis, Detection, AnalysisRequest, 
    DetectionType, PersonStatus
)
from services.object_detection import ObjectDetectionService
from services.face_recognition import FaceRecognitionService
from services.alert_service import AlertService
from utils.image_processing import ImageProcessor

router = APIRouter(prefix="/api/detection", tags=["detection"])

# Initialize services
detection_service = ObjectDetectionService()
face_service = FaceRecognitionService()
alert_service = AlertService()

@router.on_event("startup")
async def startup_detection_service():
    """Initialize detection services"""
    print("🚀 Initializing AI Detection Services...")
    
    # Load YOLO model
    detection_service.load_model()
    
    # Load face recognition models
    face_service.load_known_faces()
    
    print("✅ AI Detection Services ready")

@router.post("/frame", response_model=FrameAnalysis)
async def analyze_frame(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """Analyze single frame for detections"""
    try:
        start_time = time.time()
        
        # Validate input
        if not request.frame_base64:
            raise HTTPException(status_code=400, detail="Frame data is required")
        
        # Convert base64 to frame
        frame = ImageProcessor.base64_to_frame(request.frame_base64)
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid frame data")
        
        # Enhance frame for better detection
        enhanced_frame = ImageProcessor.enhance_frame(frame)
        
        # Detect persons
        person_detections = detection_service.detect_persons(
            enhanced_frame, 
            request.confidence_threshold
        )
        
        # Analyze behavior
        analyzed_detections = detection_service.analyze_person_behavior(
            enhanced_frame, 
            person_detections
        )
        
        # Perform face recognition if enabled
        if request.enable_face_recognition:
            face_results = face_service.recognize_faces(
                enhanced_frame, 
                request.confidence_threshold
            )
            
            # Merge face recognition results with person detections
            analyzed_detections = merge_face_recognition_results(
                analyzed_detections, 
                face_results
            )
        
        # Convert to Detection objects
        detection_objects = []
        for det in analyzed_detections:
            detection_obj = Detection(
                id=det["person_id"],
                type=DetectionType.PERSON,
                person_id=det["person_id"],
                employee_id=det.get("employee_id"),
                name=det["name"],
                status=PersonStatus(det["status"]),
                confidence=det["confidence"],
                bbox=det["bbox"]
            )
            detection_objects.append(detection_obj)
        
        processing_time = (time.time() - start_time) * 1000
        
        # Create analysis result
        result = FrameAnalysis(
            camera_id=request.camera_id,
            company_id=request.company_id,
            timestamp=datetime.utcnow(),
            frame_id=f"frame_{int(time.time()*1000)}",
            detections=detection_objects,
            total_persons=len(detection_objects),
            processing_time_ms=processing_time,
            metadata={
                "frame_quality": ImageProcessor.calculate_frame_quality(enhanced_frame),
                "detection_types": [dt.value for dt in request.detection_types],
                "face_recognition_enabled": request.enable_face_recognition
            }
        )
        
        # Process alerts in background
        if request.enable_alerts:
            background_tasks.add_task(
                alert_service.process_frame_alerts,
                detection_objects,
                request.camera_id,
                request.company_id
            )
        
        return result
        
    except Exception as e:
        print(f"❌ Frame analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Frame analysis failed: {str(e)}")

@router.post("/video")
async def analyze_video(request: AnalysisRequest):
    """Start video analysis job"""
    try:
        job_id = f"video_job_{int(time.time())}"
        
        # In a real implementation, this would:
        # 1. Download video from URL
        # 2. Process frame by frame
        # 3. Store results
        # 4. Return job ID for tracking
        
        return {
            "success": True,
            "job_id": job_id,
            "message": "Video analysis started",
            "estimated_time": "Processing will take approximately 2-5 minutes",
            "status": "queued"
        }
        
    except Exception as e:
        print(f"❌ Video analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Video analysis failed: {str(e)}")

@router.get("/video/status/{job_id}")
async def get_video_analysis_status(job_id: str):
    """Get video analysis job status"""
    try:
        # In a real implementation, check database for job status
        return {
            "job_id": job_id,
            "status": "completed",
            "progress": 100.0,
            "message": "Video analysis completed successfully",
            "results_url": f"/api/detection/video/results/{job_id}",
            "completed_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Status check error: {e}")
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")

@router.get("/video/results/{job_id}")
async def get_video_analysis_results(job_id: str):
    """Get video analysis results"""
    try:
        # In a real implementation, return actual analysis results
        return {
            "job_id": job_id,
            "results": {
                "total_frames": 1500,
                "person_detections": 245,
                "alerts_generated": 12,
                "unique_persons": 8,
                "analysis_duration_seconds": 180
            },
            "summary": {
                "most_active_time": "14:00-15:00",
                "least_active_time": "09:00-10:00",
                "peak_detections": 5,
                "average_confidence": 0.85
            }
        }
        
    except Exception as e:
        print(f"❌ Results retrieval error: {e}")
        raise HTTPException(status_code=500, detail=f"Results retrieval failed: {str(e)}")

@router.get("/models/status")
async def get_model_status():
    """Get AI models status"""
    try:
        return {
            "object_detection": detection_service.get_model_info(),
            "face_recognition": {
                "model_loaded": face_service.model_loaded,
                "known_faces_count": len(face_service.known_face_encodings)
            },
            "alert_service": alert_service.get_alert_statistics(),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Model status error: {e}")
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")

def merge_face_recognition_results(person_detections: List[Dict], face_results: List[Dict]) -> List[Dict]:
    """Merge face recognition results with person detections"""
    for person_det in person_detections:
        person_bbox = person_det["bbox"]
        
        # Find matching face result
        best_match = None
        best_iou = 0.0
        
        for face_result in face_results:
            face_bbox = face_result["bbox"]
            iou = calculate_iou(person_bbox, face_bbox)
            
            if iou > best_iou and iou > 0.3:  # Minimum IoU threshold
                best_iou = iou
                best_match = face_result
        
        # Update person detection with face recognition results
        if best_match:
            person_det["employee_id"] = best_match.get("employee_id")
            person_det["name"] = best_match.get("name", "Unknown")
            person_det["face_confidence"] = best_match.get("confidence", 0.0)
    
    return person_detections

def calculate_iou(bbox1: Dict, bbox2: Dict) -> float:
    """Calculate Intersection over Union (IoU) between two bounding boxes"""
    try:
        # Extract coordinates
        x1_1, y1_1 = bbox1["x"], bbox1["y"]
        x2_1, y2_1 = x1_1 + bbox1["width"], y1_1 + bbox1["height"]
        
        x1_2, y1_2 = bbox2["x"], bbox2["y"]
        x2_2, y2_2 = x1_2 + bbox2["width"], y1_2 + bbox2["height"]
        
        # Calculate intersection
        x1_i = max(x1_1, x1_2)
        y1_i = max(y1_1, y1_2)
        x2_i = min(x2_1, x2_2)
        y2_i = min(y2_1, y2_2)
        
        if x2_i <= x1_i or y2_i <= y1_i:
            return 0.0
        
        intersection_area = (x2_i - x1_i) * (y2_i - y1_i)
        
        # Calculate union
        area1 = bbox1["width"] * bbox1["height"]
        area2 = bbox2["width"] * bbox2["height"]
        union_area = area1 + area2 - intersection_area
        
        return intersection_area / union_area if union_area > 0 else 0.0
        
    except Exception:
        return 0.0
