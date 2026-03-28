#!/usr/bin/env python3
"""
Test script for the Lightweight AI Workplace Monitor
"""

import requests
import json
import time
import os

BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Service is healthy: {data['status']}")
            print(f"   Face Detection: {data['services']['face_detection']['loaded']}")
            print(f"   Active Tracks: {data['services']['person_tracking']['active_tracks']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_root_endpoint():
    """Test root endpoint"""
    print("🔍 Testing root endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Service: {data['service']} v{data['version']}")
            print(f"   Features: {', '.join(data['features'][:3])}...")
            return True
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
        return False

def test_face_detection():
    """Test face detection service"""
    print("🔍 Testing face detection service...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/detection/service-status")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Face detection service: {data['face_detection']['model_loaded']}")
            print(f"   Model: {data['face_detection']['model_type']}")
            print(f"   CPU Optimized: {data['face_detection']['cpu_optimized']}")
            return True
        else:
            print(f"❌ Face detection service failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Face detection service error: {e}")
        return False

def test_monitoring_stats():
    """Test monitoring statistics"""
    print("🔍 Testing monitoring statistics...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/monitoring/statistics")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Monitoring stats available")
            print(f"   Active Sessions: {data['statistics']['active_sessions']}")
            print(f"   Registered Faces: {data['statistics']['registered_faces']}")
            return True
        else:
            print(f"❌ Monitoring stats failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Monitoring stats error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Lightweight AI Workplace Monitor")
    print("=" * 50)
    
    # Wait a moment for service to start
    print("⏳ Waiting for service to start...")
    time.sleep(3)
    
    tests = [
        test_root_endpoint,
        test_health_check,
        test_face_detection,
        test_monitoring_stats
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Service is ready for deployment.")
    else:
        print("⚠️ Some tests failed. Check the service logs.")

if __name__ == "__main__":
    main()
