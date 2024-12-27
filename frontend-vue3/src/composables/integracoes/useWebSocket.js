import { ref, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'
import { useAuth } from './useAuth'

export function useWebSocket() {
  const { token } = useAuth()
  const socket = ref(null)
  const connected = ref(false)
  const error = ref(null)

  const connect = () => {
    try {
      socket.value = io(process.env.VUE_APP_BACKEND_URL, {
        auth: {
          token: token.value
        },
        transports: ['websocket']
      })

      socket.value.on('connect', () => {
        connected.value = true
        error.value = null
      })

      socket.value.on('disconnect', () => {
        connected.value = false
      })

      socket.value.on('connect_error', (err) => {
        error.value = err.message
        connected.value = false
      })
    } catch (err) {
      error.value = err.message
      connected.value = false
    }
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      connected.value = false
    }
  }

  onMounted(() => {
    if (token.value) connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    socket,
    connected,
    error,
    connect,
    disconnect
  }
} 