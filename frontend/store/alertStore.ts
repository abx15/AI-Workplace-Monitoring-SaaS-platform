import { create } from 'zustand'
import { Alert } from '../types'
import axiosInstance from '../lib/axios'
import { useAuthStore } from './authStore'

interface AlertState {
  alerts: Alert[]
  unreadCount: number
  isLoading: boolean
  fetchAlerts: (filters?: any) => Promise<void>
  updateAlertStatus: (id: string, status: Alert['status']) => Promise<void>
  addAlert: (alert: Alert) => void
  markAllRead: () => void
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  unreadCount: 0,
  isLoading: false,

  fetchAlerts: async (filters) => {
    set({ isLoading: true })
    try {
      const authState = useAuthStore.getState()
      const companyId = authState.user?.companyId || authState.user?.company_id
      
      if (!companyId) {
        console.warn('No companyId found in auth state')
        set({ alerts: [], unreadCount: 0 })
        return
      }
      
      const { data } = await axiosInstance.get('/alerts', { 
        params: filters
      })
      // Handle different response structures
      const alertsData = data.data?.alerts || data.data || data
      const alertsArray = Array.isArray(alertsData) ? alertsData : []
      set({ 
        alerts: alertsArray, 
        unreadCount: alertsArray.filter((a: Alert) => a.status === 'pending').length 
      })
    } catch (error) {
      console.error('Failed to fetch alerts', error)
      set({ alerts: [], unreadCount: 0 })
    } finally {
      set({ isLoading: false })
    }
  },

  updateAlertStatus: async (id, status) => {
    try {
      await axiosInstance.patch(`/alerts/${id}`, { status })
      set((state) => ({
        alerts: state.alerts.map((a) => ((a._id === id || a.id === id) ? { ...a, status } : a)),
        unreadCount: status === 'pending' ? state.unreadCount : state.unreadCount - 1
      }))
    } catch (error) {
      console.error('Failed to update alert status', error)
    }
  },

  addAlert: (alert) => {
    set((state) => ({
      alerts: [alert, ...state.alerts],
      unreadCount: state.unreadCount + 1
    }))
  },

  markAllRead: () => {
    set({ unreadCount: 0 })
  },
}))
