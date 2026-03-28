import { useEffect } from 'react'
import { socket, connectSocket, disconnectSocket } from '../lib/socket'
import { useAlertStore } from '../store/alertStore'
import { useCameraStore } from '../store/cameraStore'
import { useAuthStore } from '../store/authStore'
import { toast } from 'sonner'
import { Camera } from '../types'

export const useSocket = () => {
  const { token, user } = useAuthStore()
  const { addAlert } = useAlertStore()
  const { updateCameraStatus } = useCameraStore()

  useEffect(() => {
    if (!token || !user) return

    connectSocket(token)

    socket.on('connect', () => {
      console.log('Socket connected')
      socket.emit('join_company', user.company_id)
    })

    socket.on('new_alert', (alert) => {
      addAlert(alert)
      toast.error(`Alert: ${alert.type} detected!`)
    })

    socket.on('camera_status', ({ camera_id, status }: { camera_id: string, status: Camera['status'] }) => {
      updateCameraStatus(camera_id, status)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    return () => {
      socket.off('new_alert')
      socket.off('camera_status')
      socket.off('connect')
      socket.off('disconnect')
      disconnectSocket()
    }
  }, [token, user, addAlert, updateCameraStatus])

  return socket
}
