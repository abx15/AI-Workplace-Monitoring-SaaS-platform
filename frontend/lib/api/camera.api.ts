import axiosInstance from '@/lib/axios'
import { Camera } from '@/types'

export const cameraApi = {
  getAll: () =>
    axiosInstance.get('/cameras'),
  
  create: (data: Partial<Camera>) =>
    axiosInstance.post('/cameras', data),
  
  update: (id: string, data: Partial<Camera>) =>
    axiosInstance.put(`/cameras/${id}`, data),
  
  delete: (id: string) =>
    axiosInstance.delete(`/cameras/${id}`),
  
  assign: (cameraId: string, operatorId: string) =>
    axiosInstance.post(
      `/cameras/${cameraId}/assign`,
      { operator_id: operatorId }
    )
}
