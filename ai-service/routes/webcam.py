from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from typing import List, Dict, Any
import asyncio
import json
from datetime import datetime

from services.webcam_service import WebcamService
from services.alert_service import AlertService

router = APIRouter(prefix="/api/webcam", tags=["webcam streaming"])

# Initialize webcam service
webcam_service = WebcamService()
active_streams = {}

@router.get("/")
async def webcam_interface():
    """Serve webcam interface HTML"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>AI Webcam Monitor</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #1a1a1a; color: white; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .controls { background: #2d2d2d; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
            .video-container { background: #000; border-radius: 10px; overflow: hidden; margin-bottom: 20px; }
            .analysis-panel { background: #2d2d2d; padding: 20px; border-radius: 10px; }
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
            .stat-item { background: #3d3d3d; padding: 15px; border-radius: 8px; text-align: center; }
            .button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; }
            .button:hover { background: #0056b3; }
            .button.danger { background: #dc3545; }
            .button.danger:hover { background: #c82333; }
            .status { padding: 10px; border-radius: 5px; margin: 5px 0; }
            .status.good { background: #28a745; }
            .status.warning { background: #ffc107; color: #000; }
            .status.danger { background: #dc3545; }
            .log { background: #000; padding: 15px; border-radius: 8px; height: 200px; overflow-y: auto; font-family: monospace; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎥 AI Webcam Monitor</h1>
                <p>Real-time AI-powered workplace monitoring</p>
            </div>
            
            <div class="controls">
                <h3>📹 Camera Controls</h3>
                <button onclick="startStream()" class="button">▶️ Start Streaming</button>
                <button onclick="stopStream()" class="button danger">⏹️ Stop Streaming</button>
                <button onclick="captureSnapshot()" class="button">📸 Capture Snapshot</button>
                <button onclick="testCamera()" class="button">🔧 Test Camera</button>
                
                <div style="margin-top: 15px;">
                    <label>Camera ID: <input type="number" id="cameraId" value="0" min="0" max="9" style="margin: 0 10px;"></label>
                    <label>Confidence: <input type="range" id="confidence" min="0.1" max="1.0" step="0.1" value="0.7" style="margin: 0 10px;"></label>
                    <label><input type="checkbox" id="faceRecognition" checked> Face Recognition</label>
                    <label><input type="checkbox" id="poseEstimation" checked> Pose Estimation</label>
                    <label><input type="checkbox" id="emotionDetection" checked> Emotion Detection</label>
                    <label><input type="checkbox" id="anomalyDetection" checked> Anomaly Detection</label>
                </div>
            </div>
            
            <div class="video-container">
                <img id="videoElement" style="width: 100%; height: auto; display: none;">
                <canvas id="canvasElement" style="width: 100%; height: auto;"></canvas>
            </div>
            
            <div class="analysis-panel">
                <h3>📊 Real-time Analysis</h3>
                <div class="stats">
                    <div class="stat-item">
                        <h4>👥 Persons Detected</h4>
                        <div id="personCount" style="font-size: 24px; font-weight: bold;">0</div>
                    </div>
                    <div class="stat-item">
                        <h4>😊 Emotion</h4>
                        <div id="dominantEmotion" style="font-size: 18px;">-</div>
                    </div>
                    <div class="stat-item">
                        <h4>🧍 Posture</h4>
                        <div id="posture" style="font-size: 18px;">-</div>
                    </div>
                    <div class="stat-item">
                        <h4>⚡ FPS</h4>
                        <div id="fps" style="font-size: 18px;">0</div>
                    </div>
                    <div class="stat-item">
                        <h4>⚠️ Risk Level</h4>
                        <div id="riskLevel" class="status good">LOW</div>
                    </div>
                    <div class="stat-item">
                        <h4>🔗 Connected</h4>
                        <div id="connectedClients" style="font-size: 18px;">0</div>
                    </div>
                </div>
                
                <div style="margin-top: 20px;">
                    <h4>📝 Analysis Log</h4>
                    <div id="analysisLog" class="log"></div>
                </div>
            </div>
        </div>
        
        <script>
            let ws = null;
            let streamActive = false;
            
            function connectWebSocket() {
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                ws = new WebSocket(`${protocol}//${window.location.host}/ws/webcam`);
                
                ws.onopen = function() {
                    console.log('🔗 Connected to webcam stream');
                    document.getElementById('connectedClients').textContent = '1';
                    updateStatus('WebSocket connected', 'good');
                };
                
                ws.onmessage = function(event) {
                    const data = JSON.parse(event.data);
                    updateAnalysisDisplay(data);
                };
                
                ws.onclose = function() {
                    console.log('🔌 Disconnected from webcam stream');
                    document.getElementById('connectedClients').textContent = '0';
                    updateStatus('WebSocket disconnected', 'warning');
                    ws = null;
                };
                
                ws.onerror = function(error) {
                    console.error('❌ WebSocket error:', error);
                    updateStatus('WebSocket error', 'danger');
                };
            }
            
            function updateAnalysisDisplay(data) {
                document.getElementById('personCount').textContent = data.analysis?.person_count || 0;
                document.getElementById('dominantEmotion').textContent = data.analysis?.dominant_emotion?.toUpperCase() || '-';
                document.getElementById('posture').textContent = data.analysis?.posture?.toUpperCase() || '-';
                document.getElementById('fps').textContent = data.fps?.toFixed(1) || '0';
                
                const riskLevel = data.analysis?.risk_level || 'low';
                const riskElement = document.getElementById('riskLevel');
                riskElement.textContent = riskLevel.toUpperCase();
                riskElement.className = `status ${riskLevel}`;
                
                // Add to log
                const logElement = document.getElementById('analysisLog');
                const logEntry = `[${new Date().toLocaleTimeString()}] Persons: ${data.analysis?.person_count || 0}, Emotion: ${data.analysis?.dominant_emotion || '-'}, Posture: ${data.analysis?.posture || '-'}\\n`;
                logElement.textContent = logEntry + logElement.textContent;
                logElement.scrollTop = logElement.scrollHeight;
            }
            
            function updateStatus(message, type) {
                const logElement = document.getElementById('analysisLog');
                const statusEntry = `[${new Date().toLocaleTimeString()}] ${message}\\n`;
                logElement.textContent = statusEntry + logElement.textContent;
                logElement.scrollTop = logElement.scrollHeight;
            }
            
            async function startStream() {
                if (streamActive) return;
                
                const settings = {
                    camera_id: parseInt(document.getElementById('cameraId').value),
                    detection_confidence: parseFloat(document.getElementById('confidence').value),
                    face_recognition_enabled: document.getElementById('faceRecognition').checked,
                    pose_estimation_enabled: document.getElementById('poseEstimation').checked,
                    emotion_detection_enabled: document.getElementById('emotionDetection').checked,
                    anomaly_detection_enabled: document.getElementById('anomalyDetection').checked
                };
                
                try {
                    const response = await fetch('/api/webcam/start', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(settings)
                    });
                    
                    if (response.ok) {
                        streamActive = true;
                        connectWebSocket();
                        updateStatus('Streaming started', 'good');
                    } else {
                        updateStatus('Failed to start stream', 'danger');
                    }
                } catch (error) {
                    updateStatus(`Error: ${error.message}`, 'danger');
                }
            }
            
            async function stopStream() {
                if (!streamActive) return;
                
                try {
                    await fetch('/api/webcam/stop', { method: 'POST' });
                    streamActive = false;
                    if (ws) ws.close();
                    updateStatus('Streaming stopped', 'warning');
                } catch (error) {
                    updateStatus(`Error: ${error.message}`, 'danger');
                }
            }
            
            async function captureSnapshot() {
                try {
                    const response = await fetch('/api/webcam/snapshot');
                    const data = await response.json();
                    
                    if (data.success) {
                        // Create download link
                        const link = document.createElement('a');
                        link.href = `data:image/jpeg;base64,${data.image_base64}`;
                        link.download = `snapshot_${Date.now()}.jpg`;
                        link.click();
                        updateStatus('Snapshot captured', 'good');
                    } else {
                        updateStatus('Failed to capture snapshot', 'danger');
                    }
                } catch (error) {
                    updateStatus(`Error: ${error.message}`, 'danger');
                }
            }
            
            async function testCamera() {
                const cameraId = parseInt(document.getElementById('cameraId').value);
                
                try {
                    const response = await fetch(`/api/webcam/test/${cameraId}`);
                    const data = await response.json();
                    
                    if (data.success) {
                        updateStatus(`Camera ${cameraId}: ${data.quality}`, 'good');
                    } else {
                        updateStatus(`Camera ${cameraId}: ${data.error}`, 'danger');
                    }
                } catch (error) {
                    updateStatus(`Error: ${error.message}`, 'danger');
                }
            }
            
            // Auto-connect on page load
            window.onload = function() {
                updateStatus('Webcam interface loaded', 'good');
            };
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@router.post("/start")
async def start_webcam_stream(settings: Dict):
    """Start webcam streaming with settings"""
    try:
        camera_id = settings.get("camera_id", 0)
        
        # Initialize webcam
        success = await webcam_service.initialize_webcam(camera_id)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to initialize webcam")
        
        # Update settings
        webcam_service.update_settings(settings)
        
        # Start streaming in background
        stream_task = asyncio.create_task(
            webcam_service.start_streaming()
        )
        
        active_streams[camera_id] = {
            "task": stream_task,
            "settings": settings,
            "started_at": datetime.utcnow().isoformat()
        }
        
        return {
            "success": True,
            "message": "Webcam streaming started",
            "camera_id": camera_id,
            "settings": webcam_service.stream_settings,
            "websocket_url": "ws://localhost:8765",
            "interface_url": "/api/webcam/",
            "started_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Error starting webcam stream: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start webcam stream: {str(e)}")

@router.post("/stop")
async def stop_webcam_stream():
    """Stop webcam streaming"""
    try:
        await webcam_service.stop_streaming()
        active_streams.clear()
        
        return {
            "success": True,
            "message": "Webcam streaming stopped",
            "stopped_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Error stopping webcam stream: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to stop webcam stream: {str(e)}")

@router.get("/snapshot")
async def capture_webcam_snapshot():
    """Capture snapshot from webcam"""
    try:
        frame = webcam_service.capture_snapshot()
        if frame is None:
            raise HTTPException(status_code=400, detail="No frame available")
        
        image_base64 = webcam_service.get_frame_base64()
        
        return {
            "success": True,
            "message": "Snapshot captured",
            "image_base64": image_base64,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Error capturing snapshot: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to capture snapshot: {str(e)}")

@router.get("/cameras")
async def get_available_cameras():
    """Get list of available cameras"""
    try:
        cameras = webcam_service.get_available_cameras()
        
        return {
            "success": True,
            "cameras": cameras,
            "total_cameras": len(cameras),
            "available_cameras": len([c for c in cameras if c["available"]])
        }
        
    except Exception as e:
        print(f"❌ Error getting cameras: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get cameras: {str(e)}")

@router.get("/test/{camera_id}")
async def test_specific_camera(camera_id: int):
    """Test specific camera"""
    try:
        result = await webcam_service.test_camera(camera_id)
        
        return result
        
    except Exception as e:
        print(f"❌ Error testing camera: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to test camera: {str(e)}")

@router.get("/status")
async def get_webcam_status():
    """Get current webcam streaming status"""
    try:
        stats = webcam_service.get_stream_stats()
        stats["active_streams"] = len(active_streams)
        
        return {
            "success": True,
            "status": stats,
            "message": "Webcam status retrieved successfully"
        }
        
    except Exception as e:
        print(f"❌ Error getting webcam status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get webcam status: {str(e)}")

@router.post("/settings")
async def update_webcam_settings(settings: Dict):
    """Update webcam streaming settings"""
    try:
        webcam_service.update_settings(settings)
        
        return {
            "success": True,
            "message": "Settings updated successfully",
            "settings": webcam_service.stream_settings
        }
        
    except Exception as e:
        print(f"❌ Error updating settings: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update settings: {str(e)}")

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time webcam streaming"""
    await websocket.accept()
    
    try:
        while True:
            # Get current frame analysis
            if webcam_service.current_frame is not None:
                analysis_result = await webcam_service._analyze_frame_realtime(
                    webcam_service.current_frame
                )
                
                # Send analysis results
                await websocket.send_json(analysis_result)
            
            await asyncio.sleep(0.1)  # Send at 10 FPS
            
    except WebSocketDisconnect:
        print("👋 WebSocket client disconnected")
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        await websocket.close()

@router.get("/stream/{camera_id}")
async def get_stream_url(camera_id: int):
    """Get streaming URL for specific camera"""
    stream_url = f"ws://localhost:8765/ws/camera/{camera_id}"
    
    return {
        "success": True,
        "camera_id": camera_id,
        "stream_url": stream_url,
        "interface_url": f"/api/webcam/",
        "message": "Connect to WebSocket for live streaming"
    }
