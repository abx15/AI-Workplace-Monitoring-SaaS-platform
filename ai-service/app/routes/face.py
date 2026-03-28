from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
import cv2
import numpy as np
import io
from typing import List, Dict, Optional
from datetime import datetime

from app.services.face_detection import FaceDetectionService

router = APIRouter()

# Initialize service
face_service = FaceDetectionService()

@router.post("/face/detect")
async def detect_faces(file: UploadFile = File(...)):
    """Detect faces in image"""
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        faces = face_service.detect_faces(frame)
        
        return JSONResponse(content={
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "faces_detected": len(faces),
            "faces": faces
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face detection failed: {str(e)}")

@router.post("/face/recognize")
async def recognize_faces(file: UploadFile = File(...), threshold: float = Form(0.6)):
    """Recognize faces in image"""
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        recognized_faces = face_service.recognize_faces(frame, threshold)
        
        return JSONResponse(content={
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "faces_processed": len(recognized_faces),
            "known_faces_found": len([f for f in recognized_faces if f["recognized"]]),
            "faces": recognized_faces
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face recognition failed: {str(e)}")

@router.post("/face/register")
async def register_face(
    file: UploadFile = File(...),
    employee_id: str = Form(...),
    employee_name: str = Form(...)
):
    """Register a new face"""
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
                "message": f"Face registered successfully for {employee_name}",
                "employee_id": employee_id,
                "total_registered": face_service.get_known_faces_count()
            })
        else:
            raise HTTPException(status_code=400, detail="No face detected in the image")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face registration failed: {str(e)}")

@router.get("/face/employees")
async def get_registered_employees():
    """Get list of registered employees"""
    try:
        employees = []
        for emp_id, face_data in face_service.known_faces.items():
            employees.append({
                "employee_id": emp_id,
                "name": face_data["name"],
                "registered_at": face_data["registered_at"]
            })
        
        return JSONResponse(content={
            "success": True,
            "total_employees": len(employees),
            "employees": employees
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get employees: {str(e)}")

@router.delete("/face/{employee_id}")
async def delete_face(employee_id: str):
    """Delete a registered face"""
    try:
        if employee_id in face_service.known_faces:
            del face_service.known_faces[employee_id]
            return JSONResponse(content={
                "success": True,
                "message": f"Face for employee {employee_id} deleted successfully",
                "remaining_faces": face_service.get_known_faces_count()
            })
        else:
            raise HTTPException(status_code=404, detail="Employee not found")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete face: {str(e)}")

@router.get("/face/stats")
async def get_face_stats():
    """Get face recognition statistics"""
    try:
        return JSONResponse(content={
            "success": True,
            "registered_faces": face_service.get_known_faces_count(),
            "service_info": face_service.get_service_info()
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")
