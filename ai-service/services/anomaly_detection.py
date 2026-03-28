import cv2
import numpy as np
from typing import List, Dict, Tuple, Optional
from datetime import datetime, timedelta
import json
from collections import deque
import statistics

class AnomalyDetectionService:
    def __init__(self):
        self.history_buffer = deque(maxlen=100)  # Store last 100 frames
        self.anomaly_threshold = 2.0  # Standard deviations
        self.person_count_history = deque(maxlen=50)
        self.motion_history = deque(maxlen=30)
        self.lighting_history = deque(maxlen=20)
        
    def detect_anomalies(self, frame: np.ndarray, detections: List[Dict]) -> Dict:
        """Detect various types of anomalies"""
        try:
            anomalies = {
                "timestamp": datetime.utcnow().isoformat(),
                "anomalies": [],
                "risk_level": "low",
                "alerts": []
            }
            
            # Current frame analysis
            current_analysis = self._analyze_frame(frame, detections)
            
            # Add to history
            self.history_buffer.append(current_analysis)
            self.person_count_history.append(len(detections))
            
            # Detect anomalies
            anomalies["anomalies"] = self._detect_frame_anomalies(current_analysis)
            
            # Detect behavioral anomalies
            behavioral_anomalies = self._detect_behavioral_anomalies(detections)
            anomalies["anomalies"].extend(behavioral_anomalies)
            
            # Detect environmental anomalies
            environmental_anomalies = self._detect_environmental_anomalies(frame)
            anomalies["anomalies"].extend(environmental_anomalies)
            
            # Calculate overall risk level
            anomalies["risk_level"] = self._calculate_risk_level(anomalies["anomalies"])
            
            # Generate alerts
            anomalies["alerts"] = self._generate_anomaly_alerts(anomalies["anomalies"])
            
            return anomalies
            
        except Exception as e:
            print(f"❌ Error in anomaly detection: {e}")
            return {"anomalies": [], "risk_level": "low", "alerts": []}
    
    def _analyze_frame(self, frame: np.ndarray, detections: List[Dict]) -> Dict:
        """Analyze current frame"""
        analysis = {
            "person_count": len(detections),
            "motion_level": self._calculate_motion_level(frame),
            "lighting_level": self._calculate_lighting_level(frame),
            "noise_level": self._calculate_noise_level(frame),
            "crowding_level": self._calculate_crowding_level(detections),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return analysis
    
    def _detect_frame_anomalies(self, current_analysis: Dict) -> List[Dict]:
        """Detect anomalies in current frame compared to history"""
        anomalies = []
        
        if len(self.history_buffer) < 10:
            return anomalies  # Need enough history for comparison
        
        # Extract historical data
        person_counts = [h["person_count"] for h in self.history_buffer]
        motion_levels = [h["motion_level"] for h in self.history_buffer]
        lighting_levels = [h["lighting_level"] for h in self.history_buffer]
        
        # Person count anomaly
        if len(person_counts) > 0:
            person_mean = statistics.mean(person_counts)
            person_std = statistics.stdev(person_counts) if len(person_counts) > 1 else 0
            
            current_count = current_analysis["person_count"]
            z_score = abs(current_count - person_mean) / (person_std + 1e-6)
            
            if z_score > self.anomaly_threshold:
                anomalies.append({
                    "type": "person_count_anomaly",
                    "severity": "high" if z_score > 3 else "medium",
                    "description": f"Unusual person count: {current_count} (normal: {person_mean:.1f})",
                    "z_score": z_score,
                    "current_value": current_count,
                    "expected_range": [person_mean - 2*person_std, person_mean + 2*person_std]
                })
        
        # Motion anomaly
        if len(motion_levels) > 0:
            motion_mean = statistics.mean(motion_levels)
            motion_std = statistics.stdev(motion_levels) if len(motion_levels) > 1 else 0
            
            current_motion = current_analysis["motion_level"]
            motion_z = abs(current_motion - motion_mean) / (motion_std + 1e-6)
            
            if motion_z > self.anomaly_threshold:
                anomalies.append({
                    "type": "motion_anomaly",
                    "severity": "medium" if motion_z > 2.5 else "low",
                    "description": f"Unusual motion level: {current_motion:.2f}",
                    "z_score": motion_z,
                    "current_value": current_motion,
                    "expected_range": [motion_mean - 2*motion_std, motion_mean + 2*motion_std]
                })
        
        # Lighting anomaly
        if len(lighting_levels) > 0:
            lighting_mean = statistics.mean(lighting_levels)
            lighting_std = statistics.stdev(lighting_levels) if len(lighting_levels) > 1 else 0
            
            current_lighting = current_analysis["lighting_level"]
            lighting_z = abs(current_lighting - lighting_mean) / (lighting_std + 1e-6)
            
            if lighting_z > self.anomaly_threshold:
                anomalies.append({
                    "type": "lighting_anomaly",
                    "severity": "medium",
                    "description": f"Unusual lighting condition: {current_lighting:.2f}",
                    "z_score": lighting_z,
                    "current_value": current_lighting,
                    "expected_range": [lighting_mean - 2*lighting_std, lighting_mean + 2*lighting_std]
                })
        
        return anomalies
    
    def _detect_behavioral_anomalies(self, detections: List[Dict]) -> List[Dict]:
        """Detect behavioral anomalies"""
        anomalies = []
        
        for detection in detections:
            behavior = detection.get("status", "unknown")
            confidence = detection.get("confidence", 0.0)
            
            # Unusual behaviors
            if behavior == "sleeping" and confidence > 0.8:
                anomalies.append({
                    "type": "unusual_behavior",
                    "severity": "high",
                    "description": f"Person {detection.get('name', 'Unknown')} detected sleeping",
                    "person_id": detection.get("person_id"),
                    "behavior": behavior,
                    "confidence": confidence
                })
            
            elif behavior == "idle" and confidence > 0.9:
                anomalies.append({
                    "type": "prolonged_inactivity",
                    "severity": "medium",
                    "description": f"Person {detection.get('name', 'Unknown')} inactive for extended period",
                    "person_id": detection.get("person_id"),
                    "behavior": behavior,
                    "confidence": confidence
                })
        
        return anomalies
    
    def _detect_environmental_anomalies(self, frame: np.ndarray) -> List[Dict]:
        """Detect environmental anomalies"""
        anomalies = []
        
        # Check for camera obstruction
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        if blur_score < 100:  # Very blurry
            anomalies.append({
                "type": "camera_obstruction",
                "severity": "high",
                "description": "Camera may be obstructed or covered",
                "blur_score": blur_score
            })
        
        # Check for extreme lighting
        brightness = np.mean(gray)
        
        if brightness < 30:  # Very dark
            anomalies.append({
                "type": "extreme_darkness",
                "severity": "medium",
                "description": "Extremely low lighting conditions",
                "brightness": brightness
            })
        elif brightness > 220:  # Very bright
            anomalies.append({
                "type": "extreme_brightness",
                "severity": "medium",
                "description": "Extremely bright lighting conditions",
                "brightness": brightness
            })
        
        # Check for camera tampering (simplified)
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / (frame.shape[0] * frame.shape[1])
        
        if edge_density < 0.05:  # Very few edges
            anomalies.append({
                "type": "possible_tampering",
                "severity": "critical",
                "description": "Possible camera tampering or disconnection",
                "edge_density": edge_density
            })
        
        return anomalies
    
    def _calculate_motion_level(self, frame: np.ndarray) -> float:
        """Calculate motion level in frame"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Calculate optical flow (simplified)
            if len(self.motion_history) > 0:
                prev_gray = self.motion_history[-1]
                if prev_gray.shape == gray.shape:
                    flow = cv2.calcOpticalFlowFarneback(
                        prev_gray, gray, None, 0.5, 3, 15, 3, 5, 1.2, 0
                    )
                    motion_magnitude = np.mean(np.abs(flow))
                else:
                    motion_magnitude = 0.0
            else:
                motion_magnitude = 0.0
            
            # Store current frame for next iteration
            self.motion_history.append(gray)
            
            return float(motion_magnitude)
            
        except Exception:
            return 0.0
    
    def _calculate_lighting_level(self, frame: np.ndarray) -> float:
        """Calculate lighting level"""
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            return float(np.mean(gray))
        except Exception:
            return 128.0  # Default medium brightness
    
    def _calculate_noise_level(self, frame: np.ndarray) -> float:
        """Calculate noise level"""
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            return float(np.std(gray))
        except Exception:
            return 0.0
    
    def _calculate_crowding_level(self, detections: List[Dict]) -> float:
        """Calculate crowding level based on person density"""
        try:
            person_count = len(detections)
            
            # Simple crowding assessment
            if person_count == 0:
                return 0.0
            elif person_count <= 2:
                return 0.2
            elif person_count <= 5:
                return 0.5
            elif person_count <= 10:
                return 0.8
            else:
                return 1.0
                
        except Exception:
            return 0.0
    
    def _calculate_risk_level(self, anomalies: List[Dict]) -> str:
        """Calculate overall risk level"""
        if not anomalies:
            return "low"
        
        risk_score = 0
        for anomaly in anomalies:
            severity = anomaly.get("severity", "low")
            if severity == "critical":
                risk_score += 4
            elif severity == "high":
                risk_score += 3
            elif severity == "medium":
                risk_score += 2
            elif severity == "low":
                risk_score += 1
        
        if risk_score >= 6:
            return "critical"
        elif risk_score >= 4:
            return "high"
        elif risk_score >= 2:
            return "medium"
        else:
            return "low"
    
    def _generate_anomaly_alerts(self, anomalies: List[Dict]) -> List[Dict]:
        """Generate alerts from anomalies"""
        alerts = []
        
        for anomaly in anomalies:
            alert = {
                "type": "anomaly_detected",
                "anomaly_type": anomaly.get("type"),
                "severity": anomaly.get("severity"),
                "message": anomaly.get("description"),
                "timestamp": datetime.utcnow().isoformat(),
                "requires_action": self._requires_action(anomaly.get("type"))
            }
            alerts.append(alert)
        
        return alerts
    
    def _requires_action(self, anomaly_type: str) -> bool:
        """Determine if anomaly requires immediate action"""
        critical_anomalies = [
            "camera_obstruction",
            "possible_tampering",
            "person_count_anomaly",
            "unusual_behavior"
        ]
        
        return anomaly_type in critical_anomalies
    
    def get_anomaly_statistics(self) -> Dict:
        """Get anomaly detection statistics"""
        if not self.history_buffer:
            return {}
        
        recent_anomalies = []
        for frame_data in list(self.history_buffer)[-20:]:  # Last 20 frames
            # This would contain anomaly data if we stored it
            pass
        
        return {
            "frames_analyzed": len(self.history_buffer),
            "recent_anomaly_count": len(recent_anomalies),
            "average_person_count": statistics.mean(self.person_count_history) if self.person_count_history else 0,
            "person_count_variance": statistics.variance(self.person_count_history) if len(self.person_count_history) > 1 else 0,
            "detection_sensitivity": self.anomaly_threshold,
            "last_analysis": self.history_buffer[-1].get("timestamp") if self.history_buffer else None
        }
