import cv2
import numpy as np
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import time

class BehaviorAnalysisService:
    def __init__(self):
        self.analyzers = {
            'motion': MotionAnalyzer(),
            'posture': PostureAnalyzer(),
            'activity': ActivityAnalyzer()
        }
        
    def analyze_behavior(self, frame: np.ndarray, person_bbox: Dict) -> Dict:
        """Analyze person behavior"""
        try:
            x, y, w, h = int(person_bbox["x"]), int(person_bbox["y"]), int(person_bbox["width"]), int(person_bbox["height"])
            
            # Extract person ROI
            person_roi = frame[y:y+h, x:x+w]
            
            if person_roi.size == 0:
                return self._get_default_behavior()
            
            # Run all analyzers
            motion_result = self.analyzers['motion'].analyze(person_roi)
            posture_result = self.analyzers['posture'].analyze(person_roi)
            activity_result = self.analyzers['activity'].analyze(person_roi)
            
            # Combine results
            behavior = {
                "timestamp": datetime.now().isoformat(),
                "motion": motion_result,
                "posture": posture_result,
                "activity": activity_result,
                "overall_status": self._determine_overall_status(motion_result, posture_result, activity_result),
                "confidence": self._calculate_confidence(motion_result, posture_result, activity_result)
            }
            
            return behavior
            
        except Exception as e:
            print(f"❌ Behavior analysis error: {e}")
            return self._get_default_behavior()
    
    def _get_default_behavior(self) -> Dict:
        """Return default behavior analysis"""
        return {
            "timestamp": datetime.now().isoformat(),
            "motion": {"status": "unknown", "confidence": 0.0},
            "posture": {"status": "unknown", "confidence": 0.0},
            "activity": {"status": "unknown", "confidence": 0.0},
            "overall_status": "unknown",
            "confidence": 0.0
        }
    
    def _determine_overall_status(self, motion: Dict, posture: Dict, activity: Dict) -> str:
        """Determine overall behavior status"""
        # Simple logic to determine overall status
        if activity["status"] == "sleeping":
            return "sleeping"
        elif motion["status"] == "no_motion" and posture["status"] == "sitting":
            return "idle"
        elif motion["status"] == "high_motion":
            return "active"
        else:
            return "normal"
    
    def _calculate_confidence(self, motion: Dict, posture: Dict, activity: Dict) -> float:
        """Calculate overall confidence"""
        confidences = [
            motion["confidence"],
            posture["confidence"], 
            activity["confidence"]
        ]
        return float(np.mean(confidences))

class MotionAnalyzer:
    def __init__(self):
        self.previous_frame = None
        self.motion_threshold = 30.0
        
    def analyze(self, roi: np.ndarray) -> Dict:
        """Analyze motion in ROI"""
        try:
            gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
            gray = cv2.GaussianBlur(gray, (21, 21), 0)
            
            if self.previous_frame is None:
                self.previous_frame = gray
                return {"status": "initializing", "confidence": 0.0}
            
            # Calculate frame difference
            frame_delta = cv2.absdiff(self.previous_frame, gray)
            thresh = cv2.threshold(frame_delta, 25, 255, cv2.THRESH_BINARY)[1]
            
            # Calculate motion metrics
            motion_pixels = np.sum(thresh > 0)
            total_pixels = thresh.shape[0] * thresh.shape[1]
            motion_ratio = motion_pixels / total_pixels
            
            # Determine motion status
            if motion_ratio < 0.01:
                status = "no_motion"
                confidence = 0.9
            elif motion_ratio < 0.05:
                status = "low_motion"
                confidence = 0.8
            elif motion_ratio < 0.15:
                status = "medium_motion"
                confidence = 0.8
            else:
                status = "high_motion"
                confidence = 0.7
            
            self.previous_frame = gray
            
            return {
                "status": status,
                "confidence": confidence,
                "motion_ratio": float(motion_ratio)
            }
            
        except Exception as e:
            print(f"❌ Motion analysis error: {e}")
            return {"status": "error", "confidence": 0.0}

class PostureAnalyzer:
    def __init__(self):
        self.aspect_ratio_thresholds = {
            'standing': (0.3, 0.8),
            'sitting': (0.8, 1.5),
            'lying': (1.5, 3.0)
        }
        
    def analyze(self, roi: np.ndarray) -> Dict:
        """Analyze posture from ROI"""
        try:
            h, w = roi.shape[:2]
            aspect_ratio = h / w if w > 0 else 0
            
            # Determine posture based on aspect ratio
            if aspect_ratio < self.aspect_ratio_thresholds['standing'][1]:
                status = "standing"
                confidence = 0.7
            elif aspect_ratio < self.aspect_ratio_thresholds['sitting'][1]:
                status = "sitting"
                confidence = 0.8
            else:
                status = "lying"
                confidence = 0.6
            
            # Additional analysis using edge detection
            gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / (h * w)
            
            # Adjust confidence based on edge density
            if edge_density > 0.1:
                confidence = min(confidence + 0.1, 1.0)
            
            return {
                "status": status,
                "confidence": confidence,
                "aspect_ratio": float(aspect_ratio),
                "edge_density": float(edge_density)
            }
            
        except Exception as e:
            print(f"❌ Posture analysis error: {e}")
            return {"status": "error", "confidence": 0.0}

class ActivityAnalyzer:
    def __init__(self):
        self.consecutive_idle_frames = 0
        self.idle_threshold = 30  # frames
        
    def analyze(self, roi: np.ndarray) -> Dict:
        """Analyze activity level"""
        try:
            # Simple activity detection based on texture variation
            gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
            
            # Calculate local standard deviation as activity indicator
            kernel = np.ones((5, 5), np.float32) / 25
            local_mean = cv2.filter2D(gray.astype(np.float32), -1, kernel)
            local_var = cv2.filter2D((gray.astype(np.float32) - local_mean) ** 2, -1, kernel)
            activity_level = np.mean(np.sqrt(local_var))
            
            # Determine activity status
            if activity_level < 10:
                status = "sleeping"
                confidence = 0.7
                self.consecutive_idle_frames += 1
            elif activity_level < 20:
                status = "idle" if self.consecutive_idle_frames > self.idle_threshold else "low_activity"
                confidence = 0.6
                self.consecutive_idle_frames += 1
            else:
                status = "active"
                confidence = 0.8
                self.consecutive_idle_frames = 0
            
            return {
                "status": status,
                "confidence": confidence,
                "activity_level": float(activity_level),
                "consecutive_idle_frames": self.consecutive_idle_frames
            }
            
        except Exception as e:
            print(f"❌ Activity analysis error: {e}")
            return {"status": "error", "confidence": 0.0}
