import time
import httpx
import cv2
import os
import uuid
from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from app.models.schemas import AnalyzeVideoRequest
from app.config.db import get_mongo_db
from datetime import datetime

router = APIRouter()

async def process_video_job(job_id: str, video_url: str, camera_id: str, company_id: str, app_state):
    db = get_mongo_db()
    if db is None:
        return
        
    db.video_jobs.update_one({"job_id": job_id}, {"$set": {"status": "processing", "start_time": datetime.utcnow()}})
    
    temp_video_path = f"/tmp/{job_id}.mp4"
    try:
        # Download video
        async with httpx.AsyncClient() as client:
            response = await client.get(video_url)
            with open(temp_video_path, "wb") as f:
                f.write(response.content)
                
        cap = cv2.VideoCapture(temp_video_path)
        if not cap.isOpened():
            db.video_jobs.update_one({"job_id": job_id}, {"$set": {"status": "failed", "error": "Could not open video"}})
            return
            
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        duration = total_frames / fps if fps > 0 else 0
        
        yolo_service = app_state.yolo_service
        face_service = app_state.face_service
        
        events = []
        alerts = []
        frame_idx = 0
        frames_analyzed = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            # Process every 30th frame
            if frame_idx % 30 == 0:
                yolo_results = yolo_service.process_frame(frame)
                face_results = face_service.process_frame_faces(frame, company_id)
                
                timestamp_offset = frame_idx / fps if fps > 0 else 0
                
                for y_det in yolo_results:
                    # Recognition and Alert logic (simplified for batch)
                    events.append({
                        "timestamp_offset": timestamp_offset,
                        "status": y_det['status'],
                        "bbox": y_det['bbox']
                    })
                    
                frames_analyzed += 1
                # Update progress in DB if needed (optional)
                
            frame_idx += 1
            
        cap.release()
        
        # Save results
        db.detection_events.insert_one({
            "job_id": job_id,
            "camera_id": camera_id,
            "company_id": company_id,
            "total_frames_analyzed": frames_analyzed,
            "duration_seconds": duration,
            "events": events,
            "created_at": datetime.utcnow()
        })
        
        db.video_jobs.update_one({"job_id": job_id}, {"$set": {"status": "completed", "end_time": datetime.utcnow()}})
        
    except Exception as e:
        print(f"Error processing video {job_id}: {e}")
        db.video_jobs.update_one({"job_id": job_id}, {"$set": {"status": "failed", "error": str(e)}})
    finally:
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)

@router.post("/video")
async def analyze_video(request: Request, body: AnalyzeVideoRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    db = get_mongo_db()
    
    if db is not None:
        db.video_jobs.insert_one({
            "job_id": job_id,
            "camera_id": body.camera_id,
            "company_id": body.company_id,
            "status": "queued",
            "created_at": datetime.utcnow()
        })
        
    background_tasks.add_task(process_video_job, job_id, body.video_url, body.camera_id, body.company_id, request.app.state)
    
    return {"success": True, "job_id": job_id, "message": "Video analysis queued"}

@router.get("/status/{job_id}")
async def get_job_status(job_id: str):
    db = get_mongo_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    job = db.video_jobs.find_one({"job_id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return job
