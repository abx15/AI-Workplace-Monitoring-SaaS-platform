import mongoose, { Document, Schema } from 'mongoose';

export interface IAlert extends Document {
  companyId: string;
  employeeId?: string;
  cameraId?: string;
  alertType: string;
  severity: string;
  message: string;
  metadata?: any;
  isResolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
}

const AlertSchema = new Schema<IAlert>({
  companyId: {
    type: String,
    required: true,
    index: true
  },
  employeeId: {
    type: String,
    index: true
  },
  cameraId: {
    type: String,
    index: true
  },
  alertType: {
    type: String,
    required: true,
    enum: ['idle', 'sleeping', 'unauthorized', 'absentee', 'productivity'],
    index: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  message: {
    type: String,
    required: true
  },
  metadata: {
    type: Schema.Types.Mixed
  },
  isResolved: {
    type: Boolean,
    default: false,
    index: true
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
AlertSchema.index({ companyId: 1, createdAt: -1 });
AlertSchema.index({ employeeId: 1, alertType: 1 });
AlertSchema.index({ isResolved: 1, severity: 1 });

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);
