import cv2
import numpy as np
from typing import List, Dict, Tuple, Optional
import torch
from ultralytics import YOLO
import os
from datetime import datetime

class ObjectDetectionService:
    def __init__(self):
        self.model = None
        self.model_loaded = False
        self.confidence_threshold = 0.7
        self.nms_threshold = 0.4
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
    def load_model(self, model_path: str = "yolov8n.pt"):
        """Load YOLO model"""
        try:
            self.model = YOLO(model_path)
            self.model.to(self.device)
            self.model_loaded = True
            print(f"✅ YOLO model loaded on {self.device}")
            return True
        except Exception as e:
            print(f"❌ Error loading YOLO model: {e}")
            self.model_loaded = False
            return False
    
    def detect_objects(self, frame: np.ndarray, confidence_threshold: float = 0.7) -> List[dict]:
        """Detect objects in frame"""
        if not self.model_loaded:
            return []
        
        try:
            # Run inference
            results = self.model(frame, conf=confidence_threshold, iou=self.nms_threshold)
            
            detections = []
            
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        # Get bounding box coordinates
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        confidence = float(box.conf[0].cpu().numpy())
                        class_id = int(box.cls[0].cpu().numpy())
                        
                        # Get class name
                        class_name = self.model.names[class_id]
                        
                        # Create detection
                        detection = {
                            "type": self._get_detection_type(class_name),
                            "confidence": confidence,
                            "bbox": {
                                "x": float(x1),
                                "y": float(y1),
                                "width": float(x2 - x1),
                                "height": float(y2 - y1)
                            },
                            "class_id": class_id,
                            "class_name": class_name
                        }
                        
                        detections.append(detection)
            
            return detections
            
        except Exception as e:
            print(f"❌ Object detection error: {e}")
            return []
    
    def detect_persons(self, frame: np.ndarray, confidence_threshold: float = 0.7) -> List[dict]:
        """Detect only persons"""
        detections = self.detect_objects(frame, confidence_threshold)
        return [d for d in detections if d["type"] == "person"]
    
    def analyze_person_behavior(self, frame: np.ndarray, person_detections: List[dict]) -> List[dict]:
        """Analyze person behavior (sleeping, active, idle)"""
        analyzed_detections = []
        
        for detection in person_detections:
            bbox = detection["bbox"]
            
            # Extract person region
            x, y, w, h = int(bbox["x"]), int(bbox["y"]), int(bbox["width"]), int(bbox["height"])
            person_roi = frame[y:y+h, x:x+w]
            
            if person_roi.size == 0:
                continue
            
            # Analyze behavior
            status, confidence = self._analyze_person_status(person_roi)
            
            analyzed_detection = detection.copy()
            analyzed_detection.update({
                "status": status,
                "behavior_confidence": confidence,
                "person_id": f"person_{datetime.now().timestamp()}_{len(analyzed_detections)}",
                "name": "Unknown"  # Will be updated by face recognition
            })
            
            analyzed_detections.append(analyzed_detection)
        
        return analyzed_detections
    
    def _get_detection_type(self, class_name: str) -> str:
        """Map class name to detection type"""
        person_classes = ["person"]
        face_classes = ["face"]
        
        if class_name.lower() in person_classes:
            return "person"
        elif class_name.lower() in face_classes:
            return "face"
        else:
            return "object"
    
    def _analyze_person_status(self, person_roi: np.ndarray) -> Tuple[str, float]:
        """Analyze person status (simplified behavior analysis)"""
        try:
            # Convert to grayscale for analysis
            gray = cv2.cvtColor(person_roi, cv2.COLOR_BGR2GRAY)
            
            # Calculate motion and posture indicators
            # This is a simplified version - in production, use more sophisticated models
            
            # Edge detection for posture analysis
            edges = cv2.Canny(gray, 50, 150)
            
            # Count edge pixels (simplified posture indicator)
            edge_count = np.sum(edges > 0)
            roi_area = person_roi.shape[0] * person_roi.shape[1]
            edge_density = edge_count / roi_area if roi_area > 0 else 0
            
            # Simple heuristic for behavior classification
            if edge_density < 0.1:  # Low edge density might indicate sleeping
                return "sleeping", 0.7
            elif edge_density < 0.2:  # Medium edge density might indicate idle
                return "idle", 0.6
            else:  # High edge density indicates active
                return "active", 0.8
                
        except Exception as e:
            print(f"❌ Behavior analysis error: {e}")
            return "active", 0.5
    
    def get_model_info(self) -> dict:
        """Get model information"""
        return {
            "model_loaded": self.model_loaded,
            "device": self.device,
            "confidence_threshold": self.confidence_threshold,
            "nms_threshold": self.nms_threshold
        }
