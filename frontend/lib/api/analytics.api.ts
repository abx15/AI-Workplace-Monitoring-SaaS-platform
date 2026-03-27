import axiosInstance from '@/lib/axios'

export const analyticsApi = {
  getStats: () =>
    axiosInstance.get('/analytics/stats'),
  
  getAlertTrend: (filters?: any) =>
    axiosInstance.get('/analytics/alerts-trend',
      { params: filters }),
  
  getWorkerActivity: (filters?: any) =>
    axiosInstance.get('/analytics/worker-activity',
      { params: filters })
}
