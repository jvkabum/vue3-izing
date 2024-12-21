import { ref, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

export function useSocket() {
  // Composables
  const $q = useQuasar()
  const router = useRouter()

  // Estado
  const socket = ref(null)
  const connected = ref(false)
  const error = ref(null)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5

  // Métodos
  const initSocket = () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        error.value = 'Token não encontrado'
        return false
      }

      const parsedToken = JSON.parse(token)
      const tenantId = JSON.parse(localStorage.getItem('usuario'))?.tenantId

      socket.value = io(process.env.VUE_URL_API || 'http://localhost:3000', {
        query: {
          token: parsedToken,
          tenantId
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      })

      setupSocketListeners()
      return true
    } catch (err) {
      console.error('Erro ao inicializar socket:', err)
      error.value = 'Erro ao conectar ao servidor'
      return false
    }
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      connected.value = false
      error.value = null
      reconnectAttempts.value = 0
    }
  }

  const reconnect = () => {
    disconnect()
    return initSocket()
  }

  const emit = (event, data) => {
    if (!socket.value || !connected.value) {
      console.warn('Socket não conectado ao tentar emitir:', event)
      return false
    }

    try {
      socket.value.emit(event, data)
      return true
    } catch (err) {
      console.error('Erro ao emitir evento:', err)
      return false
    }
  }

  // Event handlers
  const handleConnect = () => {
    connected.value = true
    error.value = null
    reconnectAttempts.value = 0

    const userId = localStorage.getItem('userId')
    const tenantId = JSON.parse(localStorage.getItem('usuario'))?.tenantId

    if (userId && tenantId) {
      emit(`${tenantId}:setUserActive`)
    }
  }

  const handleDisconnect = (reason) => {
    connected.value = false
    
    if (reason === 'io server disconnect') {
      // Desconexão forçada pelo servidor
      error.value = 'Desconectado pelo servidor'
      router.push({ name: 'login' })
    } else {
      // Tentativa de reconexão automática
      error.value = 'Conexão perdida. Tentando reconectar...'
    }
  }

  const handleConnectError = (err) => {
    connected.value = false
    error.value = 'Erro de conexão'
    console.error('Erro de conexão socket:', err)

    reconnectAttempts.value++
    if (reconnectAttempts.value >= maxReconnectAttempts) {
      $q.notify({
        type: 'negative',
        message: 'Não foi possível reconectar ao servidor',
        position: 'top'
      })
      router.push({ name: 'login' })
    }
  }

  const handleReconnect = (attemptNumber) => {
    $q.notify({
      type: 'positive',
      message: 'Reconectado ao servidor',
      position: 'top'
    })
  }

  const handleReconnectError = (err) => {
    error.value = 'Erro ao tentar reconectar'
    console.error('Erro ao reconectar:', err)
  }

  const handleReconnectFailed = () => {
    error.value = 'Falha ao reconectar'
    $q.notify({
      type: 'negative',
      message: 'Não foi possível reconectar ao servidor',
      position: 'top'
    })
    router.push({ name: 'login' })
  }

  // Setup listeners
  const setupSocketListeners = () => {
    if (!socket.value) return

    socket.value.on('connect', handleConnect)
    socket.value.on('disconnect', handleDisconnect)
    socket.value.on('connect_error', handleConnectError)
    socket.value.on('reconnect', handleReconnect)
    socket.value.on('reconnect_error', handleReconnectError)
    socket.value.on('reconnect_failed', handleReconnectFailed)
  }

  const removeSocketListeners = () => {
    if (!socket.value) return

    socket.value.off('connect', handleConnect)
    socket.value.off('disconnect', handleDisconnect)
    socket.value.off('connect_error', handleConnectError)
    socket.value.off('reconnect', handleReconnect)
    socket.value.off('reconnect_error', handleReconnectError)
    socket.value.off('reconnect_failed', handleReconnectFailed)
  }

  // Lifecycle
  onMounted(() => {
    initSocket()
  })

  onUnmounted(() => {
    removeSocketListeners()
    disconnect()
  })

  return {
    // Estado
    socket,
    connected,
    error,
    reconnectAttempts,

    // Métodos
    initSocket,
    disconnect,
    reconnect,
    emit
  }
}
