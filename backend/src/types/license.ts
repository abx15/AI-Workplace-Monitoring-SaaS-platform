export enum LicenseTier {
  STANDARD = 'STANDARD',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export enum LicenseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
}

export interface License {
  id: string;
  userId: string;
  tier: LicenseTier;
  status: LicenseStatus;
  startDate: Date;
  endDate: Date;
  maxCameras: number;
  features: string[];
  apiKey: string;
  lastValidated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LicenseValidationRequest {
  apiKey: string;
  feature?: string;
  cameraCount?: number;
}

export interface LicenseValidationResponse {
  valid: boolean;
  license?: License;
  error?: string;
}

export interface LicenseCreateRequest {
  userId: string;
  tier: LicenseTier;
  duration: number; // in days
}

export interface LicenseUpgradeRequest {
  licenseId: string;
  newTier: LicenseTier;
}
