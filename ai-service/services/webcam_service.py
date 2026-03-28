import cv2
import numpy as np
import asyncio
import websockets
import json
from typing import Dict, List, Optional, Callable
from datetime import datetime
import threading
import time

from services.object_detection import ObjectDetectionService
from services.face_recognition import FaceRecognitionService
from services.pose_estimation import PoseEstimationService
from services.emotion_detection import EmotionDetectionService
from services.anomaly_detection import AnomalyDetectionService
from utils.image_processing import ImageProcessor

class WebcamService:
    def __init__(self):
        self.cap = None
        self.is_streaming = False
        self.current_frame = None
        self.frame_count = 0
        self.fps = 0
        self.clients = set()
        self.analysis_services = {
            'detection': ObjectDetectionService(),
            'face': FaceRecognitionService(),
            'pose': PoseEstimationService(),
            'emotion': EmotionDetectionService(),
            'anomaly': AnomalyDetectionService()
        }
        self.stream_settings = {
            'camera_id': 0,
            'resolution': (640, 480),
            'fps': 30,
            'analysis_enabled': True,
            'detection_confidence': 0.7,
            'face_recognition_enabled': True,
            'pose_estimation_enabled': True,
            'emotion_detection_enabled': True,
            'anomaly_detection_enabled': True
        }
        
    async def initialize_webcam(self, camera_id: int = 0):
        """Initialize webcam for streaming"""
        try:
            self.cap = cv2.VideoCapture(camera_id)
            if not self.cap.isOpened():
                raise Exception(f"Could not open webcam {camera_id}")
            
            # Set camera properties
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.stream_settings['resolution'][0])
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.stream_settings['resolution'][1])
            self.cap.set(cv2.CAP_PROP_FPS, self.stream_settings['fps'])
            
            # Load AI models
            await self._load_ai_models()
            
            print(f"✅ Webcam {camera_id} initialized successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error initializing webcam: {e}")
            return False
    
    async def _load_ai_models(self):
        """Load all AI models"""
        try:
            await asyncio.get_event_loop().run_in_executor(
                None, self.analysis_services['detection'].load_model
            )
            await asyncio.get_event_loop().run_in_executor(
                None, self.analysis_services['face'].load_known_faces
            )
            await asyncio.get_event_loop().run_in_executor(
                None, self.analysis_services['pose'].load_model
            )
            await asyncio.get_event_loop().run_in_executor(
                None, self.analysis_services['emotion'].load_model
            )
            print("✅ All AI models loaded for webcam processing")
        except Exception as e:
            print(f"❌ Error loading AI models: {e}")
    
    async def start_streaming(self, websocket_port: int = 8765):
        """Start webcam streaming with real-time analysis"""
        try:
            self.is_streaming = True
            
            # Start WebSocket server for clients
            server_task = asyncio.create_task(
                self._start_websocket_server(websocket_port)
            )
            
            # Start frame capture and analysis
            capture_task = asyncio.create_task(
                self._capture_and_analyze_frames()
            )
            
            print(f"📹 Webcam streaming started on port {websocket_port}")
            print(f"🌐 WebSocket: ws://localhost:{websocket_port}")
            print("🔗 Connect to receive real-time analysis results")
            
            await server_task
            await capture_task
            
        except Exception as e:
            print(f"❌ Error starting stream: {e}")
            self.is_streaming = False
    
    async def _start_websocket_server(self, port: int):
        """Start WebSocket server for streaming results"""
        async def handle_client(websocket, path):
            self.clients.add(websocket)
            print(f"👤 Client connected: {websocket.remote_address}")
            
            try:
                await websocket.send(json.dumps({
                    "type": "connection",
                    "message": "Connected to webcam stream",
                    "timestamp": datetime.utcnow().isoformat()
                }))
                
                # Keep connection alive and send analysis results
                while self.is_streaming:
                    await asyncio.sleep(0.1)
                    
            except websockets.exceptions.ConnectionClosed:
                pass
            finally:
                self.clients.discard(websocket)
                print(f"👋 Client disconnected: {websocket.remote_address}")
        
        server = await websockets.serve(handle_client, "localhost", port)
        print(f"🌐 WebSocket server started on port {port}")
        await server.wait_closed()
    
    async def _capture_and_analyze_frames(self):
        """Capture frames from webcam and perform real-time analysis"""
        last_time = time.time()
        frame_times = []
        
        while self.is_streaming and self.cap and self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret:
                print("⚠️ Failed to capture frame")
                continue
            
            self.current_frame = frame
            self.frame_count += 1
            
            # Calculate FPS
            current_time = time.time()
            frame_times.append(current_time)
            if len(frame_times) > 10:
                frame_times.pop(0)
                self.fps = len(frame_times) / (frame_times[-1] - frame_times[0])
            
            # Perform analysis if enabled
            if self.stream_settings['analysis_enabled']:
                analysis_result = await self._analyze_frame_realtime(frame)
                
                # Broadcast to all connected clients
                if self.clients and analysis_result:
                    await self._broadcast_to_clients(analysis_result)
            
            # Small delay to control frame rate
            await asyncio.sleep(1.0 / self.stream_settings['fps'])
    
    async def _analyze_frame_realtime(self, frame: np.ndarray) -> Dict:
        """Perform real-time analysis on frame"""
        try:
            analysis_start = time.time()
            
            # Enhance frame
            enhanced_frame = ImageProcessor.enhance_frame(frame)
            
            result = {
                "timestamp": datetime.utcnow().isoformat(),
                "frame_id": self.frame_count,
                "fps": self.fps,
                "camera_id": self.stream_settings['camera_id'],
                "analysis": {}
            }
            
            # 1. Object Detection
            if self.stream_settings['detection_confidence'] > 0:
                persons = self.analysis_services['detection'].detect_persons(
                    enhanced_frame, 
                    self.stream_settings['detection_confidence']
                )
                result["analysis"]["persons"] = persons
                result["analysis"]["person_count"] = len(persons)
            
            # 2. Face Recognition
            if self.stream_settings['face_recognition_enabled']:
                faces = self.analysis_services['face'].recognize_faces(
                    enhanced_frame,
                    self.stream_settings['detection_confidence']
                )
                result["analysis"]["faces"] = faces
                result["analysis"]["recognized_faces"] = [f for f in faces if f.get('employee_id')]
            
            # 3. Pose Estimation
            if self.stream_settings['pose_estimation_enabled']:
                pose_data = self.analysis_services['pose'].estimate_pose(enhanced_frame)
                result["analysis"]["pose"] = pose_data
                result["analysis"]["posture"] = pose_data.get("pose_analysis", {}).get("posture", "unknown")
                result["analysis"]["activity"] = pose_data.get("pose_analysis", {}).get("activity", "unknown")
            
            # 4. Emotion Detection
            if self.stream_settings['emotion_detection_enabled'] and result["analysis"].get("faces"):
                emotions = self.analysis_services['emotion'].detect_emotions(
                    enhanced_frame, 
                    result["analysis"]["faces"]
                )
                result["analysis"]["emotions"] = emotions
                result["analysis"]["dominant_emotion"] = emotions[0].get("emotion") if emotions else "neutral"
                result["analysis"]["stress_level"] = emotions[0].get("stress_level", 0.3) if emotions else 0.3
            
            # 5. Anomaly Detection
            if self.stream_settings['anomaly_detection_enabled']:
                anomalies = self.analysis_services['anomaly'].detect_anomalies(
                    enhanced_frame, 
                    result["analysis"].get("persons", [])
                )
                result["analysis"]["anomalies"] = anomalies
                result["analysis"]["risk_level"] = anomalies.get("risk_level", "low")
            
            # Add processing time
            result["processing_time_ms"] = (time.time() - analysis_start) * 1000
            result["analysis"]["quality"] = ImageProcessor.calculate_frame_quality(enhanced_frame)
            
            return result
            
        except Exception as e:
            print(f"❌ Real-time analysis error: {e}")
            return {"error": str(e), "timestamp": datetime.utcnow().isoformat()}
    
    async def _broadcast_to_clients(self, data: Dict):
        """Broadcast analysis results to all connected WebSocket clients"""
        if not self.clients:
            return
        
        message = json.dumps(data)
        disconnected_clients = set()
        
        for client in self.clients:
            try:
                await client.send(message)
            except websockets.exceptions.ConnectionClosed:
                disconnected_clients.add(client)
            except Exception as e:
                print(f"❌ Error sending to client: {e}")
                disconnected_clients.add(client)
        
        # Remove disconnected clients
        self.clients -= disconnected_clients
    
    def update_settings(self, settings: Dict):
        """Update streaming settings"""
        self.stream_settings.update(settings)
        print(f"⚙️ Settings updated: {settings}")
    
    def get_available_cameras(self) -> List[Dict]:
        """Get list of available cameras"""
        cameras = []
        
        # Test camera IDs 0-9
        for i in range(10):
            cap = cv2.VideoCapture(i)
            if cap.isOpened():
                width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                fps = int(cap.get(cv2.CAP_PROP_FPS))
                
                cameras.append({
                    "id": i,
                    "name": f"Camera {i}",
                    "resolution": f"{width}x{height}",
                    "fps": fps,
                    "available": True
                })
                cap.release()
            else:
                cameras.append({
                    "id": i,
                    "name": f"Camera {i}",
                    "available": False
                })
        
        return cameras
    
    def get_stream_stats(self) -> Dict:
        """Get current streaming statistics"""
        return {
            "is_streaming": self.is_streaming,
            "frame_count": self.frame_count,
            "current_fps": self.fps,
            "connected_clients": len(self.clients),
            "camera_id": self.stream_settings['camera_id'],
            "resolution": self.stream_settings['resolution'],
            "target_fps": self.stream_settings['fps'],
            "settings": self.stream_settings,
            "uptime": time.time() if self.is_streaming else 0
        }
    
    async def stop_streaming(self):
        """Stop webcam streaming"""
        self.is_streaming = False
        
        if self.cap:
            self.cap.release()
            self.cap = None
        
        # Close all client connections
        for client in self.clients.copy():
            try:
                await client.close()
            except:
                pass
        
        self.clients.clear()
        print("🛑 Webcam streaming stopped")
    
    def capture_snapshot(self) -> Optional[np.ndarray]:
        """Capture single snapshot from webcam"""
        if not self.cap or not self.cap.isOpened():
            return None
        
        ret, frame = self.cap.read()
        return frame if ret else None
    
    def get_frame_base64(self, quality: int = 85) -> str:
        """Get current frame as base64"""
        if self.current_frame is not None:
            return ImageProcessor.frame_to_base64(self.current_frame, quality)
        return ""
    
    async def test_camera(self, camera_id: int) -> Dict:
        """Test specific camera"""
        try:
            cap = cv2.VideoCapture(camera_id)
            if not cap.isOpened():
                return {"success": False, "error": "Camera not accessible"}
            
            # Try to read a few frames
            test_frames = []
            for _ in range(5):
                ret, frame = cap.read()
                if ret:
                    test_frames.append(frame)
                else:
                    cap.release()
                    return {"success": False, "error": "Cannot read frames"}
            
            cap.release()
            
            if test_frames:
                # Analyze frame quality
                avg_brightness = np.mean([cv2.mean(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)) for f in test_frames])
                avg_motion = np.mean([np.std(cv2.absdiff(test_frames[i], test_frames[i+1])) 
                                   for i in range(len(test_frames)-1)])
                
                return {
                    "success": True,
                    "camera_id": camera_id,
                    "resolution": f"{test_frames[0].shape[1]}x{test_frames[0].shape[0]}",
                    "fps": int(cap.get(cv2.CAP_PROP_FPS)),
                    "avg_brightness": float(avg_brightness),
                    "motion_detected": avg_motion > 10,
                    "quality": "good" if avg_motion > 5 else "static"
                }
            else:
                return {"success": False, "error": "No frames captured"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
