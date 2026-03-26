import cv2
import numpy as np
import base64

def draw_detection_overlay(frame: np.ndarray, detections: list) -> np.ndarray:
    """Draw bounding boxes, names, and status badges on the frame"""
    for det in detections:
        bbox = det['bbox'] # {x, y, w, h}
        name = det.get('name', 'Unknown')
        status = det.get('status', 'active')
        is_known = name != 'Unknown'
        
        # Draw bounding box
        color = (255, 100, 0) if is_known else (0, 0, 255) # Blue for known, Red for unknown
        x, y, w, h = int(bbox['x']), int(bbox['y']), int(bbox['w']), int(bbox['h'])
        cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
        
        # Draw name label
        label = f"{name} ({det.get('confidence', 0):.2f})"
        (label_width, label_height), baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(frame, (x, y - label_height - 10), (x + label_width, y), color, -1)
        cv2.putText(frame, label, (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        # Draw status badge
        status_colors = {
            "active": (0, 255, 0),    # Green
            "idle": (0, 255, 255),    # Yellow
            "sleeping": (0, 0, 255)   # Red
        }
        badge_color = status_colors.get(status, (255, 255, 255))
        cv2.circle(frame, (x + 10, y + 15), 5, badge_color, -1)
        cv2.putText(frame, status.upper(), (x + 20, y + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
        
    return frame

def frame_to_base64(frame: np.ndarray) -> str:
    """Encode OpenCV frame as JPEG base64 string"""
    _, buffer = cv2.imencode('.jpg', frame)
    jpg_as_text = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{jpg_as_text}"