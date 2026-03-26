import cv2
import numpy as np
import base64

def decode_base64_image(base64_str: str) -> np.ndarray:
    """Decode base64 string to OpenCV BGR image"""
    try:
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
        
        image_data = base64.b64decode(base64_str)
        np_arr = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        return frame
    except Exception as e:
        print(f"Error decoding base64 image: {e}")
        return None

def resize_frame(frame: np.ndarray, max_width: int = 1280) -> np.ndarray:
    """Resize frame while maintaining aspect ratio"""
    height, width = frame.shape[:2]
    if width <= max_width:
        return frame
    
    aspect_ratio = height / width
    new_width = max_width
    new_height = int(new_width * aspect_ratio)
    
    return cv2.resize(frame, (new_width, new_height))

def capture_rtsp_frame(rtsp_url: str) -> np.ndarray:
    """Capture a single frame from an RTSP stream"""
    cap = cv2.VideoCapture(rtsp_url)
    if not cap.isOpened():
        print(f"Error: Could not open RTSP stream at {rtsp_url}")
        return None
    
    success, frame = cap.read()
    cap.release()
    
    if not success:
        print(f"Error: Could not read frame from RTSP stream")
        return None
        
    return frame