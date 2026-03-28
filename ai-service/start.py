#!/usr/bin/env python3
"""
Quick start script for the Lightweight AI Workplace Monitor
"""

import os
import sys
import subprocess

def check_python_version():
    """Check Python version"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required")
        return False
    print(f"✅ Python {sys.version.split()[0]} detected")
    return True

def install_dependencies():
    """Install required dependencies"""
    print("📦 Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def start_service():
    """Start the AI service"""
    print("🚀 Starting AI Workplace Monitor Service...")
    try:
        from app.main import app
        import uvicorn
        
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=False,
            log_level="info"
        )
    except Exception as e:
        print(f"❌ Failed to start service: {e}")
        return False

def main():
    """Main function"""
    print("🤖 Lightweight AI Workplace Monitor Setup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        return
    
    # Install dependencies
    if not install_dependencies():
        return
    
    # Start service
    start_service()

if __name__ == "__main__":
    main()
