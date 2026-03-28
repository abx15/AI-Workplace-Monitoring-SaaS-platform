import asyncio
import httpx
import os
from datetime import datetime
from typing import Dict, List, Optional
from models.ai_models import Alert, Detection, AlertType, PersonStatus

class AlertService:
    def __init__(self):
        self.backend_url = os.getenv("BACKEND_URL", "http://localhost:5000")
        self.alert_queue = []
        self.processing_alerts = False
        
    async def send_alert(self, alert_data: dict) -> bool:
        """Send alert to backend service"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self.backend_url}/api/alerts/create",
                    json=alert_data,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 201:
                    print(f"🚨 Alert sent successfully: {alert_data.get('alertType', 'unknown')}")
                    return True
                else:
                    print(f"❌ Failed to send alert: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            print(f"❌ Error sending alert: {e}")
            return False
    
    def check_alert_conditions(self, detections: List[Detection], camera_id: str, company_id: str) -> List[Alert]:
        """Check if any detections trigger alerts"""
        alerts = []
        
        for detection in detections:
            # Check for sleeping person
            if detection.status == PersonStatus.SLEEPING and detection.confidence > 0.7:
                alert = Alert(
                    camera_id=camera_id,
                    company_id=company_id,
                    employee_id=detection.employee_id,
                    type=AlertType.SLEEPING,
                    severity="high",
                    message=f"Employee {detection.name or 'Unknown'} detected sleeping",
                    confidence=detection.confidence,
                    bbox=detection.bbox,
                    timestamp=datetime.utcnow()
                )
                alerts.append(alert)
            
            # Check for unauthorized person
            elif detection.name == "Unknown" and detection.confidence > 0.8:
                alert = Alert(
                    camera_id=camera_id,
                    company_id=company_id,
                    employee_id=None,
                    type=AlertType.UNAUTHORIZED,
                    severity="critical",
                    message="Unauthorized person detected",
                    confidence=detection.confidence,
                    bbox=detection.bbox,
                    timestamp=datetime.utcnow()
                )
                alerts.append(alert)
            
            # Check for idle employee (low productivity)
            elif detection.status == PersonStatus.IDLE and detection.confidence > 0.6:
                alert = Alert(
                    camera_id=camera_id,
                    company_id=company_id,
                    employee_id=detection.employee_id,
                    type=AlertType.PRODUCTIVITY_LOW,
                    severity="medium",
                    message=f"Employee {detection.name or 'Unknown'} appears idle",
                    confidence=detection.confidence,
                    bbox=detection.bbox,
                    timestamp=datetime.utcnow()
                )
                alerts.append(alert)
        
        return alerts
    
    async def process_frame_alerts(self, detections: List[Detection], camera_id: str, company_id: str):
        """Process alerts for a frame"""
        alerts = self.check_alert_conditions(detections, camera_id, company_id)
        
        for alert in alerts:
            # Convert to dict for API
            alert_dict = {
                "cameraId": alert.camera_id,
                "employeeId": alert.employee_id,
                "alertType": alert.type.value,
                "severity": alert.severity,
                "message": alert.message,
                "confidence": alert.confidence,
                "metadata": {
                    "bbox": alert.bbox.dict() if alert.bbox else None,
                    "timestamp": alert.timestamp.isoformat()
                }
            }
            
            # Send alert asynchronously
            await self.send_alert(alert_dict)
    
    def queue_alert(self, alert_data: dict):
        """Queue alert for batch processing"""
        self.alert_queue.append(alert_data)
        
        # Process queue if it's getting full
        if len(self.alert_queue) >= 10:
            asyncio.create_task(self.process_alert_queue())
    
    async def process_alert_queue(self):
        """Process queued alerts"""
        if self.processing_alerts or not self.alert_queue:
            return
        
        self.processing_alerts = True
        
        try:
            # Process alerts in batches
            batch_size = 5
            for i in range(0, len(self.alert_queue), batch_size):
                batch = self.alert_queue[i:i + batch_size]
                
                # Send each alert in the batch
                tasks = [self.send_alert(alert) for alert in batch]
                await asyncio.gather(*tasks, return_exceptions=True)
                
                # Small delay between batches
                await asyncio.sleep(0.1)
            
            # Clear processed alerts
            self.alert_queue.clear()
            
        except Exception as e:
            print(f"❌ Error processing alert queue: {e}")
        finally:
            self.processing_alerts = False
    
    def get_alert_statistics(self) -> dict:
        """Get alert processing statistics"""
        return {
            "queued_alerts": len(self.alert_queue),
            "processing": self.processing_alerts,
            "backend_url": self.backend_url
        }
