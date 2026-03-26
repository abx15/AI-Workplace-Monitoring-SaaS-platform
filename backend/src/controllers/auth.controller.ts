import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import pool from '../config/neon.config';
import { JWTPayload } from '../types';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  company_name: z.string().min(2),
  role: z.enum(['admin']), // Initial registration is for admin
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const generateToken = (payload: JWTPayload) => {
  const secret = process.env.JWT_SECRET || 'secret';
  return jwt.sign({ ...payload }, secret, {
    expiresIn: '7d',
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password, company_name, role } = validatedData;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Create Company
      const companyRes = await client.query(
        'INSERT INTO companies (name) VALUES ($1) RETURNING id',
        [company_name]
      );
      const company_id = companyRes.rows[0].id;

      // 2. Hash Password
      const hashedPassword = await bcrypt.hash(password, 12);

      // 3. Create User
      const userRes = await client.query(
        'INSERT INTO users (name, email, password, role, company_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, company_id',
        [name, email, hashedPassword, role, company_id]
      );

      const user = userRes.rows[0];
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
      });

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        data: { user, token },
        message: 'Registration successful',
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.errors || err.message,
      message: 'Registration failed',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const userRes = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
    });

    // Don't send password
    delete user.password;

    res.json({
      success: true,
      data: { user, token },
      message: 'Login successful',
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.errors || err.message,
      message: 'Login failed',
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRes = await pool.query(
      'SELECT id, name, email, role, company_id, is_active, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: userRes.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logout successful',
  });
};
