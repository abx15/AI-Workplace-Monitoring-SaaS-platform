from fastapi import APIRouter, HTTPException, File, UploadFile
from typing import List, Dict, Any
import cv2
import numpy as np
import base64
from datetime import datetime

from models.ai_models import Employee
from services.face_recognition import FaceRecognitionService
from utils.image_processing import ImageProcessor

router = APIRouter(prefix="/api/face", tags=["face recognition"])

# Initialize face recognition service
face_service = FaceRecognitionService()

@router.post("/register")
async def register_face(
    employee_id: str,
    name: str,
    file: UploadFile = File(...)
):
    """Register a new face for employee"""
    try:
        # Read uploaded file
        contents = await file.read()
        
        # Convert to numpy array
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Register face
        success = face_service.register_new_face(frame, employee_id, name)
        
        if success:
            return {
                "success": True,
                "message": f"Face registered successfully for {name}",
                "employee_id": employee_id,
                "name": name
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to register face. No face detected in image.")
            
    except Exception as e:
        print(f"❌ Face registration error: {e}")
        raise HTTPException(status_code=500, detail=f"Face registration failed: {str(e)}")

@router.post("/recognize")
async def recognize_face(file: UploadFile = File(...)):
    """Recognize face from uploaded image"""
    try:
        # Read uploaded file
        contents = await file.read()
        
        # Convert to numpy array
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Recognize faces
        recognized_faces = face_service.recognize_faces(frame)
        
        return {
            "success": True,
            "faces": recognized_faces,
            "total_faces": len(recognized_faces),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Face recognition error: {e}")
        raise HTTPException(status_code=500, detail=f"Face recognition failed: {str(e)}")

@router.post("/recognize/base64")
async def recognize_face_base64(data: Dict[str, str]):
    """Recognize face from base64 encoded image"""
    try:
        base64_image = data.get("image_base64")
        if not base64_image:
            raise HTTPException(status_code=400, detail="image_base64 is required")
        
        # Convert base64 to frame
        frame = ImageProcessor.base64_to_frame(base64_image)
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid base64 image data")
        
        # Recognize faces
        recognized_faces = face_service.recognize_faces(frame)
        
        return {
            "success": True,
            "faces": recognized_faces,
            "total_faces": len(recognized_faces),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Face recognition error: {e}")
        raise HTTPException(status_code=500, detail=f"Face recognition failed: {str(e)}")

@router.get("/employees")
async def get_registered_employees():
    """Get list of registered employees"""
    try:
        employees = []
        
        # Get unique employees from face service
        for encoding_bytes, employee_id in face_service.known_face_ids.items():
            name = face_service.known_face_names.get(encoding_bytes, "Unknown")
            
            employees.append({
                "employee_id": employee_id,
                "name": name,
                "registered_at": datetime.utcnow().isoformat()
            })
        
        return {
            "success": True,
            "employees": employees,
            "total_count": len(employees)
        }
        
    except Exception as e:
        print(f"❌ Get employees error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get employees: {str(e)}")

@router.delete("/employees/{employee_id}")
async def delete_employee_face(employee_id: str):
    """Delete employee face registration"""
    try:
        # Find and remove employee from face service
        to_remove = []
        for encoding_bytes, emp_id in face_service.known_face_ids.items():
            if emp_id == employee_id:
                to_remove.append(encoding_bytes)
        
        # Remove from all dictionaries
        for encoding_bytes in to_remove:
            face_service.known_face_ids.pop(encoding_bytes, None)
            face_service.known_face_names.pop(encoding_bytes, None)
            if encoding_bytes in [enc.tobytes() for enc in face_service.known_face_encodings]:
                index = [enc.tobytes() for enc in face_service.known_face_encodings].index(encoding_bytes)
                face_service.known_face_encodings.pop(index)
        
        return {
            "success": True,
            "message": f"Employee {employee_id} face data deleted successfully"
        }
        
    except Exception as e:
        print(f"❌ Delete employee error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete employee: {str(e)}")

@router.get("/status")
async def get_face_service_status():
    """Get face recognition service status"""
    try:
        return {
            "service_loaded": face_service.model_loaded,
            "known_faces_count": len(face_service.known_face_encodings),
            "known_employees": len(set(face_service.known_face_ids.values())),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Status check error: {e}")
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")
