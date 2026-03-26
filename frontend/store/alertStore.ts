import { create } from 'zustand'
import { Alert } from '../types'
import axiosInstance from '../lib/axios'

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
      const { data } = await axiosInstance.get('/alerts', { params: filters })
      set({ 
        alerts: data, 
        unreadCount: data.filter((a: Alert) => a.status === 'pending').length 
      })
    } catch (error) {
      console.error('Failed to fetch alerts', error)
    } finally {
      set({ isLoading: false })
    }
  },

  updateAlertStatus: async (id, status) => {
    try {
      await axiosInstance.patch(`/alerts/${id}`, { status })
      set((state) => ({
        alerts: state.alerts.map((a) => (a.id === id ? { ...a, status } : a)),
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
