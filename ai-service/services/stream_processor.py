import asyncio
import websockets
import json
import cv2
import numpy as np
from typing import Dict, List, Set, Optional
from datetime import datetime, timedelta
import threading
import time

from services.webcam_service import WebcamService
from services.object_detection import ObjectDetectionService
from services.face_recognition import FaceRecognitionService
from services.pose_estimation import PoseEstimationService
from services.emotion_detection import EmotionDetectionService
from services.anomaly_detection import AnomalyDetectionService
from services.alert_service import AlertService

class StreamProcessor:
    def __init__(self):
        self.active_streams: Dict[str, Dict] = {}
        self.stream_clients: Dict[str, Set] = {}
        self.processing_threads: Dict[str, threading.Thread] = {}
        self.alert_service = AlertService()
        
    async def start_multi_camera_stream(self, camera_configs: List[Dict]):
        """Start streaming from multiple cameras"""
        try:
            for config in camera_configs:
                camera_id = str(config.get("camera_id", 0))
                
                if camera_id in self.active_streams:
                    print(f"⚠️ Camera {camera_id} already streaming")
                    continue
                
                # Initialize webcam for this camera
                webcam = WebcamService()
                success = await webcam.initialize_webcam(config.get("camera_id", 0))
                
                if not success:
                    print(f"❌ Failed to initialize camera {camera_id}")
                    continue
                
                # Start streaming thread
                stream_thread = threading.Thread(
                    target=self._process_camera_stream,
                    args=(webcam, config, camera_id),
                    daemon=True
                )
                stream_thread.start()
                
                self.active_streams[camera_id] = {
                    "webcam": webcam,
                    "config": config,
                    "thread": stream_thread,
                    "started_at": datetime.utcnow().isoformat(),
                    "frame_count": 0,
                    "last_analysis": None,
                    "alerts_sent": 0
                }
                
                print(f"📹 Started streaming camera {camera_id}")
            
            return {
                "success": True,
                "active_cameras": list(self.active_streams.keys()),
                "message": f"Started {len(self.active_streams)} camera streams"
            }
            
        except Exception as e:
            print(f"❌ Error starting multi-camera stream: {e}")
            return {"success": False, "error": str(e)}
    
    def _process_camera_stream(self, webcam: WebcamService, config: Dict, camera_id: str):
        """Process individual camera stream"""
        try:
            last_alert_time = time.time()
            analysis_buffer = []
            
            while camera_id in self.active_streams:
                ret, frame = webcam.cap.read()
                if not ret:
                    print(f"⚠️ Camera {camera_id} frame read failed")
                    time.sleep(0.1)
                    continue
                
                # Update frame count
                self.active_streams[camera_id]["frame_count"] += 1
                
                # Perform comprehensive analysis
                analysis_result = await self._comprehensive_frame_analysis(
                    frame, config, camera_id
                )
                
                # Store analysis
                self.active_streams[camera_id]["last_analysis"] = analysis_result
                
                # Add to buffer for trend analysis
                analysis_buffer.append(analysis_result)
                if len(analysis_buffer) > 30:  # Keep last 30 analyses
                    analysis_buffer.pop(0)
                
                # Check for alerts
                current_time = time.time()
                if current_time - last_alert_time > 5:  # Check every 5 seconds
                    await self._process_stream_alerts(analysis_result, camera_id)
                    last_alert_time = current_time
                    self.active_streams[camera_id]["alerts_sent"] += 1
                
                # Small delay to control frame rate
                time.sleep(1.0 / config.get("fps", 30))
                
        except Exception as e:
            print(f"❌ Error processing camera {camera_id} stream: {e}")
    
    async def _comprehensive_frame_analysis(self, frame: np.ndarray, config: Dict, camera_id: str) -> Dict:
        """Perform comprehensive analysis on frame"""
        try:
            from utils.image_processing import ImageProcessor
            
            analysis_start = time.time()
            
            # Enhance frame
            enhanced_frame = ImageProcessor.enhance_frame(frame)
            
            result = {
                "camera_id": camera_id,
                "timestamp": datetime.utcnow().isoformat(),
                "frame_id": self.active_streams[camera_id]["frame_count"],
                "analysis": {}
            }
            
            # 1. Person Detection
            if config.get("person_detection", True):
                detection_service = ObjectDetectionService()
                # Load AI models
                detection_service.load_model()
                
                persons = detection_service.detect_persons(
                    enhanced_frame,
                    config.get("confidence_threshold", 0.7)
                )
                result["analysis"]["persons"] = persons
                result["analysis"]["person_count"] = len(persons)
            
            # 2. Face Recognition
            if config.get("face_recognition", True) and result["analysis"].get("persons"):
                face_service = FaceRecognitionService()
                face_service.load_known_faces()
                
                faces = face_service.recognize_faces(
                    enhanced_frame,
                    config.get("confidence_threshold", 0.7)
                )
                result["analysis"]["faces"] = faces
                result["analysis"]["recognized_employees"] = [
                    f.get("employee_id") for f in faces if f.get("employee_id")
                ]
            
            # 3. Pose Estimation
            if config.get("pose_estimation", True):
                pose_service = PoseEstimationService()
                pose_service.load_model()
                
                pose_data = pose_service.estimate_pose(enhanced_frame)
                result["analysis"]["pose"] = pose_data
                result["analysis"]["posture"] = pose_data.get("pose_analysis", {}).get("posture", "unknown")
                result["analysis"]["activity"] = pose_data.get("pose_analysis", {}).get("activity", "unknown")
            
            # 4. Emotion Detection
            if config.get("emotion_detection", True) and result["analysis"].get("faces"):
                emotion_service = EmotionDetectionService()
                emotion_service.load_model()
                
                emotions = emotion_service.detect_emotions(
                    enhanced_frame,
                    result["analysis"]["faces"]
                )
                result["analysis"]["emotions"] = emotions
                result["analysis"]["dominant_emotion"] = emotions[0].get("emotion", "neutral") if emotions else "neutral"
                result["analysis"]["stress_level"] = emotions[0].get("stress_level", 0.3) if emotions else 0.3
            
            # 5. Motion Detection
            result["analysis"]["motion_level"] = self._calculate_motion_level(enhanced_frame)
            
            # 6. Frame Quality
            result["analysis"]["frame_quality"] = ImageProcessor.calculate_frame_quality(enhanced_frame)
            
            # 7. Processing time
            result["processing_time_ms"] = (time.time() - analysis_start) * 1000
            
            return result
            
        except Exception as e:
            print(f"❌ Error in comprehensive analysis: {e}")
            return {"error": str(e), "timestamp": datetime.utcnow().isoformat()}
    
    def _calculate_motion_level(self, frame: np.ndarray) -> float:
        """Calculate motion level in frame"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Simple motion detection using frame difference
            # In real implementation, compare with previous frame
            # For now, return variance as motion indicator
            motion_variance = np.var(gray)
            
            # Normalize to 0-1 scale
            return min(1.0, motion_variance / 10000.0)
            
        except Exception:
            return 0.0
    
    async def _process_stream_alerts(self, analysis_result: Dict, camera_id: str):
        """Process alerts from stream analysis"""
        try:
            alerts = []
            
            # Person count alerts
            person_count = analysis_result.get("analysis", {}).get("person_count", 0)
            if person_count > config.get("max_persons", 5):
                alerts.append({
                    "type": "crowding_detected",
                    "severity": "medium",
                    "message": f"Too many persons detected: {person_count}",
                    "camera_id": camera_id
                })
            
            # Unauthorized person alerts
            recognized_employees = analysis_result.get("analysis", {}).get("recognized_employees", [])
            unknown_persons = analysis_result.get("analysis", {}).get("person_count", 0) - len(recognized_employees)
            
            if unknown_persons > 0:
                alerts.append({
                    "type": "unauthorized_person",
                    "severity": "high",
                    "message": f"Unauthorized person(s) detected: {unknown_persons}",
                    "camera_id": camera_id
                })
            
            # Posture alerts
            posture = analysis_result.get("analysis", {}).get("posture", "unknown")
            if posture in ["lying_down", "slouching"]:
                alerts.append({
                    "type": "improper_posture",
                    "severity": "medium",
                    "message": f"Improper posture detected: {posture}",
                    "camera_id": camera_id
                })
            
            # Stress alerts
            stress_level = analysis_result.get("analysis", {}).get("stress_level", 0.0)
            if stress_level > 0.7:
                alerts.append({
                    "type": "high_stress",
                    "severity": "medium",
                    "message": f"High stress level detected: {stress_level:.2f}",
                    "camera_id": camera_id
                })
            
            # Send alerts to backend
            for alert in alerts:
                alert_data = {
                    "cameraId": camera_id,
                    "alertType": alert["type"],
                    "severity": alert["severity"],
                    "message": alert["message"],
                    "timestamp": datetime.utcnow().isoformat(),
                    "metadata": {
                        "analysis_data": analysis_result,
                        "stream_context": True
                    }
                }
                
                await self.alert_service.send_alert(alert_data)
            
        except Exception as e:
            print(f"❌ Error processing stream alerts: {e}")
    
    async def add_stream_client(self, camera_id: str, websocket):
        """Add client to specific camera stream"""
        if camera_id not in self.stream_clients:
            self.stream_clients[camera_id] = set()
        
        self.stream_clients[camera_id].add(websocket)
        print(f"👤 Client added to camera {camera_id} stream: {len(self.stream_clients[camera_id])} clients")
    
    async def remove_stream_client(self, camera_id: str, websocket):
        """Remove client from specific camera stream"""
        if camera_id in self.stream_clients:
            self.stream_clients[camera_id].discard(websocket)
            print(f"👋 Client removed from camera {camera_id} stream: {len(self.stream_clients[camera_id])} clients")
    
    async def broadcast_to_camera_clients(self, camera_id: str, data: Dict):
        """Broadcast data to all clients of specific camera"""
        if camera_id not in self.stream_clients:
            return
        
        message = json.dumps(data)
        disconnected_clients = set()
        
        for client in self.stream_clients[camera_id]:
            try:
                await client.send(message)
            except Exception as e:
                print(f"❌ Error sending to client: {e}")
                disconnected_clients.add(client)
        
        # Remove disconnected clients
        self.stream_clients[camera_id] -= disconnected_clients
    
    def get_stream_statistics(self) -> Dict:
        """Get comprehensive streaming statistics"""
        stats = {
            "active_cameras": len(self.active_streams),
            "total_clients": sum(len(clients) for clients in self.stream_clients.values()),
            "streams": {}
        }
        
        for camera_id, stream_data in self.active_streams.items():
            stats["streams"][camera_id] = {
                "camera_id": camera_id,
                "frame_count": stream_data["frame_count"],
                "alerts_sent": stream_data["alerts_sent"],
                "uptime_seconds": (datetime.utcnow() - datetime.fromisoformat(stream_data["started_at"])).total_seconds(),
                "client_count": len(self.stream_clients.get(camera_id, set())),
                "last_analysis": stream_data["last_analysis"],
                "status": "active"
            }
        
        return stats
    
    async def stop_camera_stream(self, camera_id: str):
        """Stop specific camera stream"""
        try:
            if camera_id in self.active_streams:
                # Stop webcam
                webcam = self.active_streams[camera_id]["webcam"]
                await webcam.stop_streaming()
                
                # Remove from active streams
                del self.active_streams[camera_id]
                
                # Close all clients for this camera
                if camera_id in self.stream_clients:
                    for client in self.stream_clients[camera_id].copy():
                        try:
                            await client.close()
                        except:
                            pass
                    
                    del self.stream_clients[camera_id]
                
                print(f"🛑 Stopped camera {camera_id} stream")
                return {"success": True, "message": f"Camera {camera_id} stream stopped"}
            else:
                return {"success": False, "message": f"Camera {camera_id} not active"}
                
        except Exception as e:
            print(f"❌ Error stopping camera {camera_id} stream: {e}")
            return {"success": False, "error": str(e)}
    
    async def stop_all_streams(self):
        """Stop all camera streams"""
        try:
            for camera_id in list(self.active_streams.keys()):
                await self.stop_camera_stream(camera_id)
            
            return {
                "success": True,
                "message": f"Stopped all {len(self.active_streams)} camera streams"
            }
            
        except Exception as e:
            print(f"❌ Error stopping all streams: {e}")
            return {"success": False, "error": str(e)}
