import { Request, Response } from 'express';
import { AILog, DetectionEvent } from '../models/mongo.models';

export const getAILogs = async (req: Request, res: Response) => {
  try {
    const { camera_id, event_type, limit = 50 } = req.query;
    const company_id = req.user?.company_id;

    const filter: any = { company_id };
    if (camera_id) filter.camera_id = camera_id;
    if (event_type) filter.event_type = event_type;

    const logs = await AILog.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      data: logs,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getDetectionEvents = async (req: Request, res: Response) => {
  try {
    const { camera_id, type, employee_id, limit = 50 } = req.query;
    const company_id = req.user?.company_id;

    const filter: any = { company_id };
    if (camera_id) filter.camera_id = camera_id;
    if (type) filter.type = type;
    if (employee_id) filter.employee_id = employee_id;

    const events = await DetectionEvent.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      data: events,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getStatsOverview = async (req: Request, res: Response) => {
  try {
    const company_id = req.user?.company_id;

    // Aggregate trends (last 7 days detection counts)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trend = await DetectionEvent.aggregate([
      { 
        $match: { 
          company_id, 
          timestamp: { $gte: sevenDaysAgo } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({
      success: true,
      data: {
        trend
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
