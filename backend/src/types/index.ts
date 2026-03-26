export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional because we often exclude it
  role: 'admin' | 'operator';
  company_id: string;
  is_active: boolean;
  created_at: Date;
  updated_at?: Date;
}

export interface Company {
  id: string;
  name: string;
  plan: 'basic' | 'pro' | 'enterprise';
  max_cameras: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Camera {
  id: string;
  name: string;
  rtsp_url: string;
  location: string;
  status: 'active' | 'inactive' | 'error';
  operator_id: string | null;
  company_id: string;
  created_at: Date;
}

export interface Employee {
  id: string;
  name: string;
  emp_id: string;
  department: string;
  role: string;
  photo_url: string;
  status: 'active' | 'inactive';
  company_id: string;
  created_at: Date;
}

export interface Alert {
  id: string;
  camera_id: string | null;
  employee_id: string | null;
  company_id: string;
  type: 'sleeping' | 'idle' | 'unknown_person' | 'unauthorized' | 'custom';
  screenshot_url: string;
  status: 'pending' | 'resolved' | 'ignored';
  created_at: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'operator';
  company_id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
