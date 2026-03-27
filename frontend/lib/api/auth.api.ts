import axiosInstance from '@/lib/axios'

export const authApi = {
  login: (email: string, password: string) =>
    axiosInstance.post('/auth/login', 
      { email, password }),
  
  getMe: () =>
    axiosInstance.get('/auth/me'),
  
  logout: () =>
    axiosInstance.post('/auth/logout')
}
