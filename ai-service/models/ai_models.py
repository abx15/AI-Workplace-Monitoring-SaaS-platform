from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class DetectionType(str, Enum):
    PERSON = "person"
    FACE = "face"
    VEHICLE = "vehicle"
    OBJECT = "object"

class AlertType(str, Enum):
    SLEEPING = "sleeping"
    UNAUTHORIZED = "unauthorized"
    IDLE = "idle"
    ABSENCE = "absence"
    PRODUCTIVITY_LOW = "productivity_low"
    SAFETY_VIOLATION = "safety_violation"

class PersonStatus(str, Enum):
    ACTIVE = "active"
    IDLE = "idle"
    SLEEPING = "sleeping"
    AWAY = "away"

class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float
    confidence: float

class Detection(BaseModel):
    id: str
    type: DetectionType
    person_id: Optional[str] = None
    employee_id: Optional[str] = None
    name: str
    status: PersonStatus
    confidence: float
    bbox: BoundingBox
    attributes: Dict[str, Any] = {}

class FrameAnalysis(BaseModel):
    camera_id: str
    company_id: str
    timestamp: datetime
    frame_id: str
    detections: List[Detection]
    total_persons: int
    processing_time_ms: float
    metadata: Dict[str, Any] = {}

class Alert(BaseModel):
    id: Optional[str] = None
    camera_id: str
    company_id: str
    employee_id: Optional[str] = None
    type: AlertType
    severity: str  # low, medium, high, critical
    message: str
    screenshot_url: Optional[str] = None
    confidence: float
    bbox: Optional[BoundingBox] = None
    timestamp: datetime
    resolved: bool = False
    metadata: Dict[str, Any] = {}

class VideoAnalysisJob(BaseModel):
    id: str
    camera_id: str
    company_id: str
    status: str  # queued, processing, completed, failed
    progress: float = 0.0
    created_at: datetime
    completed_at: Optional[datetime] = None
    result_url: Optional[str] = None
    error_message: Optional[str] = None

class Employee(BaseModel):
    id: str
    name: str
    email: str
    department: str
    position: str
    face_encoding: Optional[str] = None
    is_active: bool = True
    created_at: datetime

class Camera(BaseModel):
    id: str
    name: str
    location: str
    company_id: str
    status: str  # active, inactive, maintenance
    rtsp_url: Optional[str] = None
    ai_enabled: bool = True
    detection_types: List[DetectionType] = []
    created_at: datetime

class AIModelConfig(BaseModel):
    model_name: str
    model_path: str
    confidence_threshold: float = 0.7
    nms_threshold: float = 0.4
    input_size: tuple = (640, 640)
    device: str = "cpu"
    classes: List[str] = []

class AnalysisRequest(BaseModel):
    camera_id: str
    company_id: str
    frame_base64: Optional[str] = None
    video_url: Optional[str] = None
    detection_types: List[DetectionType] = [DetectionType.PERSON]
    confidence_threshold: float = 0.7
    enable_face_recognition: bool = False
    enable_alerts: bool = True
