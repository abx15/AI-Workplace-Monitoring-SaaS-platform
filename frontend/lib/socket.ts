import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
})

export const connectSocket = (token: string) => {
  if (!socket.connected) {
    socket.auth = { token }
    socket.connect()
  }
}

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect()
  }
}
