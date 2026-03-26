import { create } from 'zustand'
import { Camera } from '../types'
import axiosInstance from '../lib/axios'

interface CameraState {
  cameras: Camera[]
  isLoading: boolean
  fetchCameras: () => Promise<void>
  addCamera: (data: any) => Promise<void>
  deleteCamera: (id: string) => Promise<void>
  assignCamera: (cameraId: string, operatorId: string) => Promise<void>
}

export const useCameraStore = create<CameraState>((set) => ({
  cameras: [],
  isLoading: false,

  fetchCameras: async () => {
    set({ isLoading: true })
    try {
      const { data } = await axiosInstance.get('/cameras')
      set({ cameras: data })
    } catch (error) {
      console.error('Failed to fetch cameras', error)
    } finally {
      set({ isLoading: false })
    }
  },

  addCamera: async (data) => {
    set({ isLoading: true })
    try {
      const { data: newCamera } = await axiosInstance.post('/cameras', data)
      set((state) => ({ cameras: [...state.cameras, newCamera] }))
    } catch (error) {
      console.error('Failed to add camera', error)
    } finally {
      set({ isLoading: false })
    }
  },

  deleteCamera: async (id) => {
    try {
      await axiosInstance.delete(`/cameras/${id}`)
      set((state) => ({ cameras: state.cameras.filter((c) => c.id !== id) }))
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
}))
