import { create } from 'zustand'
import { Camera } from '../types'
import axiosInstance from '../lib/axios'
import { useAuthStore } from './authStore'

interface CameraState {
  cameras: Camera[]
  isLoading: boolean
  fetchCameras: () => Promise<void>
  addCamera: (data: any) => Promise<void>
  deleteCamera: (id: string) => Promise<void>
  assignCamera: (cameraId: string, operatorId: string) => Promise<void>
  updateCameraStatus: (cameraId: string, status: Camera['status']) => void
}

export const useCameraStore = create<CameraState>((set) => ({
  cameras: [],
  isLoading: false,

  fetchCameras: async () => {
    set({ isLoading: true })
    try {
      const authState = useAuthStore.getState()
      const companyId = authState.user?.companyId || authState.user?.company_id
      
      if (!companyId) {
        console.warn('No companyId found in auth state')
        set({ cameras: [] })
        return
      }
      
      const { data } = await axiosInstance.get('/cameras')
      const camerasData = data.data || data
      set({ cameras: Array.isArray(camerasData) ? camerasData : [] })
    } catch (error) {
      console.error('Failed to fetch cameras', error)
      set({ cameras: [] })
    } finally {
      set({ isLoading: false })
    }
  },

  addCamera: async (cameraData) => {
    set({ isLoading: true })
    try {
      const authState = useAuthStore.getState()
      const companyId = authState.user?.companyId || authState.user?.company_id
      
      const { data: newCamera } = await axiosInstance.post('/cameras', {
        ...cameraData,
        companyId
      })
      set((state) => ({ cameras: [...state.cameras, newCamera.data || newCamera] }))
    } catch (error) {
      console.error('Failed to add camera', error)
    } finally {
      set({ isLoading: false })
    }
  },

  deleteCamera: async (id) => {
    try {
      await axiosInstance.delete(`/cameras/${id}`)
      set((state) => ({ cameras: state.cameras.filter((c) => c._id !== id && c.id !== id) }))
    } catch (error) {
      console.error('Failed to delete camera', error)
    }
  },

  assignCamera: async (cameraId, operatorId) => {
    try {
      await axiosInstance.post(`/cameras/${cameraId}/assign`, { operatorId })
      // Update local state if needed
    } catch (error) {
      console.error('Failed to assign camera', error)
    }
  },

  updateCameraStatus: (cameraId, status) => {
    set((state) => ({
      cameras: state.cameras.map((c) => 
        (c._id === cameraId || c.id === cameraId) ? { ...c, status } : c
      )
    }))
  },
}))
