import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  subscriptionPlan: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>({
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
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  subscriptionPlan: {
    type: String,
    required: true,
    enum: ['basic', 'premium', 'enterprise'],
    default: 'basic'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
CompanySchema.index({ email: 1 });
CompanySchema.index({ isActive: 1 });

export const Company = mongoose.model<ICompany>('Company', CompanySchema);
