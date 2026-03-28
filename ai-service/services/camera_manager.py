import cv2
import numpy as np
import threading
import time
import json
import os
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
import subprocess
import platform

class CameraManager:
    def __init__(self):
        self.available_cameras = []
        self.active_cameras = {}
        self.camera_permissions = {}
        self.camera_locks = {}
        self.camera_settings = {}
        self.recording_sessions = {}
        self.system_info = self._get_system_info()
        
    def _get_system_info(self) -> Dict:
        """Get system camera information"""
        try:
            system = platform.system()
            if system == "Windows":
                # Use DirectShow for Windows
                return {
                    "system": "Windows",
                    "backend": "DirectShow",
                    "max_cameras": 10,
                    "api_type": "cv2.CAP_DSHOW"
                }
            elif system == "Linux":
                # Use V4L2 for Linux
                return {
                    "system": "Linux", 
                    "backend": "V4L2",
                    "max_cameras": 20,
                    "api_type": "cv2.CAP_V4L2"
                }
            elif system == "Darwin":
                # Use AVFoundation for macOS
                return {
                    "system": "macOS",
                    "backend": "AVFoundation", 
                    "max_cameras": 8,
                    "api_type": "cv2.CAP_AVFOUNDATION"
                }
            else:
                return {
                    "system": "Unknown",
                    "backend": "Auto",
                    "max_cameras": 10,
                    "api_type": "cv2.CAP_ANY"
                }
        except Exception as e:
            print(f"❌ Error getting system info: {e}")
            return {"system": "Unknown", "backend": "Auto", "max_cameras": 10}
    
    def scan_cameras(self) -> List[Dict]:
        """Scan for all available cameras"""
        try:
            cameras = []
            max_cameras = self.system_info["max_cameras"]
            
            print(f"🔍 Scanning for cameras (max: {max_cameras})...")
            
            for camera_id in range(max_cameras):
                camera_info = self._test_camera_access(camera_id)
                cameras.append(camera_info)
                
                # Add small delay between camera tests
                time.sleep(0.1)
            
            # Filter available cameras
            available_cameras = [cam for cam in cameras if cam["available"]]
            
            self.available_cameras = available_cameras
            print(f"✅ Found {len(available_cameras)} available cameras")
            
            return available_cameras
            
        except Exception as e:
            print(f"❌ Error scanning cameras: {e}")
            return []
    
    def _test_camera_access(self, camera_id: int) -> Dict:
        """Test if camera can be accessed and get its properties"""
        camera_info = {
            "id": camera_id,
            "name": f"Camera {camera_id}",
            "available": False,
            "resolution": "Unknown",
            "fps": 0,
            "backend": self.system_info["backend"],
            "format": "Unknown",
            "permissions": {
                "read": False,
                "write": False,
                "record": False
            },
            "error": None,
            "test_timestamp": datetime.utcnow().isoformat()
        }
        
        try:
            # Try to open camera
            cap = cv2.VideoCapture(camera_id)
            
            if not cap.isOpened():
                camera_info["error"] = "Cannot open camera"
                return camera_info
            
            # Test camera properties
            camera_info["available"] = True
            
            # Get resolution
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            camera_info["resolution"] = f"{width}x{height}"
            
            # Get FPS
            fps = int(cap.get(cv2.CAP_PROP_FPS))
            camera_info["fps"] = fps
            
            # Get format
            fourcc = int(cap.get(cv2.CAP_PROP_FOURCC))
            format_str = f"{chr(fourcc & 0xFF)}{chr((fourcc >> 8) & 0xFF)}{chr((fourcc >> 16) & 0xFF)}{chr((fourcc >> 24) & 0xFF)}"
            camera_info["format"] = format_str
            
            # Test reading frames
            ret, frame = cap.read()
            if ret and frame is not None:
                camera_info["permissions"]["read"] = True
                
                # Test frame properties
                if frame.size > 0:
                    camera_info["permissions"]["record"] = True
                
                # Test writing (create test file)
                test_file = f"test_camera_{camera_id}.jpg"
                success = cv2.imwrite(test_file, frame)
                if success and os.path.exists(test_file):
                    camera_info["permissions"]["write"] = True
                    os.remove(test_file)  # Clean up test file
            
            # Get additional camera info
            try:
                # Get camera backend name
                backend_name = cap.getBackendName()
                camera_info["backend_name"] = backend_name
                
                # Get camera API preference
                api_preference = cap.get(cv2.CAP_PROP_API_PREFERENCE)
                camera_info["api_preference"] = api_preference
                
            except:
                pass
            
            cap.release()
            
        except Exception as e:
            camera_info["error"] = str(e)
            print(f"❌ Error testing camera {camera_id}: {e}")
        
        return camera_info
    
    def request_camera_access(self, camera_id: int) -> Dict:
        """Request access to specific camera"""
        try:
            # Check if camera exists
            if camera_id >= self.system_info["max_cameras"]:
                return {
                    "success": False,
                    "error": f"Camera ID {camera_id} out of range (0-{self.system_info['max_cameras']-1})"
                }
            
            # Test camera access
            camera_info = self._test_camera_access(camera_id)
            
            if not camera_info["available"]:
                return {
                    "success": False,
                    "error": f"Camera {camera_id} not available or accessible"
                }
            
            # Check permissions
            required_permissions = ["read", "record"]
            missing_permissions = []
            
            for perm in required_permissions:
                if not camera_info["permissions"].get(perm, False):
                    missing_permissions.append(perm)
            
            if missing_permissions:
                return {
                    "success": False,
                    "error": f"Missing permissions: {', '.join(missing_permissions)}",
                    "camera_info": camera_info
                }
            
            # Store camera access
            self.active_cameras[str(camera_id)] = {
                "camera_info": camera_info,
                "access_granted_at": datetime.utcnow().isoformat(),
                "session_id": f"session_{int(time.time())}",
                "permissions": camera_info["permissions"]
            }
            
            print(f"✅ Camera {camera_id} access granted")
            
            return {
                "success": True,
                "message": f"Camera {camera_id} access granted",
                "camera_info": camera_info,
                "session_id": self.active_cameras[str(camera_id)]["session_id"]
            }
            
        except Exception as e:
            print(f"❌ Error requesting camera access: {e}")
            return {"success": False, "error": str(e)}
    
    def release_camera_access(self, camera_id: int, session_id: str) -> Dict:
        """Release access to specific camera"""
        try:
            camera_key = str(camera_id)
            
            if camera_key not in self.active_cameras:
                return {
                    "success": False,
                    "error": f"Camera {camera_id} not currently active"
                }
            
            session_info = self.active_cameras[camera_key]
            if session_info["session_id"] != session_id:
                return {
                    "success": False,
                    "error": "Invalid session ID"
                }
            
            # Release camera
            del self.active_cameras[camera_key]
            
            print(f"🔓 Camera {camera_id} access released")
            
            return {
                "success": True,
                "message": f"Camera {camera_id} access released",
                "released_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Error releasing camera access: {e}")
            return {"success": False, "error": str(e)}
    
    def get_camera_status(self, camera_id: int) -> Dict:
        """Get status of specific camera"""
        try:
            camera_key = str(camera_id)
            
            if camera_key in self.active_cameras:
                session_info = self.active_cameras[camera_key]
                return {
                    "camera_id": camera_id,
                    "active": True,
                    "session_id": session_info["session_id"],
                    "access_granted_at": session_info["access_granted_at"],
                    "camera_info": session_info["camera_info"],
                    "uptime_seconds": (datetime.utcnow() - datetime.fromisoformat(session_info["access_granted_at"])).total_seconds()
                }
            else:
                # Check if camera is available but not active
                for camera in self.available_cameras:
                    if camera["id"] == camera_id:
                        return {
                            "camera_id": camera_id,
                            "active": False,
                            "available": True,
                            "camera_info": camera
                        }
                
                return {
                    "camera_id": camera_id,
                    "active": False,
                    "available": False,
                    "error": "Camera not found or not available"
                }
                
        except Exception as e:
            print(f"❌ Error getting camera status: {e}")
            return {"success": False, "error": str(e)}
    
    def update_camera_settings(self, camera_id: int, settings: Dict, session_id: str) -> Dict:
        """Update settings for active camera"""
        try:
            camera_key = str(camera_id)
            
            if camera_key not in self.active_cameras:
                return {
                    "success": False,
                    "error": f"Camera {camera_id} not active"
                }
            
            session_info = self.active_cameras[camera_key]
            if session_info["session_id"] != session_id:
                return {
                    "success": False,
                    "error": "Invalid session ID"
                }
            
            # Update settings
            if "resolution" in settings:
                # Validate resolution format
                resolution = settings["resolution"]
                if isinstance(resolution, str) and "x" in resolution:
                    try:
                        width, height = map(int, resolution.split("x"))
                        if width > 0 and height > 0:
                            self.camera_settings[camera_key] = settings
                            session_info["settings"] = settings
                    except:
                        return {"success": False, "error": "Invalid resolution format"}
                else:
                    return {"success": False, "error": "Invalid resolution format"}
            
            # Update other settings
            allowed_settings = ["fps", "brightness", "contrast", "saturation", "exposure"]
            for setting in allowed_settings:
                if setting in settings:
                    self.camera_settings[camera_key] = settings
                    session_info["settings"] = settings
            
            return {
                "success": True,
                "message": f"Camera {camera_id} settings updated",
                "settings": self.camera_settings.get(camera_key, {})
            }
            
        except Exception as e:
            print(f"❌ Error updating camera settings: {e}")
            return {"success": False, "error": str(e)}
    
    def grant_permission(self, camera_id: int, permission: str, session_id: str) -> Dict:
        """Grant specific permission to camera"""
        try:
            camera_key = str(camera_id)
            
            if camera_key not in self.active_cameras:
                return {
                    "success": False,
                    "error": f"Camera {camera_id} not active"
                }
            
            session_info = self.active_cameras[camera_key]
            if session_info["session_id"] != session_id:
                return {
                    "success": False,
                    "error": "Invalid session ID"
                }
            
            valid_permissions = ["read", "record", "write", "admin"]
            if permission not in valid_permissions:
                return {
                    "success": False,
                    "error": f"Invalid permission: {permission}"
                }
            
            # Grant permission
            if permission not in session_info["permissions"]:
                session_info["permissions"][permission] = True
                self.active_cameras[camera_key] = session_info
            
            return {
                "success": True,
                "message": f"Permission '{permission}' granted for camera {camera_id}",
                "permissions": session_info["permissions"]
            }
            
        except Exception as e:
            print(f"❌ Error granting permission: {e}")
            return {"success": False, "error": str(e)}
    
    def revoke_permission(self, camera_id: int, permission: str, session_id: str) -> Dict:
        """Revoke specific permission from camera"""
        try:
            camera_key = str(camera_id)
            
            if camera_key not in self.active_cameras:
                return {
                    "success": False,
                    "error": f"Camera {camera_id} not active"
                }
            
            session_info = self.active_cameras[camera_key]
            if session_info["session_id"] != session_id:
                return {
                    "success": False,
                    "error": "Invalid session ID"
                }
            
            valid_permissions = ["read", "record", "write", "admin"]
            if permission not in valid_permissions:
                return {
                    "success": False,
                    "error": f"Invalid permission: {permission}"
                }
            
            # Revoke permission
            if permission in session_info["permissions"]:
                session_info["permissions"][permission] = False
                self.active_cameras[camera_key] = session_info
            
            return {
                "success": True,
                "message": f"Permission '{permission}' revoked for camera {camera_id}",
                "permissions": session_info["permissions"]
            }
            
        except Exception as e:
            print(f"❌ Error revoking permission: {e}")
            return {"success": False, "error": str(e)}
    
    def get_system_camera_info(self) -> Dict:
        """Get comprehensive system camera information"""
        try:
            return {
                "system_info": self.system_info,
                "available_cameras": self.available_cameras,
                "active_cameras": len(self.active_cameras),
                "camera_permissions": {
                    str(cam_id): info["permissions"] 
                    for cam_id, info in self.active_cameras.items()
                },
                "camera_settings": self.camera_settings,
                "scan_timestamp": datetime.utcnow().isoformat(),
                "total_cameras_tested": self.system_info["max_cameras"]
            }
        except Exception as e:
            print(f"❌ Error getting system camera info: {e}")
            return {"error": str(e)}
    
    def test_camera_functionality(self, camera_id: int) -> Dict:
        """Comprehensive camera functionality test"""
        try:
            cap = cv2.VideoCapture(camera_id)
            
            if not cap.isOpened():
                return {
                    "success": False,
                    "error": "Cannot open camera",
                    "tests": {}
                }
            
            test_results = {
                "camera_id": camera_id,
                "test_timestamp": datetime.utcnow().isoformat(),
                "tests": {}
            }
            
            # Test 1: Frame capture
            ret, frame = cap.read()
            test_results["tests"]["frame_capture"] = {
                "success": ret and frame is not None,
                "details": "Frame captured successfully" if ret and frame is not None else "Failed to capture frame"
            }
            
            # Test 2: Resolution detection
            if ret and frame is not None:
                width, height = frame.shape[1], frame.shape[0]
                test_results["tests"]["resolution"] = {
                    "success": True,
                    "detected_resolution": f"{width}x{height}",
                    "actual_resolution": f"{width}x{height}"
                }
            else:
                test_results["tests"]["resolution"] = {
                    "success": False,
                    "error": "Cannot detect resolution"
                }
            
            # Test 3: FPS detection
            fps = cap.get(cv2.CAP_PROP_FPS)
            test_results["tests"]["fps"] = {
                "success": fps > 0,
                "detected_fps": fps,
                "details": f"FPS detected: {fps}" if fps > 0 else "No FPS detected"
            }
            
            # Test 4: Format detection
            fourcc = cap.get(cv2.CAP_PROP_FOURCC)
            format_str = f"{chr(fourcc & 0xFF)}{chr((fourcc >> 8) & 0xFF)}{chr((fourcc >> 16) & 0xFF)}{chr((fourcc >> 24) & 0xFF)}"
            test_results["tests"]["format"] = {
                "success": True,
                "detected_format": format_str,
                "fourcc": fourcc
            }
            
            # Test 5: Backend info
            backend_name = cap.getBackendName()
            test_results["tests"]["backend"] = {
                "success": True,
                "backend_name": backend_name
            }
            
            # Test 6: Auto-exposure
            auto_exposure = cap.get(cv2.CAP_PROP_AUTO_EXPOSURE)
            test_results["tests"]["auto_exposure"] = {
                "success": True,
                "auto_exposure": auto_exposure
            }
            
            cap.release()
            
            # Overall test result
            all_tests_passed = all(test["success"] for test in test_results["tests"].values())
            test_results["overall_success"] = all_tests_passed
            test_results["summary"] = "All tests passed" if all_tests_passed else "Some tests failed"
            
            return test_results
            
        except Exception as e:
            print(f"❌ Error testing camera functionality: {e}")
            return {
                "success": False,
                "error": str(e),
                "tests": {}
            }
