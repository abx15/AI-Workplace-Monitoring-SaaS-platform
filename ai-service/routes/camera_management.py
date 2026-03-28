from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Dict, Any, Optional
import asyncio
from datetime import datetime

from services.camera_manager import CameraManager

router = APIRouter(prefix="/api/cameras", tags=["camera management"])

# Initialize camera manager
camera_manager = CameraManager()

@router.get("/scan")
async def scan_all_cameras():
    """Scan for all available cameras"""
    try:
        cameras = camera_manager.scan_cameras()
        
        return {
            "success": True,
            "message": f"Found {len(cameras)} cameras",
            "cameras": cameras,
            "system_info": camera_manager.system_info,
            "scan_timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Error scanning cameras: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to scan cameras: {str(e)}")

@router.get("/list")
async def list_available_cameras():
    """List all available cameras with their status"""
    try:
        cameras = camera_manager.available_cameras
        active_cameras = camera_manager.active_cameras
        
        camera_list = []
        
        # Add available cameras
        for camera in cameras:
            camera_id = camera["id"]
            is_active = str(camera_id) in active_cameras
            
            camera_info = {
                "id": camera["id"],
                "name": camera["name"],
                "available": camera["available"],
                "active": is_active,
                "resolution": camera["resolution"],
                "fps": camera["fps"],
                "backend": camera["backend"],
                "format": camera["format"],
                "permissions": camera["permissions"]
            }
            
            if is_active:
                session_info = active_cameras[str(camera_id)]
                camera_info.update({
                    "session_id": session_info["session_id"],
                    "access_granted_at": session_info["access_granted_at"],
                    "uptime_seconds": (datetime.utcnow() - datetime.fromisoformat(session_info["access_granted_at"])).total_seconds(),
                    "settings": camera_manager.camera_settings.get(str(camera_id), {})
                })
            
            camera_list.append(camera_info)
        
        return {
            "success": True,
            "cameras": camera_list,
            "total_available": len(cameras),
            "total_active": len(active_cameras),
            "system_info": camera_manager.system_info
        }
        
    except Exception as e:
        print(f"❌ Error listing cameras: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list cameras: {str(e)}")

@router.post("/request_access/{camera_id}")
async def request_camera_access(camera_id: int, request: Dict):
    """Request access to specific camera"""
    try:
        result = camera_manager.request_camera_access(camera_id)
        
        if result["success"]:
            # Start background monitoring if access granted
            background_tasks = BackgroundTasks()
            background_tasks.add_task(
                monitor_camera_session,
                camera_id,
                result["session_id"]
            )
        
        return result
        
    except Exception as e:
        print(f"❌ Error requesting camera access: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to request camera access: {str(e)}")

@router.post("/release_access/{camera_id}")
async def release_camera_access(camera_id: int, request: Dict):
    """Release access to specific camera"""
    try:
        session_id = request.get("session_id")
        if not session_id:
            raise HTTPException(status_code=400, detail="Session ID is required")
        
        result = camera_manager.release_camera_access(camera_id, session_id)
        return result
        
    except Exception as e:
        print(f"❌ Error releasing camera access: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to release camera access: {str(e)}")

@router.get("/status/{camera_id}")
async def get_camera_status(camera_id: int):
    """Get detailed status of specific camera"""
    try:
        status = camera_manager.get_camera_status(camera_id)
        return status
        
    except Exception as e:
        print(f"❌ Error getting camera status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get camera status: {str(e)}")

@router.post("/update_settings/{camera_id}")
async def update_camera_settings(camera_id: int, request: Dict):
    """Update settings for active camera"""
    try:
        session_id = request.get("session_id")
        settings = request.get("settings", {})
        
        if not session_id:
            raise HTTPException(status_code=400, detail="Session ID is required")
        
        result = camera_manager.update_camera_settings(camera_id, settings, session_id)
        return result
        
    except Exception as e:
        print(f"❌ Error updating camera settings: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update camera settings: {str(e)}")

