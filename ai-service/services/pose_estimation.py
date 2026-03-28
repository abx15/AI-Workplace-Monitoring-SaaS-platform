import cv2
import numpy as np
import mediapipe as mp
from typing import List, Dict, Tuple, Optional
import math
from datetime import datetime

class PoseEstimationService:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = None
        self.model_loaded = False
        
    def load_model(self):
        """Load MediaPipe pose estimation model"""
        try:
            self.pose = self.mp_pose.Pose(
                static_image_mode=False,
                model_complexity=1,
                enable_segmentation=False,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
            self.model_loaded = True
            print("✅ Pose estimation model loaded")
            return True
        except Exception as e:
            print(f"❌ Error loading pose model: {e}")
            self.model_loaded = False
            return False
    
    def estimate_pose(self, frame: np.ndarray) -> Dict:
        """Estimate pose landmarks from frame"""
        if not self.model_loaded:
            return {}
        
        try:
            # Convert BGR to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.pose.process(rgb_frame)
            
            if not results.pose_landmarks:
                return {}
            
            landmarks = results.pose_landmarks.landmark
            
            # Extract key body parts
            pose_data = {
                "landmarks": [],
                "body_parts": {},
                "pose_analysis": {},
                "confidence": 0.0
            }
            
            # Add all landmarks
            for idx, landmark in enumerate(landmarks):
                pose_data["landmarks"].append({
                    "id": idx,
                    "x": landmark.x,
                    "y": landmark.y,
                    "z": landmark.z,
                    "visibility": landmark.visibility
                })
            
            # Extract key body parts
            pose_data["body_parts"] = self._extract_body_parts(landmarks)
            
            # Analyze pose
            pose_data["pose_analysis"] = self._analyze_pose(landmarks)
            
            # Calculate overall confidence
            visible_landmarks = [lm for lm in landmarks if lm.visibility > 0.5]
            pose_data["confidence"] = len(visible_landmarks) / len(landmarks)
            
            return pose_data
            
        except Exception as e:
            print(f"❌ Pose estimation error: {e}")
            return {}
    
    def _extract_body_parts(self, landmarks) -> Dict:
        """Extract key body part positions"""
        try:
            return {
                "head": {
                    "x": landmarks[mp.solutions.pose.PoseLandmark.NOSE].x,
                    "y": landmarks[mp.solutions.pose.PoseLandmark.NOSE].y,
                    "visibility": landmarks[mp.solutions.pose.PoseLandmark.NOSE].visibility
                },
                "left_shoulder": {
                    "x": landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER].x,
                    "y": landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER].y,
                    "visibility": landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER].visibility
                },
                "right_shoulder": {
                    "x": landmarks[mp.solutions.pose.PoseLandmark.RIGHT_SHOULDER].x,
                    "y": landmarks[mp.solutions.pose.PoseLandmark.RIGHT_SHOULDER].y,
                    "visibility": landmarks[mp.solutions.pose.PoseLandmark.RIGHT_SHOULDER].visibility
                },
                "left_elbow": {
                    "x": landmarks[mp.solutions.pose.PoseLandmark.LEFT_ELBOW].x,
                    "y": landmarks[mp.solutions.pose.PoseLandmark.LEFT_ELBOW].y,
                    "visibility": landmarks[mp.solutions.pose.PoseLandmark.LEFT_ELBOW].visibility
                },
                "right_elbow": {
                    "x": landmarks[mp.solutions.pose.PoseLandmark.RIGHT_ELBOW].x,
                    "y": landmarks[mp.solutions.pose.PoseLandmark.RIGHT_ELBOW].y,
                    "visibility": landmarks[mp.solutions.pose.PoseLandmark.RIGHT_ELBOW].visibility
                },
                "left_wrist": {
                    "x": landmarks[mp.solutions.pose.PoseLandmark.LEFT_WRIST].x,
                    "y": landmarks[mp.solutions.pose.PoseLandmark.LEFT_WRIST].y,
                    "visibility": landmarks[mp.solutions.pose.PoseLandmark.LEFT_WRIST].visibility
                },
                "right_wrist": {
                    "x": landmarks[mp.solutions.pose.PoseLandmark.RIGHT_WRIST].x,
                    "y": landmarks[mp.solutions.pose.PoseLandmark.RIGHT_WRIST].y,
                    "visibility": landmarks[mp.solutions.pose.PoseLandmark.RIGHT_WRIST].visibility
                },
                "left_hip": {
                    "x": landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP].x,
                    "y": landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP].y,
                    "visibility": landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP].visibility
                },
                "right_hip": {
                    "x": landmarks[mp.solutions.pose.PoseLandmark.RIGHT_HIP].x,
                    "y": landmarks[mp.solutions.pose.PoseLandmark.RIGHT_HIP].y,
                    "visibility": landmarks[mp.solutions.pose.PoseLandmark.RIGHT_HIP].visibility
                },
                "left_knee": {
                    "x": landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE].x,
                    "y": landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE].y,
                    "visibility": landmarks[mp.solutions.pose.PoseLandmark.LEFT_KNEE].visibility
                },
                "right_knee": {
                    "x": landmarks[mp.solutions.pose.PoseLandmark.RIGHT_KNEE].x,
                    "y": landmarks[mp.solutions.pose.PoseLandmark.RIGHT_KNEE].y,
                    "visibility": landmarks[mp.solutions.pose.PoseLandmark.RIGHT_KNEE].visibility
                }
            }
        except Exception as e:
            print(f"❌ Error extracting body parts: {e}")
            return {}
    
    def _analyze_pose(self, landmarks) -> Dict:
        """Analyze pose for activity detection"""
        try:
            analysis = {
                "posture": "unknown",
                "activity": "unknown",
                "attention": "unknown",
                "fatigue_level": 0.0,
                "productivity_score": 0.0
            }
            
            # Calculate posture
            analysis["posture"] = self._analyze_posture(landmarks)
            
            # Calculate activity
            analysis["activity"] = self._analyze_activity(landmarks)
            
            # Calculate attention (head position)
            analysis["attention"] = self._analyze_attention(landmarks)
            
            # Calculate fatigue level
            analysis["fatigue_level"] = self._calculate_fatigue(landmarks)
            
            # Calculate productivity score
            analysis["productivity_score"] = self._calculate_productivity(landmarks)
            
            return analysis
            
        except Exception as e:
            print(f"❌ Error analyzing pose: {e}")
            return {"posture": "unknown", "activity": "unknown"}
    
    def _analyze_posture(self, landmarks) -> str:
        """Analyze body posture"""
        try:
            # Get key points
            left_shoulder = landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks[mp.solutions.pose.PoseLandmark.RIGHT_SHOULDER]
            left_hip = landmarks[mp.solutions.pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks[mp.solutions.pose.PoseLandmark.RIGHT_HIP]
            
            # Calculate shoulder and hip midpoints
            shoulder_mid_y = (left_shoulder.y + right_shoulder.y) / 2
            hip_mid_y = (left_hip.y + right_hip.y) / 2
            
            # Calculate spine angle
            spine_angle = math.degrees(math.atan2(shoulder_mid_y - hip_mid_y, 0.1))
            
            # Determine posture
            if abs(spine_angle) < 10:
                return "standing"
            elif abs(spine_angle) < 30:
                return "sitting"
            elif abs(spine_angle) > 45:
                return "lying_down"
            else:
                return "slouching"
                
        except Exception:
            return "unknown"
    
    def _analyze_activity(self, landmarks) -> str:
        """Analyze current activity"""
        try:
            # Check hand positions for activity
            left_wrist = landmarks[mp.solutions.pose.PoseLandmark.LEFT_WRIST]
            right_wrist = landmarks[mp.solutions.pose.PoseLandmark.RIGHT_WRIST]
            left_shoulder = landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks[mp.solutions.pose.PoseLandmark.RIGHT_SHOULDER]
            
            # Calculate hand positions relative to shoulders
            left_hand_raised = left_wrist.y < left_shoulder.y
            right_hand_raised = right_wrist.y < right_shoulder.y
            
            if left_hand_raised and right_hand_raised:
                return "hands_raised"
            elif left_hand_raised or right_hand_raised:
                return "one_hand_raised"
            else:
                return "hands_normal"
                
        except Exception:
            return "unknown"
    
    def _analyze_attention(self, landmarks) -> str:
        """Analyze attention based on head position"""
        try:
            nose = landmarks[mp.solutions.pose.PoseLandmark.NOSE]
            left_shoulder = landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks[mp.solutions.pose.PoseLandmark.RIGHT_SHOULDER]
            
            # Calculate head tilt
            shoulder_mid_x = (left_shoulder.x + right_shoulder.x) / 2
            head_offset = nose.x - shoulder_mid_x
            
            # Determine attention
            if abs(head_offset) < 0.05:
                return "focused"
            elif head_offset > 0:
                return "looking_right"
            else:
                return "looking_left"
                
        except Exception:
            return "unknown"
    
    def _calculate_fatigue(self, landmarks) -> float:
        """Calculate fatigue level based on pose"""
        try:
            fatigue_indicators = 0
            
            # Check for slouching
            posture = self._analyze_posture(landmarks)
            if posture in ["slouching", "lying_down"]:
                fatigue_indicators += 0.3
            
            # Check for head position
            nose = landmarks[mp.solutions.pose.PoseLandmark.NOSE]
            left_shoulder = landmarks[mp.solutions.pose.PoseLandmark.LEFT_SHOULDER]
            
            if nose.y > left_shoulder.y:  # Head down
                fatigue_indicators += 0.2
            
            # Check for stillness (simplified)
            # In real implementation, compare with previous frames
            stillness_score = 0.1  # Placeholder
            
            fatigue_indicators += stillness_score
            
            return min(1.0, fatigue_indicators)
            
        except Exception:
            return 0.0
    
    def _calculate_productivity(self, landmarks) -> float:
        """Calculate productivity score"""
        try:
            productivity = 0.5  # Base score
            
            # Posture bonus
            posture = self._analyze_posture(landmarks)
            if posture == "standing":
                productivity += 0.2
            elif posture == "sitting":
                productivity += 0.1
            elif posture in ["slouching", "lying_down"]:
                productivity -= 0.3
            
            # Attention bonus
            attention = self._analyze_attention(landmarks)
            if attention == "focused":
                productivity += 0.2
            
            # Activity bonus
            activity = self._analyze_activity(landmarks)
            if activity == "hands_normal":
                productivity += 0.1
            
            return max(0.0, min(1.0, productivity))
            
        except Exception:
            return 0.5
    
    def draw_pose_on_frame(self, frame: np.ndarray, pose_data: Dict) -> np.ndarray:
        """Draw pose landmarks on frame"""
        try:
            if not pose_data.get("landmarks"):
                return frame
            
            annotated_frame = frame.copy()
            
            # Draw landmarks
            for landmark in pose_data["landmarks"]:
                if landmark["visibility"] > 0.5:
                    x = int(landmark["x"] * frame.shape[1])
                    y = int(landmark["y"] * frame.shape[0])
                    cv2.circle(annotated_frame, (x, y), 3, (0, 255, 0), -1)
            
            # Draw connections
            connections = [
                (11, 12),  # shoulders
                (11, 13),  # left arm
                (13, 15),  # left forearm
                (12, 14),  # right arm
                (14, 16),  # right forearm
                (11, 23),  # left side
                (12, 24),  # right side
                (23, 24),  # hips
                (23, 25),  # left leg
                (25, 27),  # left shin
                (24, 26),  # right leg
                (26, 28)   # right shin
            ]
            
            for start_idx, end_idx in connections:
                if start_idx < len(pose_data["landmarks"]) and end_idx < len(pose_data["landmarks"]):
                    start = pose_data["landmarks"][start_idx]
                    end = pose_data["landmarks"][end_idx]
                    
                    if start["visibility"] > 0.5 and end["visibility"] > 0.5:
                        start_x = int(start["x"] * frame.shape[1])
                        start_y = int(start["y"] * frame.shape[0])
                        end_x = int(end["x"] * frame.shape[1])
                        end_y = int(end["y"] * frame.shape[0])
                        
                        cv2.line(annotated_frame, (start_x, start_y), (end_x, end_y), (255, 0, 0), 2)
            
            return annotated_frame
            
        except Exception as e:
            print(f"❌ Error drawing pose: {e}")
            return frame
