import { Request, Response } from 'express';
import { z } from 'zod';
import pool from '../config/neon.config';

const cameraSchema = z.object({
  name: z.string().min(2),
  rtsp_url: z.string().url(),
  location: z.string().optional(),
});

const assignSchema = z.object({
  operator_id: z.string().uuid(),
});

export const addCamera = async (req: Request, res: Response) => {
  try {
    const validatedData = cameraSchema.parse(req.body);
    const { name, rtsp_url, location } = validatedData;
    const company_id = req.user?.company_id;

    // 1. Get company plan and current camera count
    const companyRes = await pool.query(
      'SELECT plan, max_cameras FROM companies WHERE id = $1',
      [company_id]
    );
    const { plan, max_cameras } = companyRes.rows[0];

    const countRes = await pool.query(
      'SELECT COUNT(*) FROM cameras WHERE company_id = $1',
      [company_id]
    );
    const currentCount = parseInt(countRes.rows[0].count);

    if (plan !== 'enterprise' && currentCount >= max_cameras) {
      return res.status(403).json({
        success: false,
        message: `Camera limit reached for ${plan} plan (${max_cameras}). Please upgrade your plan.`,
      });
    }

    // 2. Insert camera
    const cameraRes = await pool.query(
      'INSERT INTO cameras (name, rtsp_url, location, company_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, rtsp_url, location, company_id]
    );

    res.status(201).json({
      success: true,
      data: cameraRes.rows[0],
      message: 'Camera added successfully',
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.errors || err.message,
    });
  }
};

export const getCameras = async (req: Request, res: Response) => {
  try {
    const { role, company_id, userId } = req.user!;
    let query = 'SELECT * FROM cameras WHERE company_id = $1';
    let params = [company_id];

    if (role === 'operator') {
      query += ' AND operator_id = $2';
      params.push(userId);
    }

    const cameraRes = await pool.query(query, params);

    res.json({
      success: true,
      data: cameraRes.rows,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateCamera = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, location, status } = req.body;
    const company_id = req.user?.company_id;

    const cameraRes = await pool.query(
      'UPDATE cameras SET name = COALESCE($1, name), location = COALESCE($2, location), status = COALESCE($3, status) WHERE id = $4 AND company_id = $5 RETURNING *',
      [name, location, status, id, company_id]
    );

    if (cameraRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Camera not found',
      });
    }

    res.json({
      success: true,
      data: cameraRes.rows[0],
      message: 'Camera updated successfully',
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteCamera = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company_id = req.user?.company_id;

    const deleteRes = await pool.query(
      'DELETE FROM cameras WHERE id = $1 AND company_id = $2 RETURNING id',
      [id, company_id]
    );

    if (deleteRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Camera not found',
      });
    }

    res.json({
      success: true,
      message: 'Camera deleted successfully',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const assignCamera = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { operator_id } = assignSchema.parse(req.body);
    const company_id = req.user?.company_id;

    // Verify operator belongs to same company
    const operatorRes = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND company_id = $2 AND role = $3',
      [operator_id, company_id, 'operator']
    );

    if (operatorRes.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invdalid operator for this company',
      });
    }

    const cameraRes = await pool.query(
      'UPDATE cameras SET operator_id = $1 WHERE id = $2 AND company_id = $3 RETURNING *',
      [operator_id, id, company_id]
    );

    if (cameraRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Camera not found',
      });
    }

    res.json({
      success: true,
      data: cameraRes.rows[0],
      message: 'Camera assigned to operator successfully',
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.errors || err.message,
    });
  }
};
