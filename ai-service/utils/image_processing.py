import cv2
import numpy as np
import base64
from typing import Tuple, Optional
import io
from PIL import Image

class ImageProcessor:
    @staticmethod
    def base64_to_frame(base64_string: str) -> Optional[np.ndarray]:
        """Convert base64 string to numpy array"""
        try:
            # Remove data URL prefix if present
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            # Decode base64
            decoded_data = base64.b64decode(base64_string)
            
            # Convert to numpy array
            nparr = np.frombuffer(decoded_data, np.uint8)
            
            # Decode to image
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            return frame
            
        except Exception as e:
            print(f"❌ Error converting base64 to frame: {e}")
            return None
    
    @staticmethod
    def frame_to_base64(frame: np.ndarray, quality: int = 85) -> str:
        """Convert numpy array frame to base64 string"""
        try:
            # Encode frame to JPEG
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, quality])
            
            # Convert to base64
            jpg_as_text = base64.b64encode(buffer)
            
            return jpg_as_text.decode('utf-8')
            
        except Exception as e:
            print(f"❌ Error converting frame to base64: {e}")
            return ""
    
    @staticmethod
    def resize_frame(frame: np.ndarray, target_size: Tuple[int, int] = (640, 640)) -> np.ndarray:
        """Resize frame while maintaining aspect ratio"""
        try:
            h, w = frame.shape[:2]
            target_w, target_h = target_size
            
            # Calculate aspect ratio
            aspect = w / h
            
            if aspect > target_w / target_h:
                # Width is the limiting factor
                new_w = target_w
                new_h = int(target_w / aspect)
            else:
                # Height is the limiting factor
                new_h = target_h
                new_w = int(target_h * aspect)
            
            resized = cv2.resize(frame, (new_w, new_h))
            return resized
            
        except Exception as e:
            print(f"❌ Error resizing frame: {e}")
            return frame
    
    @staticmethod
    def enhance_frame(frame: np.ndarray) -> np.ndarray:
        """Enhance frame quality for better detection"""
        try:
            # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
            lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
            lab[:, :, 0] = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8)).apply(lab[:, :, 0])
            enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
            
            # Apply slight blur to reduce noise
            enhanced = cv2.bilateralFilter(enhanced, 5, 50, 50)
            
            return enhanced
            
        except Exception as e:
            print(f"❌ Error enhancing frame: {e}")
            return frame
    
    @staticmethod
    def draw_detections(frame: np.ndarray, detections: list) -> np.ndarray:
        """Draw detection boxes and labels on frame"""
        try:
            annotated_frame = frame.copy()
            
            for detection in detections:
                bbox = detection.get('bbox', {})
                x = int(bbox.get('x', 0))
                y = int(bbox.get('y', 0))
                w = int(bbox.get('width', 0))
                h = int(bbox.get('height', 0))
                
                confidence = detection.get('confidence', 0)
                name = detection.get('name', 'Unknown')
                status = detection.get('status', 'active')
                
                # Choose color based on status
                if status == 'sleeping':
                    color = (0, 0, 255)  # Red
                elif status == 'idle':
                    color = (0, 255, 255)  # Yellow
                else:
                    color = (0, 255, 0)  # Green
                
                # Draw bounding box
                cv2.rectangle(annotated_frame, (x, y), (x + w, y + h), color, 2)
                
                # Draw label background
                label = f"{name} ({confidence:.2f}) - {status}"
                label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)[0]
                cv2.rectangle(annotated_frame, (x, y - 25), (x + label_size[0], y), color, -1)
                
                # Draw label text
                cv2.putText(annotated_frame, label, (x, y - 5), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
            
            return annotated_frame
            
        except Exception as e:
            print(f"❌ Error drawing detections: {e}")
            return frame
    
    @staticmethod
    def calculate_frame_quality(frame: np.ndarray) -> dict:
        """Calculate frame quality metrics"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Calculate blur metric (Laplacian variance)
            blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            # Calculate brightness
            brightness = np.mean(gray)
            
            # Calculate contrast
            contrast = np.std(gray)
            
            # Calculate noise level
            noise = np.mean(cv2.absdiff(gray, cv2.GaussianBlur(gray, (5, 5), 0)))
            
            return {
                "blur_score": float(blur_score),
                "brightness": float(brightness),
                "contrast": float(contrast),
                "noise_level": float(noise),
                "quality_score": min(1.0, blur_score / 100.0)  # Normalized quality score
            }
            
        except Exception as e:
            print(f"❌ Error calculating frame quality: {e}")
            return {
                "blur_score": 0.0,
                "brightness": 0.0,
                "contrast": 0.0,
                "noise_level": 0.0,
                "quality_score": 0.0
            }
