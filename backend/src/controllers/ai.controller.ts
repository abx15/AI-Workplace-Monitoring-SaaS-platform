import { Request, Response } from 'express';
import { Alert } from '../models/Alert';
import { Camera } from '../models/Camera';
import { User } from '../models/User';
import { AILog } from '../models/mongo/aiLog.model';
import AIService from '../services/ai.service';

// AI Controller for handling AI service integration
export const receiveAIAlert = async (req: Request, res: Response) => {
  try {
    const {
      cameraId,
      employeeId,
      alertType,
      severity,
      message,
      metadata,
      confidence,
      timestamp
    } = req.body;

    const companyId = req.user?.companyId; // From auth middleware

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID required'
      });
    }

    console.log(`🤖 Received AI Alert: ${alertType} - ${message}`);

    // Verify camera belongs to company
    const camera = await Camera.findOne({ _id: cameraId, companyId });
    if (!camera) {
      return res.status(404).json({
        success: false,
        message: 'Camera not found'
      });
    }

    // Verify employee if provided
    if (employeeId) {
      const employee = await User.findOne({ _id: employeeId, companyId });
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
    }

    // Create alert from AI service
    const alert = new Alert({
      companyId,
      cameraId,
      employeeId,
      alertType,
      severity,
      message,
      metadata: metadata || {},
      status: 'pending'
    });

    await alert.save();

    // Log AI processing
    const aiLog = new AILog({
      cameraId,
      employeeId,
      alertType,
      severity,
      confidence: confidence || 0.0,
      processingTime: new Date(timestamp),
      metadata: metadata || {}
    });

    await aiLog.save();

    console.log(`✅ AI Alert saved: ${alertType} - ${message}`);

    res.status(201).json({
      success: true,
      message: 'AI alert received and saved',
      data: {
        alertId: alert._id,
        alertType,
        severity,
        message
      }
    });

  } catch (error: any) {
    console.error('AI Alert processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get AI statistics
export const getAIStatistics = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId; // From auth middleware
    const { timeframe = '7d' } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID required'
      });
    }

    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const stats = await AIService.getAIStatistics(companyId as string, timeframe as string);

    const result = stats || {
      totalProcessings: 0,
      alertsGenerated: 0,
      averageConfidence: 0,
      highSeverityAlerts: 0,
      mediumSeverityAlerts: 0,
      lowSeverityAlerts: 0
    };

    res.json({
      success: true,
      data: {
        timeframe,
        totalProcessings: result.totalProcessings,
        alertsGenerated: result.alertsGenerated,
        averageConfidence: result.averageConfidence,
        highSeverityAlerts: result.highSeverityAlerts,
        mediumSeverityAlerts: result.mediumSeverityAlerts,
        lowSeverityAlerts: result.lowSeverityAlerts,
        processing: {
          queueSize: 0,
          avgProcessingTime: '120ms',
          successRate: 0.98
        },
        uptime: '99.9%'
      }
    });

  } catch (error: any) {
    console.error('AI Statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// AI Health check
export const getAIHealth = async (req: Request, res: Response) => {
  try {
    const health = await AIService.getAIHealth();

    res.json({
      success: true,
      data: health
    });

  } catch (error: any) {
    console.error('AI Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'AI service unavailable'
    });
  }
};

// Process frame from camera
export const processFrame = async (req: Request, res: Response) => {
  try {
    const { cameraId, frameData } = req.body;
    const companyId = req.user?.companyId; // From auth middleware

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID required'
      });
    }

    if (!cameraId || !frameData) {
      return res.status(400).json({
        success: false,
        message: 'Camera ID and frame data are required'
      });
    }

    // Process frame using AI service
    const analysis = await AIService.processCameraFrame(cameraId, frameData);

    res.json({
      success: true,
      data: analysis
    });

  } catch (error: any) {
    console.error('Frame processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Frame processing failed'
    });
  }
};

// Analyze employee behavior
export const analyzeBehavior = async (req: Request, res: Response) => {
  try {
    const { cameraId, employeeId } = req.params;
    const { frameData } = req.body;

    if (!frameData) {
      return res.status(400).json({
        success: false,
        message: 'Frame data is required'
      });
    }

    const analysis = await AIService.analyzeEmployeeBehavior(cameraId, employeeId, frameData);

    res.json({
      success: true,
      data: analysis
    });

  } catch (error: any) {
    console.error('Behavior analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Analyze video
export const analyzeVideo = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { videoUrl, cameraId } = req.body;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID required'
      });
    }

    if (!videoUrl || !cameraId) {
      return res.status(400).json({
        success: false,
        message: 'Video URL and camera ID are required'
      });
    }

    const result = await AIService.analyzeVideo(videoUrl, cameraId, companyId);

    res.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Video analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get video analysis status
export const getVideoAnalysisStatus = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    const status = await AIService.getVideoAnalysisStatus(jobId);

    res.json({
      success: true,
      data: status
    });

  } catch (error: any) {
    console.error('Get video analysis status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
