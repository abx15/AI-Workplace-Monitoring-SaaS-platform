import { Request, Response } from 'express';
import pool from '../config/neon.config';

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const { camera_id, status, type, start_date, end_date } = req.query;
    const company_id = req.user?.company_id;

    let query = `
      SELECT a.*, c.name as camera_name, e.name as employee_name 
      FROM alerts a
      JOIN cameras c ON a.camera_id = c.id
      LEFT JOIN employees e ON a.employee_id = e.id
      WHERE c.company_id = $1
    `;
    const params: any[] = [company_id];

    if (camera_id) {
      params.push(camera_id);
      query += ` AND a.camera_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND a.status = $${params.length}`;
    }

    if (type) {
      params.push(type);
      query += ` AND a.alert_type = $${params.length}`;
    }

    if (start_date && end_date) {
      params.push(start_date, end_date);
      query += ` AND a.created_at BETWEEN $${params.length - 1} AND $${params.length}`;
    }

    query += ' ORDER BY a.created_at DESC';

    const alertsRes = await pool.query(query, params);

    res.json({
      success: true,
      data: alertsRes.rows,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const resolveAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company_id = req.user?.company_id;

    const alertRes = await pool.query(
      `UPDATE alerts SET status = 'resolved' 
       WHERE id = $1 AND camera_id IN (SELECT id FROM cameras WHERE company_id = $2)
       RETURNING *`,
      [id, company_id]
    );

    if (alertRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found or unauthorized',
      });
    }

    res.json({
      success: true,
      data: alertRes.rows[0],
      message: 'Alert resolved successfully',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getAlertStats = async (req: Request, res: Response) => {
  try {
    const company_id = req.user?.company_id;

    const statsRes = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
        alert_type,
        COUNT(*) as type_count
       FROM alerts 
       WHERE camera_id IN (SELECT id FROM cameras WHERE company_id = $1)
       GROUP BY alert_type`,
      [company_id]
    );

    res.json({
      success: true,
      data: statsRes.rows,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
