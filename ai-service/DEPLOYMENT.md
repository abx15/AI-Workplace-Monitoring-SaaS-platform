# Lightweight AI Service Deployment Guide

## Local Development

```bash
# Navigate to ai-service directory
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the service
python app/main.py
```

## Render Deployment

### 1. Push to GitHub
```bash
# Add all changes
git add .

# Commit changes
git commit -m "Redesign AI service for lightweight CPU-only deployment"

# Push to GitHub
git push origin main
```

### 2. Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `ai-service` directory
5. Use these settings:
   - **Name**: `ai-workplace-monitor`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app/main.py`
   - **Health Check Path**: `/health`

### 3. Environment Variables
Set these in Render dashboard:
- `AI_SERVICE_PORT`: `8000`
- `AI_SERVICE_HOST`: `0.0.0.0`
- `FRONTEND_URL`: `https://your-frontend-domain.com`
- `BACKEND_URL`: `https://your-backend-domain.com`

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Face Detection & Recognition
- `POST /api/v1/face/detect` - Detect faces in image
- `POST /api/v1/face/recognize` - Recognize faces
- `POST /api/v1/face/register` - Register new face
- `GET /api/v1/face/employees` - Get registered employees

### Detection & Analysis
- `POST /api/v1/detection/analyze-frame` - Complete frame analysis
- `POST /api/v1/detection/detect-faces` - Face detection only
- `POST /api/v1/detection/register-face` - Register face
- `GET /api/v1/detection/service-status` - Service status

### Monitoring
- `POST /api/v1/monitoring/start-session` - Start monitoring session
- `POST /api/v1/monitoring/process-frame` - Process monitoring frame
- `GET /api/v1/monitoring/session/{id}/status` - Get session status
- `POST /api/v1/monitoring/stop-session` - Stop session
- `GET /api/v1/monitoring/alerts` - Get recent alerts
- `GET /api/v1/monitoring/statistics` - Get statistics

## Performance Optimization

### Memory Usage
- Uses `opencv-python-headless` (no GUI dependencies)
- MediaPipe models are CPU-optimized
- In-memory storage for face embeddings
- Automatic cleanup of old tracking data

### CPU Optimization
- No GPU dependencies
- Async FastAPI endpoints
- Simple heuristics instead of heavy ML models
- Efficient image processing with NumPy

## Testing the Service

### Test Face Detection
```bash
curl -X POST "http://localhost:8000/api/v1/face/detect" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_image.jpg"
```

### Test Frame Analysis
```bash
curl -X POST "http://localhost:8000/api/v1/detection/analyze-frame" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_image.jpg" \
  -F "analyze_faces=true" \
  -F "analyze_behavior=true" \
  -F "enable_tracking=true"
```

### Start Monitoring Session
```bash
curl -X POST "http://localhost:8000/api/v1/monitoring/start-session" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "session_id=session_123&camera_id=camera_1&sensitivity=medium"
```

## Troubleshooting

### Common Issues
1. **Build fails on Render**: Check that all heavy dependencies are removed
2. **Out of memory**: Reduce concurrent processing or add memory limits
3. **Slow processing**: Optimize image size before sending to API

### Logs
```bash
# Check Render logs
render logs

# Local debugging
python app/main.py --log-level debug
```

## Migration from Old System

### Key Changes
1. **Removed**: `torch`, `face-recognition`, `dlib`, `ultralytics`
2. **Added**: `mediapipe`, `opencv-python-headless`
3. **Architecture**: Moved to `app/` directory structure
4. **API**: New v1 endpoints with consistent structure

### Data Migration
If you have existing face data, you'll need to re-register faces as the embedding format has changed.

## Scaling

### Horizontal Scaling
- The service is stateless (except in-memory face storage)
- Can run multiple instances behind a load balancer
- Consider Redis for shared face storage in production

### Performance Monitoring
- Monitor response times via `/health` endpoint
- Track memory usage and CPU utilization
- Set up alerts for high error rates
