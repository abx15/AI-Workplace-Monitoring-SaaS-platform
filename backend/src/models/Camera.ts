import mongoose, { Document, Schema } from 'mongoose';

export interface ICamera extends Document {
  companyId: string;
  name: string;
  location?: string;
  rtspUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CameraSchema = new Schema<ICamera>({
  companyId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  rtspUrl: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
CameraSchema.index({ companyId: 1, isActive: 1 });
CameraSchema.index({ location: 1 });

export const Camera = mongoose.model<ICamera>('Camera', CameraSchema);