@router.post("/grant_permission/{camera_id}")
async def grant_camera_permission(camera_id: int, request: Dict):
    """Grant specific permission to camera"""
    try:
        session_id = request.get("session_id")
        permission = request.get("permission")
        
        if not session_id or not permission:
            raise HTTPException(status_code=400, detail="Session ID and permission are required")
        
        result = camera_manager.grant_permission(camera_id, permission, session_id)
        return result
        
    except Exception as e:
        print(f"❌ Error granting camera permission: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to grant permission: {str(e)}")

@router.post("/revoke_permission/{camera_id}")
async def revoke_camera_permission(camera_id: int, request: Dict):
    """Revoke specific permission from camera"""
    try:
        session_id = request.get("session_id")
        permission = request.get("permission")
        
        if not session_id or not permission:
            raise HTTPException(status_code=400, detail="Session ID and permission are required")
        
        result = camera_manager.revoke_permission(camera_id, permission, session_id)
        return result
        
    except Exception as e:
        print(f"❌ Error revoking camera permission: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to revoke permission: {str(e)}")

@router.get("/test/{camera_id}")
async def test_camera_functionality(camera_id: int):
    """Test comprehensive camera functionality"""
    try:
        test_results = camera_manager.test_camera_functionality(camera_id)
        return test_results
        
    except Exception as e:
        print(f"❌ Error testing camera: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to test camera: {str(e)}")

@router.get("/system_info")
async def get_system_camera_info():
    """Get comprehensive system camera information"""
    try:
        info = camera_manager.get_system_camera_info()
        return info
        
    except Exception as e:
        print(f"❌ Error getting system info: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get system info: {str(e)}")

@router.post("/batch_access")
async def request_multiple_camera_access(request: Dict):
    """Request access to multiple cameras"""
    try:
        camera_ids = request.get("camera_ids", [])
        settings = request.get("settings", {})
        
        if not camera_ids:
            raise HTTPException(status_code=400, detail="Camera IDs are required")
        
        results = []
        for camera_id in camera_ids:
            result = camera_manager.request_camera_access(camera_id)
            results.append(result)
        
        successful_accesses = [r for r in results if r["success"]]
        
        return {
            "success": len(successful_accesses) > 0,
            "message": f"Access granted to {len(successful_accesses)}/{len(camera_ids)} cameras",
            "results": results,
            "successful_count": len(successful_accesses),
            "requested_count": len(camera_ids)
        }
        
    except Exception as e:
        print(f"❌ Error requesting multiple camera access: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to request multiple camera access: {str(e)}")

@router.post("/release_all")
async def release_all_camera_access():
    """Release access to all cameras"""
    try:
        camera_ids = list(camera_manager.active_cameras.keys())
        results = []
        
        for camera_id in camera_ids:
            camera_info = camera_manager.active_cameras[camera_id]
            result = camera_manager.release_camera_access(camera_id, camera_info["session_id"])
            results.append(result)
        
        successful_releases = [r for r in results if r["success"]]
        
        return {
            "success": len(successful_releases) > 0,
            "message": f"Released {len(successful_releases)}/{len(camera_ids)} cameras",
            "results": results,
            "released_count": len(successful_releases),
            "total_count": len(camera_ids)
        }
        
    except Exception as e:
        print(f"❌ Error releasing all cameras: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to release all cameras: {str(e)}")

async def monitor_camera_session(camera_id: int, session_id: str):
    """Background task to monitor active camera session"""
    try:
        while str(camera_id) in camera_manager.active_cameras:
            await asyncio.sleep(30)  # Check every 30 seconds
            
            # Check if session is still valid
            camera_status = camera_manager.get_camera_status(camera_id)
            if not camera_status.get("active"):
                print(f"📹 Camera {camera_id} session ended")
                break
            
            # Log session activity (in real implementation, this would store to database)
            print(f"📹 Camera {camera_id} session active - Uptime: {camera_status.get('uptime_seconds', 0)}s")
            
    except Exception as e:
        print(f"❌ Error monitoring camera session: {e}")
