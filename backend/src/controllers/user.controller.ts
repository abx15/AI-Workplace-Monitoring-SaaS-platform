import { Request, Response } from 'express';
import { User } from '../models/User';
import { Company } from '../models/Company';

// Get all users for a company
export const getUsers = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId; // Get from auth middleware

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: 'Company ID not found'
      });
    }

    const users = await User.find({ companyId, isActive: true })
      .select('-__v')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users
    });

  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId; // Get from auth middleware

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: 'Company ID not found'
      });
    }

    const user = await User.findOne({ _id: id, companyId, isActive: true })
      .select('-__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId; // Get from auth middleware
    const updates = req.body;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: 'Company ID not found'
      });
    }

    // Remove sensitive fields
    delete updates.companyId;
    delete updates._id;

    const user = await User.findOneAndUpdate(
      { _id: id, companyId, isActive: true },
      updates,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });

  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete user (soft delete)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId; // Get from auth middleware

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: 'Company ID not found'
      });
    }

    const user = await User.findOneAndUpdate(
      { _id: id, companyId, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get users by department
export const getUsersByDepartment = async (req: Request, res: Response) => {
  try {
    const { department } = req.params;
    const companyId = req.user?.companyId; // Get from auth middleware

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: 'Company ID not found'
      });
    }

    const users = await User.find({ 
      companyId, 
      department, 
      isActive: true 
    }).select('-__v').sort({ name: 1 });

    res.json({
      success: true,
      data: users
    });

  } catch (error: any) {
    console.error('Get users by department error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Search users
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const companyId = req.user?.companyId; // Get from auth middleware

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: 'Company ID not found'
      });
    }

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const users = await User.find({
      companyId,
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { employeeId: { $regex: query, $options: 'i' } }
      ]
    }).select('-__v').limit(20);

    res.json({
      success: true,
      data: users
    });

  } catch (error: any) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
