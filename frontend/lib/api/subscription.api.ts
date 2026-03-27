import axiosInstance from '@/lib/axios'

export const subscriptionApi = {
  getPlans: () =>
    axiosInstance.get('/subscription/plans'),
  
  getCurrent: () =>
    axiosInstance.get('/subscription'),
  
  createOrder: (plan: string) =>
    axiosInstance.post('/subscription/order', 
      { plan }),
  
  verifyPayment: (data: any) =>
    axiosInstance.post('/subscription/verify', data)
}
