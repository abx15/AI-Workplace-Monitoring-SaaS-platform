import { Request, Response } from 'express';
import { Alert } from '../models/Alert';
import { User } from '../models/User';
import { Camera } from '../models/Camera';

// Get all alerts for a company
export const getAlerts = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId; // From auth middleware
    const { page = 1, limit = 20, severity, isResolved, alertType } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID required'
      });
    }

    // Build query
    const query: any = { companyId };
    
    if (severity) query.severity = severity;
    if (isResolved !== undefined) query.isResolved = isResolved === 'true';
    if (alertType) query.alertType = alertType;

    const alerts = await Alert.find(query)
      .populate('employeeId', 'name email employeeId')
      .populate('cameraId', 'name location')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit))
      .select('-__v');

    const total = await Alert.countDocuments(query);

    res.json({
      success: true,
      data: {
        alerts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error: any) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get alert by ID
export const getAlertById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId; // From auth middleware

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID required'
      });
    }

    const alert = await Alert.findOne({ _id: id, companyId })
      .populate('employeeId', 'name email employeeId')
      .populate('cameraId', 'name location')
      .select('-__v');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: alert
    });

  } catch (error: any) {
    console.error('Get alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new alert
export const createAlert = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId; // From auth middleware
    const { 
      employeeId, 
      cameraId, 
      alertType, 
      severity = 'medium', 
      message, 
      metadata 
    } = req.body;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID required'
      });
    }

    if (!alertType || !message) {
      return res.status(400).json({
        success: false,
        message: 'Alert type and message are required'
      });
    }

    // Validate employee and camera belong to the company
    if (employeeId) {
      const employee = await User.findOne({ _id: employeeId, companyId });
      if (!employee) {
        return res.status(400).json({
          success: false,
          message: 'Employee not found'
        });
      }
    }

    if (cameraId) {
      const camera = await Camera.findOne({ _id: cameraId, companyId });
      if (!camera) {
        return res.status(400).json({
          success: false,
          message: 'Camera not found'
        });
      }
    }

    const alert = new Alert({
      companyId,
      employeeId,
      cameraId,
      alertType,
      severity,
      message,
      metadata
    });

    await alert.save();

    // Populate for response
    await alert.populate('employeeId', 'name email employeeId');
    await alert.populate('cameraId', 'name location');

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: alert
    });

  } catch (error: any) {
    console.error('Create alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Resolve alert
export const resolveAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId; // From auth middleware

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID required'
      });
    }

    const alert = await Alert.findOneAndUpdate(
      { _id: id, companyId },
      { 
        isResolved: true, 
        resolvedAt: new Date() 
      },
      { new: true }
    )
      .populate('employeeId', 'name email employeeId')
      .populate('cameraId', 'name location')
      .select('-__v');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert resolved successfully',
      data: alert
    });

  } catch (error: any) {
    console.error('Resolve alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get alert statistics
export const getAlertStats = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId; // From auth middleware
    const { timeframe = '7d' } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID required'
      });
    }

    // Calculate date range
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

    const stats = await Alert.aggregate([
      {
        $match: {
          companyId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$isResolved', true] }, 1, 0] }
          },
          unresolved: {
            $sum: { $cond: [{ $eq: ['$isResolved', false] }, 1, 0] }
          },
          critical: {
            $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
          },
          high: {
            $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] }
          },
          medium: {
            $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] }
          },
          low: {
            $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] }
          }
        }
      }
    ]);

    const alertTypes = await Alert.aggregate([
      {
        $match: {
          companyId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$alertType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const result = stats[0] || {
      total: 0,
      resolved: 0,
      unresolved: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    res.json({
      success: true,
      data: {
        ...result,
        alertTypes,
        timeframe
      }
    });

  } catch (error: any) {
    console.error('Get alert stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get alerts for specific employee
export const getEmployeeAlerts = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const companyId = req.user?.companyId; // From auth middleware
    const { page = 1, limit = 20 } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID required'
      });
    }

    // Verify employee belongs to company
    const employee = await User.findOne({ _id: employeeId, companyId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const alerts = await Alert.find({ companyId, employeeId })
      .populate('cameraId', 'name location')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit))
      .select('-__v');

    const total = await Alert.countDocuments({ companyId, employeeId });

    res.json({
      success: true,
      data: {
        alerts,
        employee: {
          id: employee._id,
          name: employee.name,
          email: employee.email,
          employeeId: employee.employeeId
        },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error: any) {
    console.error('Get employee alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
