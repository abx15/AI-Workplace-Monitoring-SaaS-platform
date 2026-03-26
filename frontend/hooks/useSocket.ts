import { useEffect } from 'react'
import { socket, connectSocket, disconnectSocket } from '../lib/socket'
import { useAlertStore } from '../store/alertStore'
import { useAuthStore } from '../store/authStore'

export const useSocket = () => {
  const { token } = useAuthStore()
  const { addAlert } = useAlertStore()

  useEffect(() => {
    if (token) {
      connectSocket(token)

      socket.on('new_alert', (alert) => {
        addAlert(alert)
        // Show notification logic can go here
      })

      socket.on('live_detection', (detection) => {
        // Handle live detection updates (e.g., for specific camera feed)
      })

      socket.on('camera_status', (data) => {
        // Update camera status in store if needed
      })
    }

    return () => {
      disconnectSocket()
      socket.off('new_alert')
      socket.off('live_detection')
      socket.off('camera_status')
    }
  }, [token, addAlert])

  return socket
}
