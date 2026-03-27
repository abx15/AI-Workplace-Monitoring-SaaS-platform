import axiosInstance from '@/lib/axios'
import { Employee } from '@/types'

export const employeeApi = {
  getAll: () =>
    axiosInstance.get('/employees'),
  
  create: (formData: FormData) =>
    axiosInstance.post('/employees', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  update: (id: string, data: Partial<Employee>) =>
    axiosInstance.put(`/employees/${id}`, data),
  
  delete: (id: string) =>
    axiosInstance.delete(`/employees/${id}`)
}
