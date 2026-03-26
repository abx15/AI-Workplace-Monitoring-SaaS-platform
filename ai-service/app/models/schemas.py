from pydantic import BaseModel
from typing import List, Optional

class Detection(BaseModel):
    person_id: str
    employee_id: Optional[str] = None
    name: str
    status: str  # active, idle, sleeping
    confidence: float
    bbox: dict   # x, y, w, h

class FrameAnalysisResult(BaseModel):
    camera_id: str
    company_id: str
    timestamp: str
    detections: List[Detection]
    total_persons: int
    processing_time_ms: float

class FaceEncodeRequest(BaseModel):
    employee_id: str
    company_id: str
    image_base64: str

class FaceEncodeResponse(BaseModel):
    success: bool
    employee_id: str
    message: str

class AlertCreate(BaseModel):
    camera_id: str
    company_id: str
    employee_id: Optional[str] = None
    type: str # sleeping, unknown_person
    screenshot_url: str

class AnalyzeVideoRequest(BaseModel):
    video_url: str
    camera_id: str
    company_id: str