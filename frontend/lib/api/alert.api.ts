import axiosInstance from '@/lib/axios'
import { Alert } from '@/types'

export const alertApi = {
  getAll: (filters?: any) =>
    axiosInstance.get('/alerts', { params: filters }),
  
  updateStatus: (id: string, status: Alert['status']) =>
    axiosInstance.put(`/alerts/${id}/status`, 
      { status })
}
