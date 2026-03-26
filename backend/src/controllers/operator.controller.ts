import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import pool from '../config/neon.config';

const operatorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const getOperators = async (req: Request, res: Response) => {
  try {
    const company_id = req.user?.company_id;
    const operatorsRes = await pool.query(
      'SELECT id, name, email, is_active, created_at FROM users WHERE company_id = $1 AND role = $2',
      [company_id, 'operator']
    );

    res.json({
      success: true,
      data: operatorsRes.rows,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const addOperator = async (req: Request, res: Response) => {
  try {
    const validatedData = operatorSchema.parse(req.body);
    const { name, email, password } = validatedData;
    const company_id = req.user?.company_id;

    // Check if email already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const operatorRes = await pool.query(
      'INSERT INTO users (name, email, password, role, company_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, company_id, is_active, created_at',
      [name, email, hashedPassword, 'operator', company_id]
    );

    res.status(201).json({
      success: true,
      data: operatorRes.rows[0],
      message: 'Operator added successfully',
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.errors || err.message,
    });
  }
};

export const updateOperator = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, is_active } = req.body;
    const company_id = req.user?.company_id;

    const operatorRes = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), is_active = COALESCE($2, is_active) WHERE id = $3 AND company_id = $4 AND role = $5 RETURNING id, name, email, role, is_active',
      [name, is_active, id, company_id, 'operator']
    );

    if (operatorRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Operator not found',
      });
    }

    res.json({
      success: true,
      data: operatorRes.rows[0],
      message: 'Operator updated successfully',
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteOperator = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company_id = req.user?.company_id;

    const deleteRes = await pool.query(
      'UPDATE users SET is_active = false WHERE id = $1 AND company_id = $2 AND role = $3 RETURNING id',
      [id, company_id, 'operator']
    );

    if (deleteRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Operator not found',
      });
    }

    res.json({
      success: true,
      message: 'Operator deactivated successfully',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
