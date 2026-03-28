export interface User {
  _id: string
  id?: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'supervisor' | 'employee' | 'operator'
  employeeId: string
  employee_id?: string
  department: string
  companyId: string
  company_id?: string
  password?: string
}

export interface Camera {
  _id: string
  id?: string
  name: string
  rtspUrl?: string
  rtsp_url?: string
  location: string
  status: 'active' | 'inactive' | 'error'
  operatorId?: string
  operator_id?: string
  companyId: string
  company_id?: string
}

export interface Employee {
  id: string
  name: string
  emp_id: string
  department: string
  role: string
  photo_url: string
  status: 'active' | 'inactive'
}

export interface Alert {
  _id: string
  id?: string
  cameraId: string
  camera_id?: string
  employeeId: string
  employee_id?: string
  companyId: string
  company_id?: string
  alertType: 'sleeping' | 'idle' | 'unknown_person' | 'unauthorized' | 'absentee' | 'productivity'
  type?: 'sleeping' | 'idle' | 'unknown_person' | 'unauthorized'
  screenshotUrl?: string
  screenshot_url?: string
  status: 'pending' | 'resolved' | 'ignored'
  severity: 'low' | 'medium' | 'high'
  message: string
  metadata?: any
  createdAt: string
  created_at?: string
}

export interface DashboardStats {
  total_employees: number
  active_cameras: number
  alerts_today: number
  active_workers: number
}

export interface Plan {
  name: string
  price: number | null
  cameras: number
  features: string[]
}
