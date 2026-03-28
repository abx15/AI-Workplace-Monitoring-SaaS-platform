import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  receiveAIAlert,
  getAIStatistics,
  getAIHealth,
  processFrame,
  analyzeBehavior,
  analyzeVideo,
  getVideoAnalysisStatus
} from '../controllers/ai.controller';

const router = Router();

// AI Alert endpoint - receives alerts from Python AI service
router.post('/alert', authMiddleware, receiveAIAlert);

// AI Statistics endpoint
router.get('/statistics', authMiddleware, getAIStatistics);

// AI Health check endpoint
router.get('/health', authMiddleware, getAIHealth);

// Process frame endpoint
router.post('/process-frame', authMiddleware, processFrame);

// Analyze specific employee behavior
router.post('/analyze/:cameraId/:employeeId', authMiddleware, analyzeBehavior);

// Analyze video
router.post('/analyze-video', authMiddleware, analyzeVideo);

// Get video analysis status
router.get('/video-status/:jobId', authMiddleware, getVideoAnalysisStatus);

export default router;
