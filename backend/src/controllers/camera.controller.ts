import { Request, Response } from 'express';
import { Camera } from '../models/Camera';

// Get all cameras for a company
export const getCameras = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId; // From auth middleware

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID required'
      });
    }

    const cameras = await Camera.find({ companyId, isActive: true })
      .select('-__v')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: cameras
    });

  } catch (error: any) {
    console.error('Get cameras error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get camera by ID
export const getCameraById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId; // From auth middleware

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID required'
      });
    }

    const camera = await Camera.findOne({ 
      _id: id, 
      companyId, 
      isActive: true 
    }).select('-__v');

    if (!camera) {
      return res.status(404).json({
        success: false,
        message: 'Camera not found'
      });
    }

    res.json({
      success: true,
      data: camera
    });

  } catch (error: any) {
    console.error('Get camera error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new camera
export const createCamera = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId; // From auth middleware
    const { name, location, rtspUrl } = req.body;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID required'
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Camera name is required'
      });
    }

    const camera = new Camera({
      companyId,
      name,
      location,
      rtspUrl
    });

    await camera.save();

    res.status(201).json({
      success: true,
      message: 'Camera created successfully',
      data: camera
    });

  } catch (error: any) {
    console.error('Create camera error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update camera
export const updateCamera = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId; // From auth middleware
    const updates = req.body;

    // Remove sensitive fields
    delete updates.companyId;
    delete updates._id;

    const camera = await Camera.findOneAndUpdate(
      { _id: id, companyId, isActive: true },
      updates,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!camera) {
      return res.status(404).json({
        success: false,
        message: 'Camera not found'
      });
    }

    res.json({
      success: true,
      message: 'Camera updated successfully',
      data: camera
    });

  } catch (error: any) {
    console.error('Update camera error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete camera (soft delete)
export const deleteCamera = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId; // From auth middleware

    const camera = await Camera.findOneAndUpdate(
      { _id: id, companyId, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!camera) {
      return res.status(404).json({
        success: false,
        message: 'Camera not found'
      });
    }

    res.json({
      success: true,
      message: 'Camera deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete camera error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get cameras by location
export const getCamerasByLocation = async (req: Request, res: Response) => {
  try {
    const { location } = req.params;
    const companyId = req.user?.companyId; // From auth middleware

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID required'
      });
    }

    const cameras = await Camera.find({ 
      companyId, 
      location, 
      isActive: true 
    }).select('-__v').sort({ name: 1 });

    res.json({
      success: true,
      data: cameras
    });

  } catch (error: any) {
    console.error('Get cameras by location error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
