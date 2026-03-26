import os
import cv2
import numpy as np
from ultralytics import YOLO

class YOLOService:
    def __init__(self):
        # Load YOLOv8 pose model
        model_path = os.getenv("MODEL_PATH", "yolov8n-pose.pt")
        self.model = YOLO(model_path)
        self.threshold = 0.5

    def detect_persons(self, frame: np.ndarray) -> list:
        """Run YOLO inference and filter for person class"""
        results = self.model(frame, classes=[0], conf=self.threshold, verbose=False)
        detections = []
        
        for result in results:
            boxes = result.boxes
            keypoints = result.keypoints
            
            for i in range(len(boxes)):
                bbox = boxes[i].xyxy[0].cpu().numpy().astype(int).tolist() # [x1, y1, x2, y2]
                conf = float(boxes[i].conf[0])
                kpts = keypoints[i].data[0].cpu().numpy().tolist() # [[x, y, conf], ...]
                
                # Convert [x1, y1, x2, y2] to {x, y, w, h}
                bbox_dict = {
                    "x": bbox[0],
                    "y": bbox[1],
                    "w": bbox[2] - bbox[0],
                    "h": bbox[3] - bbox[1]
                }
                
                detections.append({
                    "bbox": bbox_dict,
                    "confidence": conf,
                    "keypoints": kpts
                })
                
        return detections

    def classify_status(self, bbox: dict, keypoints: list) -> str:
        """Classify worker status from pose keypoints and bbox"""
        # keypoints: [[x, y, conf], ...]
        # YOLOv8 Pose keypoints: 0: nose, 1: l_eye, 2: r_eye, 3: l_ear, 4: r_ear, 
        # 5: l_shoulder, 6: r_shoulder, 7: l_elbow, 8: r_elbow, 9: l_wrist, 
        # 10: r_wrist, 11: l_hip, 12: r_hip, 13: l_knee, 14: r_knee, 15: l_ankle, 16: r_ankle
        
        nose_y = keypoints[0][1]
        l_ankle_y = keypoints[15][1]
        r_ankle_y = keypoints[16][1]
        
        # SLEEPING Logic: Body is horizontal (width > height) and head is low
        # Or head is very close to ground level (ankle level)
        height = bbox['h']
        width = bbox['w']
        
        # If person is lying down (width-heavy or very short compared to width)
        if width > (height * 1.2):
             return "sleeping"
             
        # If head is near ankles (crouched or lying but vertical result)
        ankle_avg_y = (l_ankle_y + r_ankle_y) / 2
        if abs(nose_y - ankle_avg_y) < (height * 0.2):
            return "sleeping"

        # IDLE vs ACTIVE
        # Since we are per-frame, "IDLE" is hard to distinguish from "ACTIVE" without temporal info.
        # However, we can use shoulder/hip alignment. 
        # IDLE: Standing still (balanced shoulders/hips)
        # ACTIVE: Leaning or dynamic pose (imbalanced)
        
        # Simple heuristic: if vertical (height > width)
        if height > width:
            # Check for "active" based on keypoint spread? 
            # For now, let's default to active if not sleeping
            return "active"
        
        return "idle"

    def process_frame(self, frame: np.ndarray) -> list:
        """Detect persons and classify their status"""
        detections = self.detect_persons(frame)
        results = []
        
        for det in detections:
            status = self.classify_status(det['bbox'], det['keypoints'])
            results.append({
                "bbox": det['bbox'],
                "confidence": det['confidence'],
                "status": status,
                "keypoints": det['keypoints']
            })
            
        return results