import mongoose, { Schema, Document } from 'mongoose';

export interface IAILog extends Document {
  camera_id: string;
  company_id: string;
  event_type: string;
  message: string;
  metadata: any;
  timestamp: Date;
}

export interface IDetectionEvent extends Document {
  camera_id: string;
  company_id: string;
  employee_id?: string;
  type: string;
  confidence: number;
  image_url: string;
  metadata: any;
  timestamp: Date;
}

const AILogSchema = new Schema({
  camera_id: { type: String, required: true, index: true },
  company_id: { type: String, required: true, index: true },
  event_type: { type: String, required: true },
  message: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

const DetectionEventSchema = new Schema({
  camera_id: { type: String, required: true, index: true },
  company_id: { type: String, required: true, index: true },
  employee_id: { type: String, index: true },
  type: { type: String, required: true },
  confidence: { type: Number, required: true },
  image_url: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

export const AILog = mongoose.model<IAILog>('AILog', AILogSchema);
export const DetectionEvent = mongoose.model<IDetectionEvent>('DetectionEvent', DetectionEventSchema);
