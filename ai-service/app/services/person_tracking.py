import cv2
import numpy as np
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
import uuid

class PersonTrackingService:
    def __init__(self):
        self.active_tracks = {}
        self.track_timeout = 5.0  # seconds
        self.max_distance = 100  # pixels
        self.next_track_id = 1
        
    def update_tracks(self, detections: List[Dict]) -> List[Dict]:
        """Update person tracks with new detections"""
        current_time = datetime.now()
        updated_tracks = []
        
        # Remove old tracks
        self._cleanup_old_tracks(current_time)
        
        # Simple tracking based on proximity
        unassigned_detections = detections.copy()
        
        # Try to match detections with existing tracks
        for track_id, track in self.active_tracks.items():
            best_detection = None
            best_distance = float('inf')
            
            for detection in unassigned_detections:
                distance = self._calculate_distance(
                    track['last_position'], 
                    detection['bbox']
                )
                
                if distance < self.max_distance and distance < best_distance:
                    best_distance = distance
                    best_detection = detection
            
            if best_detection:
                # Update track
                self.active_tracks[track_id].update({
                    'last_position': best_detection['bbox'],
                    'last_seen': current_time,
                    'detection_count': track['detection_count'] + 1,
                    'confidence': best_detection.get('confidence', 0.0)
                })
                
                # Add track info to detection
                best_detection['track_id'] = track_id
                best_detection['tracked'] = True
                best_detection['track_age'] = (current_time - track['first_seen']).total_seconds()
                
                updated_tracks.append(best_detection)
                unassigned_detections.remove(best_detection)
        
        # Create new tracks for unassigned detections
        for detection in unassigned_detections:
            track_id = f"track_{self.next_track_id}"
            self.next_track_id += 1
            
            self.active_tracks[track_id] = {
                'track_id': track_id,
                'first_seen': current_time,
                'last_seen': current_time,
                'last_position': detection['bbox'],
                'detection_count': 1,
                'confidence': detection.get('confidence', 0.0)
            }
            
            detection['track_id'] = track_id
            detection['tracked'] = True
            detection['track_age'] = 0.0
            
            updated_tracks.append(detection)
        
        return updated_tracks
    
    def _calculate_distance(self, old_bbox: Dict, new_bbox: Dict) -> float:
        """Calculate distance between two bounding boxes"""
        old_center = self._get_bbox_center(old_bbox)
        new_center = self._get_bbox_center(new_bbox)
        
        return np.sqrt(
            (old_center[0] - new_center[0])**2 + 
            (old_center[1] - new_center[1])**2
        )
    
    def _get_bbox_center(self, bbox: Dict) -> Tuple[float, float]:
        """Get center point of bounding box"""
        x = bbox['x'] + bbox['width'] / 2
        y = bbox['y'] + bbox['height'] / 2
        return (x, y)
    
    def _cleanup_old_tracks(self, current_time: datetime):
        """Remove tracks that haven't been updated recently"""
        expired_tracks = []
        
        for track_id, track in self.active_tracks.items():
            age = (current_time - track['last_seen']).total_seconds()
            if age > self.track_timeout:
                expired_tracks.append(track_id)
        
        for track_id in expired_tracks:
            del self.active_tracks[track_id]
    
    def get_track_statistics(self) -> Dict:
        """Get tracking statistics"""
        current_time = datetime.now()
        active_count = len(self.active_tracks)
        
        if active_count > 0:
            avg_track_age = np.mean([
                (current_time - track['first_seen']).total_seconds()
                for track in self.active_tracks.values()
            ])
        else:
            avg_track_age = 0.0
        
        return {
            "active_tracks": active_count,
            "average_track_age": avg_track_age,
            "total_tracks_created": self.next_track_id - 1,
            "tracking_timeout": self.track_timeout
        }
    
    def get_service_info(self) -> Dict:
        """Get service information"""
        return {
            "active_tracks": len(self.active_tracks),
            "tracking_algorithm": "Simple Proximity Tracking",
            "max_distance": self.max_distance,
            "track_timeout": self.track_timeout,
            "cpu_optimized": True
        }
