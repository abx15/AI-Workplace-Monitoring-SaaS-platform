import cv2
import numpy as np
import mediapipe as mp
from typing import List, Dict, Optional, Tuple
import os
import pickle
from datetime import datetime

class FaceDetectionService:
    def __init__(self):
        self.mp_face_detection = mp.solutions.face_detection
        self.mp_drawing = mp.solutions.drawing_utils
        self.face_detection = None
        self.model_loaded = False
        self.known_faces = {}
        self.confidence_threshold = 0.5
        
    def load_model(self):
        """Load MediaPipe face detection model"""
        try:
            self.face_detection = self.mp_face_detection.FaceDetection(
                model_selection=0, min_detection_confidence=self.confidence_threshold
            )
            self.model_loaded = True
            print("✅ MediaPipe Face Detection loaded")
            return True
        except Exception as e:
            print(f"❌ Error loading face detection: {e}")
            self.model_loaded = False
            return False
    
    def detect_faces(self, frame: np.ndarray) -> List[Dict]:
        """Detect faces in frame using MediaPipe"""
        if not self.model_loaded:
            self.load_model()
        
        if not self.model_loaded:
            return []
        
        try:
            # Convert BGR to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.face_detection.process(rgb_frame)
            
            detected_faces = []
            
            if results.detections:
                for detection in results.detections:
                    # Get bounding box
                    bbox = detection.location_data.relative_bounding_box
                    h, w, _ = frame.shape
                    
                    x = int(bbox.xmin * w)
                    y = int(bbox.ymin * h)
                    width = int(bbox.width * w)
                    height = int(bbox.height * h)
                    
                    # Ensure coordinates are within frame
                    x = max(0, x)
                    y = max(0, y)
                    width = min(width, w - x)
                    height = min(height, h - y)
                    
                    face_data = {
                        "bbox": {
                            "x": float(x),
                            "y": float(y),
                            "width": float(width),
                            "height": float(height)
                        },
                        "confidence": float(detection.score[0]),
                        "face_id": f"face_{datetime.now().timestamp()}_{len(detected_faces)}"
                    }
                    
                    detected_faces.append(face_data)
            
            return detected_faces
            
        except Exception as e:
            print(f"❌ Face detection error: {e}")
            return []
    
    def extract_face_embedding(self, frame: np.ndarray, bbox: Dict) -> Optional[np.ndarray]:
        """Extract simple face embedding for recognition"""
        try:
            x, y, w, h = int(bbox["x"]), int(bbox["y"]), int(bbox["width"]), int(bbox["height"])
            face_roi = frame[y:y+h, x:x+w]
            
            if face_roi.size == 0:
                return None
            
            # Resize to standard size
            face_roi = cv2.resize(face_roi, (64, 64))
            
            # Convert to grayscale and flatten as simple embedding
            gray_face = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
            
            # Apply histogram equalization for better features
            equalized = cv2.equalizeHist(gray_face)
            
            # Flatten and normalize as embedding
            embedding = equalized.flatten().astype(np.float32)
            embedding = embedding / np.linalg.norm(embedding)
            
            return embedding
            
        except Exception as e:
            print(f"❌ Error extracting face embedding: {e}")
            return None
    
    def register_face(self, frame: np.ndarray, employee_id: str, name: str) -> bool:
        """Register a new face"""
        try:
            faces = self.detect_faces(frame)
            if not faces:
                return False
            
            # Use first detected face
            face = faces[0]
            embedding = self.extract_face_embedding(frame, face["bbox"])
            
            if embedding is not None:
                self.known_faces[employee_id] = {
                    "name": name,
                    "embedding": embedding,
                    "registered_at": datetime.now().isoformat()
                }
                print(f"✅ Registered face: {name} ({employee_id})")
                return True
            
            return False
            
        except Exception as e:
            print(f"❌ Error registering face: {e}")
            return False
    
    def recognize_faces(self, frame: np.ndarray, threshold: float = 0.6) -> List[Dict]:
        """Recognize faces in frame"""
        detected_faces = self.detect_faces(frame)
        recognized_faces = []
        
        for face in detected_faces:
            embedding = self.extract_face_embedding(frame, face["bbox"])
            
            if embedding is None:
                continue
            
            # Compare with known faces
            best_match = None
            best_similarity = 0.0
            
            for emp_id, face_data in self.known_faces.items():
                known_embedding = face_data["embedding"]
                
                # Calculate cosine similarity
                similarity = np.dot(embedding, known_embedding)
                
                if similarity > best_similarity and similarity > threshold:
                    best_similarity = similarity
                    best_match = emp_id
            
            recognized_face = face.copy()
            if best_match:
                recognized_face.update({
                    "employee_id": best_match,
                    "name": self.known_faces[best_match]["name"],
                    "recognition_confidence": float(best_similarity),
                    "recognized": True
                })
            else:
                recognized_face.update({
                    "employee_id": None,
                    "name": "Unknown",
                    "recognition_confidence": 0.0,
                    "recognized": False
                })
            
            recognized_faces.append(recognized_face)
        
        return recognized_faces
    
    def get_known_faces_count(self) -> int:
        """Get count of registered faces"""
        return len(self.known_faces)
    
    def get_service_info(self) -> Dict:
        """Get service information"""
        return {
            "model_loaded": self.model_loaded,
            "model_type": "MediaPipe Face Detection",
            "known_faces_count": len(self.known_faces),
            "confidence_threshold": self.confidence_threshold,
            "cpu_optimized": True
        }
