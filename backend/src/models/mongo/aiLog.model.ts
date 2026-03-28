import mongoose, { Document, Schema } from 'mongoose';

export interface IAILog extends Document {
  cameraId: string;
  employeeId?: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  processingTime: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const AILogSchema = new Schema<IAILog>({
  cameraId: {
    type: String,
    required: true,
    index: true
  },
  employeeId: {
    type: String,
    index: true
  },
  alertType: {
    type: String,
    required: true,
    enum: ['sleeping', 'idle', 'unauthorized', 'absentee', 'productivity', 'normal']
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high']
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  processingTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better performance
AILogSchema.index({ cameraId: 1, processingTime: -1 });
AILogSchema.index({ employeeId: 1, processingTime: -1 });
AILogSchema.index({ alertType: 1, processingTime: -1 });

export const AILog = mongoose.model<IAILog>('AILog', AILogSchema);