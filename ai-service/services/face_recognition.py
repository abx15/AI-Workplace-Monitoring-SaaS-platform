import cv2
import numpy as np
from typing import List, Optional, Tuple
import face_recognition
import os
import pickle
from datetime import datetime

class FaceRecognitionService:
    def __init__(self):
        self.known_face_encodings = []
        self.known_face_ids = {}
        self.known_face_names = {}
        self.model_loaded = False
        
    def load_known_faces(self, faces_dataset_path: str = "faces_dataset"):
        """Load known faces from dataset"""
        try:
            if os.path.exists(faces_dataset_path):
                for person_name in os.listdir(faces_dataset_path):
                    person_path = os.path.join(faces_dataset_path, person_name)
                    if os.path.isdir(person_path):
                        for image_name in os.listdir(person_path):
                            if image_name.endswith(('.jpg', '.jpeg', '.png')):
                                image_path = os.path.join(person_path, image_name)
                                image = face_recognition.load_image_file(image_path)
                                face_encodings = face_recognition.face_encodings(image)
                                
                                if face_encodings:
                                    encoding = face_encodings[0]
                                    self.known_face_encodings.append(encoding)
                                    self.known_face_ids[encoding.tobytes()] = f"emp_{person_name}"
                                    self.known_face_names[encoding.tobytes()] = person_name
                
                self.model_loaded = True
                print(f"✅ Loaded {len(self.known_face_encodings)} known faces")
            else:
                print(f"⚠️ Faces dataset not found at {faces_dataset_path}")
                self.model_loaded = False
                
        except Exception as e:
            print(f"❌ Error loading faces: {e}")
            self.model_loaded = False
    
    def recognize_faces(self, frame: np.ndarray, confidence_threshold: float = 0.6) -> List[dict]:
        """Recognize faces in frame"""
        if not self.model_loaded:
            return []
        
        try:
            # Find face locations and encodings
            face_locations = face_recognition.face_locations(frame)
            face_encodings = face_recognition.face_encodings(frame, face_locations)
            
            recognized_faces = []
            
            for face_location, face_encoding in zip(face_locations, face_encodings):
                # Compare with known faces
                matches = face_recognition.compare_faces(
                    self.known_face_encodings, 
                    face_encoding, 
                    tolerance=1 - confidence_threshold
                )
                
                name = "Unknown"
                employee_id = None
                confidence = 0.0
                
                if True in matches:
                    first_match_index = matches.index(True)
                    encoding_bytes = self.known_face_encodings[first_match_index].tobytes()
                    name = self.known_face_names.get(encoding_bytes, "Unknown")
                    employee_id = self.known_face_ids.get(encoding_bytes, None)
                    
                    # Calculate confidence (simplified)
                    face_distances = face_recognition.face_distance(
                        self.known_face_encodings, 
                        face_encoding
                    )
                    best_match_index = np.argmin(face_distances)
                    confidence = 1 - face_distances[best_match_index]
                
                top, right, bottom, left = face_location
                
                recognized_faces.append({
                    "name": name,
                    "employee_id": employee_id,
                    "confidence": float(confidence),
                    "bbox": {
                        "x": float(left),
                        "y": float(top),
                        "width": float(right - left),
                        "height": float(bottom - top)
                    }
                })
            
            return recognized_faces
            
        except Exception as e:
            print(f"❌ Face recognition error: {e}")
            return []
    
    def register_new_face(self, frame: np.ndarray, employee_id: str, name: str) -> bool:
        """Register a new face"""
        try:
            face_locations = face_recognition.face_locations(frame)
            if not face_locations:
                return False
            
            face_encodings = face_recognition.face_encodings(frame, face_locations)
            if not face_encodings:
                return False
            
            encoding = face_encodings[0]
            self.known_face_encodings.append(encoding)
            self.known_face_ids[encoding.tobytes()] = employee_id
            self.known_face_names[encoding.tobytes()] = name
            
            print(f"✅ Registered new face: {name} ({employee_id})")
            return True
            
        except Exception as e:
            print(f"❌ Error registering face: {e}")
            return False
