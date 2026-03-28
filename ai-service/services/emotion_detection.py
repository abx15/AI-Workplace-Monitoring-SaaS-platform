import cv2
import numpy as np
from typing import List, Dict, Tuple, Optional
import torch
import torch.nn as nn
from datetime import datetime

class EmotionDetectionService:
    def __init__(self):
        self.model = None
        self.model_loaded = False
        self.emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
    def load_model(self, model_path: str = None):
        """Load emotion detection model"""
        try:
            # For demo purposes, we'll use a simplified approach
            # In production, load a pre-trained emotion detection model
            self.model_loaded = True
            print("✅ Emotion detection model loaded (simplified mode)")
            return True
        except Exception as e:
            print(f"❌ Error loading emotion model: {e}")
            self.model_loaded = False
            return False
    
    def detect_emotions(self, frame: np.ndarray, face_regions: List[Dict]) -> List[Dict]:
        """Detect emotions from face regions"""
        if not self.model_loaded:
            return []
        
        emotion_results = []
        
        for face_region in face_regions:
            try:
                # Extract face ROI
                bbox = face_region.get('bbox', {})
                x = int(bbox.get('x', 0))
                y = int(bbox.get('y', 0))
                w = int(bbox.get('width', 0))
                h = int(bbox.get('height', 0))
                
                if x < 0 or y < 0 or w <= 0 or h <= 0:
                    continue
                
                face_roi = frame[y:y+h, x:x+w]
                if face_roi.size == 0:
                    continue
                
                # Detect emotion (simplified - in production use actual model)
                emotion_data = self._analyze_emotion_simple(face_roi)
                
                # Merge with face data
                emotion_result = face_region.copy()
                emotion_result.update({
                    "emotion": emotion_data["emotion"],
                    "emotion_confidence": emotion_data["confidence"],
                    "emotional_state": emotion_data["state"],
                    "stress_level": emotion_data["stress_level"],
                    "engagement_score": emotion_data["engagement"]
                })
                
                emotion_results.append(emotion_result)
                
            except Exception as e:
                print(f"❌ Error detecting emotion for face: {e}")
                continue
        
        return emotion_results
    
    def _analyze_emotion_simple(self, face_roi: np.ndarray) -> Dict:
        """Simplified emotion analysis (placeholder for actual model)"""
        try:
            # Convert to grayscale for analysis
            gray = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
            
            # Calculate basic features
            # 1. Eye aspect ratio (simplified)
            eye_region = gray[int(gray.shape[0]*0.3):int(gray.shape[0]*0.6), :]
            eye_brightness = np.mean(eye_region)
            
            # 2. Mouth curvature (simplified)
            mouth_region = gray[int(gray.shape[0]*0.6):, :]
            mouth_variance = np.var(mouth_region)
            
            # 3. Overall face brightness
            face_brightness = np.mean(gray)
            
            # Simple heuristic-based emotion detection
            emotion_scores = {
                'happy': 0.0,
                'sad': 0.0,
                'angry': 0.0,
                'surprise': 0.0,
                'neutral': 0.0,
                'fear': 0.0,
                'disgust': 0.0
            }
            
            # Happy detection (bright eyes, high mouth variance)
            if eye_brightness > 100 and mouth_variance > 500:
                emotion_scores['happy'] += 0.8
            
            # Sad detection (dark face, low variance)
            if face_brightness < 80 and mouth_variance < 200:
                emotion_scores['sad'] += 0.7
            
            # Angry detection (medium brightness, medium variance)
            if 80 <= face_brightness <= 120 and 200 <= mouth_variance <= 400:
                emotion_scores['angry'] += 0.6
            
            # Surprise detection (bright face, high variance)
            if face_brightness > 120 and mouth_variance > 600:
                emotion_scores['surprise'] += 0.7
            
            # Neutral (medium values)
            if 90 <= face_brightness <= 110 and 300 <= mouth_variance <= 500:
                emotion_scores['neutral'] += 0.5
            
            # Find dominant emotion
            dominant_emotion = max(emotion_scores, key=emotion_scores.get)
            confidence = emotion_scores[dominant_emotion]
            
            # Normalize confidence
            total_score = sum(emotion_scores.values())
            if total_score > 0:
                confidence = confidence / total_score
            
            # Calculate derived metrics
            stress_level = self._calculate_stress_level(dominant_emotion, confidence)
            engagement_score = self._calculate_engagement_score(dominant_emotion, confidence)
            emotional_state = self._determine_emotional_state(dominant_emotion, stress_level)
            
            return {
                "emotion": dominant_emotion,
                "confidence": float(confidence),
                "state": emotional_state,
                "stress_level": stress_level,
                "engagement": engagement_score,
                "all_scores": {k: float(v/total_score) if total_score > 0 else 0.0 
                              for k, v in emotion_scores.items()}
            }
            
        except Exception as e:
            print(f"❌ Error in emotion analysis: {e}")
            return {
                "emotion": "neutral",
                "confidence": 0.5,
                "state": "calm",
                "stress_level": 0.3,
                "engagement": 0.5
            }
    
    def _calculate_stress_level(self, emotion: str, confidence: float) -> float:
        """Calculate stress level based on emotion"""
        stress_mapping = {
            'angry': 0.9,
            'fear': 0.8,
            'sad': 0.6,
            'surprise': 0.5,
            'disgust': 0.4,
            'neutral': 0.2,
            'happy': 0.1
        }
        
        base_stress = stress_mapping.get(emotion, 0.3)
        return min(1.0, base_stress * confidence)
    
    def _calculate_engagement_score(self, emotion: str, confidence: float) -> float:
        """Calculate engagement score"""
        engagement_mapping = {
            'happy': 0.9,
            'neutral': 0.7,
            'surprise': 0.6,
            'angry': 0.4,
            'sad': 0.3,
            'fear': 0.2,
            'disgust': 0.1
        }
        
        base_engagement = engagement_mapping.get(emotion, 0.5)
        return min(1.0, base_engagement * confidence + (1 - confidence) * 0.3)
    
    def _determine_emotional_state(self, emotion: str, stress_level: float) -> str:
        """Determine overall emotional state"""
        if stress_level > 0.7:
            return "stressed"
        elif emotion in ['happy', 'neutral']:
            return "positive"
        elif emotion in ['sad', 'angry', 'fear']:
            return "negative"
        else:
            return "neutral"
    
    def analyze_emotion_trends(self, emotion_history: List[Dict]) -> Dict:
        """Analyze emotion trends over time"""
        if not emotion_history:
            return {}
        
        try:
            # Calculate emotion frequencies
            emotion_counts = {}
            total_confidence = {}
            
            for record in emotion_history:
                emotion = record.get('emotion', 'neutral')
                confidence = record.get('confidence', 0.0)
                
                emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
                total_confidence[emotion] = total_confidence.get(emotion, 0) + confidence
            
            # Calculate percentages
            total_records = len(emotion_history)
            emotion_percentages = {}
            
            for emotion, count in emotion_counts.items():
                percentage = (count / total_records) * 100
                avg_confidence = total_confidence.get(emotion, 0) / count
                emotion_percentages[emotion] = {
                    "percentage": percentage,
                    "avg_confidence": avg_confidence,
                    "count": count
                }
            
            # Determine dominant emotions
            sorted_emotions = sorted(emotion_percentages.items(), 
                                key=lambda x: x[1]['percentage'], reverse=True)
            
            # Calculate trends
            recent_emotions = emotion_history[-10:]  # Last 10 records
            recent_counts = {}
            for record in recent_emotions:
                emotion = record.get('emotion', 'neutral')
                recent_counts[emotion] = recent_counts.get(emotion, 0) + 1
            
            dominant_recent = max(recent_counts, key=recent_counts.get) if recent_counts else "neutral"
            
            return {
                "overall_dominant": sorted_emotions[0][0] if sorted_emotions else "neutral",
                "recent_dominant": dominant_recent,
                "emotion_breakdown": emotion_percentages,
                "total_analyzed": total_records,
                "analysis_period": {
                    "start": emotion_history[0].get('timestamp') if emotion_history else None,
                    "end": emotion_history[-1].get('timestamp') if emotion_history else None
                },
                "trend_insights": self._generate_trend_insights(
                    sorted_emotions, dominant_recent, emotion_percentages
                )
            }
            
        except Exception as e:
            print(f"❌ Error analyzing emotion trends: {e}")
            return {}
    
    def _generate_trend_insights(self, sorted_emotions: List, 
                              dominant_recent: str, 
                              emotion_percentages: Dict) -> List[str]:
        """Generate insights from emotion trends"""
        insights = []
        
        if not sorted_emotions:
            return insights
        
        overall_dominant = sorted_emotions[0][0]
        
        # Check for stress patterns
        negative_emotions = ['angry', 'fear', 'sad', 'disgust']
        negative_percentage = sum(
            emotion_percentages.get(em, {}).get('percentage', 0) 
            for em in negative_emotions
        )
        
        if negative_percentage > 60:
            insights.append("High stress levels detected - consider break recommendations")
        
        # Check for low engagement
        positive_emotions = ['happy', 'neutral', 'surprise']
        positive_percentage = sum(
            emotion_percentages.get(em, {}).get('percentage', 0) 
            for em in positive_emotions
        )
        
        if positive_percentage < 40:
            insights.append("Low engagement detected - may affect productivity")
        
        # Check for emotional stability
        if overall_dominant == dominant_recent:
            insights.append(f"Consistent {dominant_recent} emotional state observed")
        else:
            insights.append(f"Emotional shift from {overall_dominant} to {dominant_recent}")
        
        return insights
    
    def get_emotion_summary(self, emotion_data: Dict) -> Dict:
        """Get summary of emotion analysis"""
        return {
            "dominant_emotion": emotion_data.get("emotion", "neutral"),
            "confidence": emotion_data.get("confidence", 0.0),
            "emotional_state": emotion_data.get("state", "neutral"),
            "stress_level": emotion_data.get("stress_level", 0.0),
            "engagement_score": emotion_data.get("engagement", 0.5),
            "recommendations": self._generate_recommendations(emotion_data)
        }
    
    def _generate_recommendations(self, emotion_data: Dict) -> List[str]:
        """Generate recommendations based on emotion analysis"""
        recommendations = []
        
        emotion = emotion_data.get("emotion", "neutral")
        stress = emotion_data.get("stress_level", 0.0)
        engagement = emotion_data.get("engagement", 0.5)
        
        if stress > 0.7:
            recommendations.append("Consider taking a short break to reduce stress")
        
        if engagement < 0.4:
            recommendations.append("Low engagement detected - try interactive tasks")
        
        if emotion == "sad":
            recommendations.append("Employee may need support - check in privately")
        
        if emotion == "angry":
            recommendations.append("High anger detected - may need intervention")
        
        if emotion == "happy" and engagement > 0.8:
            recommendations.append("High productivity and positive mood - great performance!")
        
        return recommendations
