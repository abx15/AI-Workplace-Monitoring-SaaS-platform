import { useEffect, useMemo } from 'react'
import { useCameraStore } from '../store/cameraStore'
import { useAuthStore } from '../store/authStore'

export const useCameras = () => {
  const { cameras, isLoading, fetchCameras } = useCameraStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchCameras()
  }, [fetchCameras])

  const filteredCameras = useMemo(() => {
    if (!user) return []
    if (user.role === 'admin') return cameras
    return cameras.filter(camera => camera.operator_id === user.id)
  }, [cameras, user])

  return { cameras: filteredCameras, isLoading }
}
