import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  employeeId: string;
  companyId: string;
  department: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  employeeId: {
    type: String,
    required: true,
    trim: true
  },
  companyId: {
    type: String,
    required: true,
    index: true
  },
  department: {
    type: String,
    required: true,
    enum: ['production', 'management', 'hr', 'it', 'admin']
  },
  role: {
    type: String,
    required: true,
    enum: ['employee', 'supervisor', 'manager', 'admin'],
    default: 'employee'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
UserSchema.index({ companyId: 1, email: 1 });
UserSchema.index({ companyId: 1, employeeId: 1 });
UserSchema.index({ department: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
