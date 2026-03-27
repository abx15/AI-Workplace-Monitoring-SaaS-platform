import { Request, Response } from 'express';
import { User } from '../models/User';
import { Camera } from '../models/Camera';
import { Alert } from '../models/Alert';

// Get dashboard analytics
export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.body; // Should come from auth middleware
    const { timeframe = '7d' } = req.query;

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

    // Get basic counts
    const [
      totalUsers,
      activeUsers,
      totalCameras,
      activeCameras,
      alertStats,
      departmentStats,
      alertTrends
    ] = await Promise.all([
      // Total users
      User.countDocuments({ companyId }),
      
      // Active users
      User.countDocuments({ companyId, isActive: true }),
      
      // Total cameras
      Camera.countDocuments({ companyId }),
      
      // Active cameras
      Camera.countDocuments({ companyId, isActive: true }),
      
      // Alert statistics
      Alert.aggregate([
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
      ]),
      
      // Department statistics
      User.aggregate([
        {
          $match: {
            companyId,
            isActive: true
          }
        },
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      
      // Alert trends (last 7 days)
      Alert.aggregate([
        {
          $match: {
            companyId,
            createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const alertData = alertStats[0] || {
      total: 0,
      resolved: 0,
      unresolved: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    // Get recent alerts
    const recentAlerts = await Alert.find({ companyId })
      .populate('employeeId', 'name email employeeId')
      .populate('cameraId', 'name location')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-__v');

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalCameras,
          activeCameras
        },
        alerts: {
          ...alertData,
          recentAlerts
        },
        departments: departmentStats,
        trends: alertTrends,
        timeframe
      }
    });

  } catch (error: any) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get employee productivity analytics
export const getEmployeeProductivity = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.body; // Should come from auth middleware
    const { timeframe = '7d' } = req.query;

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

    // Get employee alert statistics
    const employeeStats = await Alert.aggregate([
      {
        $match: {
          companyId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$employeeId',
          totalAlerts: { $sum: 1 },
          criticalAlerts: {
            $sum: {
              $cond: [
                { $in: ['$severity', ['critical', 'high']] },
                1,
                0
              ]
            }
          },
          productivityAlerts: {
            $sum: {
              $cond: [{ $eq: ['$alertType', 'productivity'] }, 1, 0]
            }
          },
          idleAlerts: {
            $sum: {
              $cond: [{ $eq: ['$alertType', 'idle'] }, 1, 0]
            }
          },
          sleepingAlerts: {
            $sum: {
              $cond: [{ $eq: ['$alertType', 'sleeping'] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          employeeId: '$user.employeeId',
          name: '$user.name',
          email: '$user.email',
          department: '$user.department',
          totalAlerts: 1,
          criticalAlerts: 1,
          productivityAlerts: 1,
          idleAlerts: 1,
          sleepingAlerts: 1,
          productivityScore: {
            $subtract: [
              100,
              {
                $multiply: [
                  {
                    $add: ['$criticalAlerts', '$idleAlerts', '$sleepingAlerts']
                  },
                  10
                ]
              }
            ]
          }
        }
      },
      { $sort: { productivityScore: -1 } }
    ]);

    // Get department-wise productivity
    const departmentProductivity = await Alert.aggregate([
      {
        $match: {
          companyId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $group: {
          _id: '$user.department',
          totalAlerts: { $sum: 1 },
          criticalAlerts: {
            $sum: {
              $cond: [
                { $in: ['$severity', ['critical', 'high']] },
                1,
                0
              ]
            }
          },
          employees: { $addToSet: '$user._id' }
        }
      },
      {
        $project: {
          department: '$_id',
          totalAlerts: 1,
          criticalAlerts: 1,
          employeeCount: { $size: '$employees' },
          avgAlertsPerEmployee: {
            $divide: ['$totalAlerts', { $size: '$employees' }]
          }
        }
      },
      { $sort: { avgAlertsPerEmployee: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        employeeStats,
        departmentProductivity,
        timeframe
      }
    });

  } catch (error: any) {
    console.error('Get employee productivity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get camera analytics
export const getCameraAnalytics = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.body; // Should come from auth middleware
    const { timeframe = '7d' } = req.query;

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

    // Get camera alert statistics
    const cameraStats = await Alert.aggregate([
      {
        $match: {
          companyId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$cameraId',
          totalAlerts: { $sum: 1 },
          criticalAlerts: {
            $sum: {
              $cond: [
                { $in: ['$severity', ['critical', 'high']] },
                1,
                0
              ]
            }
          },
          lastAlert: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'cameras',
          localField: '_id',
          foreignField: '_id',
          as: 'camera'
        }
      },
      {
        $unwind: '$camera'
      },
      {
        $project: {
          cameraId: '$camera._id',
          name: '$camera.name',
          location: '$camera.location',
          isActive: '$camera.isActive',
          totalAlerts: 1,
          criticalAlerts: 1,
          lastAlert: 1
        }
      },
      { $sort: { totalAlerts: -1 } }
    ]);

    // Get location-wise alert distribution
    const locationStats = await Alert.aggregate([
      {
        $match: {
          companyId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'cameras',
          localField: 'cameraId',
          foreignField: '_id',
          as: 'camera'
        }
      },
      {
        $unwind: '$camera'
      },
      {
        $group: {
          _id: '$camera.location',
          totalAlerts: { $sum: 1 },
          criticalAlerts: {
            $sum: {
              $cond: [
                { $in: ['$severity', ['critical', 'high']] },
                1,
                0
              ]
            }
          },
          cameras: { $addToSet: '$camera._id' }
        }
      },
      {
        $project: {
          location: '$_id',
          totalAlerts: 1,
          criticalAlerts: 1,
          cameraCount: { $size: '$cameras' },
          avgAlertsPerCamera: {
            $divide: ['$totalAlerts', { $size: '$cameras' }]
          }
        }
      },
      { $sort: { totalAlerts: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        cameraStats,
        locationStats,
        timeframe
      }
    });

  } catch (error: any) {
    console.error('Get camera analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
