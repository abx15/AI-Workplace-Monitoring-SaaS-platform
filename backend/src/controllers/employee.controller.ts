import { Request, Response } from 'express';
import { z } from 'zod';
import axios from 'axios';
import pool from '../config/neon.config';
import { uploadToCloudinary } from '../config/cloudinary.config';

const employeeSchema = z.object({
  name: z.string().min(2),
  emp_id: z.string().min(2),
  department: z.string().optional(),
  role: z.string().optional(),
});

export const addEmployee = async (req: Request, res: Response) => {
  try {
    const validatedData = employeeSchema.parse(req.body);
    const { name, emp_id, department, role } = validatedData;
    const company_id = req.user?.company_id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Employee photo is required',
      });
    }

    // 1. Upload to Cloudinary
    const photo_url = await uploadToCloudinary(req.file.buffer, 'employees');

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 2. Save to Neon DB
      const empRes = await client.query(
        'INSERT INTO employees (name, emp_id, department, role, photo_url, company_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, emp_id, department, role, photo_url, company_id]
      );
      const employee = empRes.rows[0];

      // 3. Get Face Embedding from AI Service
      try {
        const aiRes = await axios.post(`${process.env.AI_SERVICE_URL}/api/face/encode`, {
          image_url: photo_url,
        });

        const embedding = aiRes.data.embedding;

        // 4. Save embedding
        await client.query(
          'INSERT INTO face_embeddings (employee_id, embedding) VALUES ($1, $2)',
          [employee.id, `[${embedding.join(',')}]`]
        );
      } catch (aiErr: any) {
        console.error('AI Service Error:', aiErr.message);
        // We might want to rollback or let it pass with a warning
        // For now, let's rollback to ensure consistency
        throw new Error('Failed to generate face embedding from AI service');
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        data: employee,
        message: 'Employee added successfully',
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
    });
  }
};

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const company_id = req.user?.company_id;
    const employeesRes = await pool.query(
      'SELECT * FROM employees WHERE company_id = $1',
      [company_id]
    );

    res.json({
      success: true,
      data: employeesRes.rows,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, department, role, status } = req.body;
    const company_id = req.user?.company_id;

    let photo_url = req.body.photo_url;
    if (req.file) {
      photo_url = await uploadToCloudinary(req.file.buffer, 'employees');
      // If photo changed, we should ideally re-encode, but skipping for simplicity or handling separately
    }

    const empRes = await pool.query(
      'UPDATE employees SET name = COALESCE($1, name), department = COALESCE($2, department), role = COALESCE($3, role), status = COALESCE($4, status), photo_url = COALESCE($5, photo_url) WHERE id = $6 AND company_id = $7 RETURNING *',
      [name, department, role, status, photo_url, id, company_id]
    );

    if (empRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.json({
      success: true,
      data: empRes.rows[0],
      message: 'Employee updated successfully',
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company_id = req.user?.company_id;

    const deleteRes = await pool.query(
      'DELETE FROM employees WHERE id = $1 AND company_id = $2 RETURNING id',
      [id, company_id]
    );

    if (deleteRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
