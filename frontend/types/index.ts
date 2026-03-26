export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'operator'
  company_id: string
}

export interface Camera {
  id: string
  name: string
  rtsp_url: string
  location: string
  status: 'active' | 'inactive' | 'error'
  operator_id: string
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
  id: string
  camera_id: string
  employee_id: string
  type: 'sleeping' | 'idle' | 'unknown_person' | 'unauthorized'
  screenshot_url: string
  status: 'pending' | 'resolved' | 'ignored'
  created_at: string
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
