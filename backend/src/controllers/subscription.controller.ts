import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import pool from '../config/neon.config';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { plan } = req.body; // 'basic', 'pro', 'enterprise'
    let amount = 0;

    if (plan === 'basic') amount = 99900; // INR 999
    else if (plan === 'pro') amount = 299900; // INR 2999
    else if (plan === 'enterprise') amount = 999900; // INR 9999
    else return res.status(400).json({ success: false, message: 'Invalid plan' });

    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      data: order,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      plan
    } = req.body;
    const company_id = req.user?.company_id;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    // Update company plan
    let max_cameras = 2;
    if (plan === 'pro') max_cameras = 10;
    else if (plan === 'enterprise') max_cameras = 1000; // Unlimited effectively

    await pool.query(
      `UPDATE companies 
       SET plan = $1, max_cameras = $2, subscription_status = 'active'
       WHERE id = $3`,
      [plan, max_cameras, company_id]
    );

    // Record subscription
    await pool.query(
      `INSERT INTO subscriptions (company_id, plan, amount, razorpay_payment_id, razorpay_order_id, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [company_id, plan, 0, razorpay_payment_id, razorpay_order_id, 'active'] // Amount fetch from order if needed
    );

    res.json({
      success: true,
      message: 'Payment verified and plan upgraded',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getStatus = async (req: Request, res: Response) => {
  try {
    const company_id = req.user?.company_id;
    const companyRes = await pool.query(
      'SELECT plan, subscription_status, max_cameras FROM companies WHERE id = $1',
      [company_id]
    );

    res.json({
      success: true,
      data: companyRes.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
