import axiosInstance from '@/lib/axios'
import { User } from '@/types'

export const operatorApi = {
  getAll: () =>
    axiosInstance.get('/operators'),
  
  create: (data: Partial<User>) =>
    axiosInstance.post('/operators', data),
  
  update: (id: string, data: Partial<User>) =>
    axiosInstance.put(`/operators/${id}`, data),
  
  delete: (id: string) =>
    axiosInstance.delete(`/operators/${id}`)
}
