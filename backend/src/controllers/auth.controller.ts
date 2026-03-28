import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Company } from '../models/Company';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';

// Register new user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, employeeId, companyName, companyEmail } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create or find company
    let company;
    if (companyName && companyEmail) {
      company = await Company.findOne({ email: companyEmail });
      if (!company) {
        company = new Company({
          name: companyName,
          email: companyEmail,
          subscriptionPlan: 'basic'
        });
        await company.save();
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Company information is required'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword, // Save the hashed password
      employeeId,
      companyId: company._id,
      department: 'production',
      role: 'employee'
    });

    await user.save();

    // Generate JWT tokens
    const token = jwt.sign(
      { userId: user._id, companyId: company._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          employeeId: user.employeeId,
          role: user.role,
          companyId: company._id
        },
        company: {
          id: company._id,
          name: company.name,
          email: company.email
        },
        token,
        refreshToken
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password if user has one
    if (user.password) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    } else {
      // For users without password, allow any password (temporary)
      console.log('User without password detected, allowing login');
    }

    // Get company
    const company = await Company.findById(user.companyId);
    if (!company) {
      return res.status(401).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Generate JWT tokens
    const token = jwt.sign(
      { userId: user._id, companyId: company._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          employeeId: user.employeeId,
          role: user.role,
          department: user.department,
          companyId: company._id
        },
        company: {
          id: company._id,
          name: company.name,
          email: company.email,
          subscriptionPlan: company.subscriptionPlan
        },
        token,
        refreshToken
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get current user
export const getMe = async (req: Request, res: Response) => {
  try {
    // This would normally come from auth middleware
    const { userId } = req.body; // Temporary - should come from middleware

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const company = await Company.findById(user.companyId);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          employeeId: user.employeeId,
          role: user.role,
          department: user.department,
          companyId: user.companyId
        },
        company: company ? {
          id: company._id,
          name: company.name,
          email: company.email,
          subscriptionPlan: company.subscriptionPlan
        } : null
      }
    });

  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Logout user
export const logout = async (req: Request, res: Response) => {
  try {
    // In a real app, you'd invalidate the token
    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
