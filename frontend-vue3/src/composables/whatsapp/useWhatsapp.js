import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '../services/api'
import { useSocket } from './useSocket'
import { useAuth } from './useAuth'
import { useNotification } from './useNotification'

export function useWhatsApp() {
  // Composables
  const $q = useQuasar()
  const { socket } = useSocket()
  const { isAdmin } = useAuth()
  const { notify } = useNotification()

  // Estado
  const connections = ref([])
  const loading = ref(false)
  const error = ref(null)
  const qrCode = ref(null)
  const currentConnection = ref(null)
  const retryCount = ref(0)
  const maxRetries = 3

  // Status possíveis
  const STATUS = {
    DISCONNECTED: 'DISCONNECTED',
    CONNECTING: 'CONNECTING',
    CONNECTED: 'CONNECTED',
    READY: 'READY',
    TIMEOUT: 'TIMEOUT',
    OPENING: 'OPENING',
    PAIRING: 'PAIRING',
    QRCODE: 'QRCODE',
    DESTROYED: 'DESTROYED'
  }

  // Computed
  const activeConnections = computed(() => 
    connections.value.filter(c => c.status === STATUS.READY)
  )

  const defaultConnection = computed(() => 
    connections.value.find(c => c.isDefault)
  )

  const hasProblems = computed(() => 
    connections.value.some(c => [
      STATUS.DISCONNECTED,
      STATUS.TIMEOUT,
      STATUS.DESTROYED
    ].includes(c.status))
  )

  const needsQRCode = computed(() => 
    connections.value.some(c => [
      STATUS.QRCODE,
      STATUS.PAIRING
    ].includes(c.status))
  )

  // Métodos
  const loadConnections = async () => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.get('/whatsapp')
      connections.value = data

      return data
    } catch (err) {
      error.value = 'Erro ao carregar conexões'
      console.error('Erro ao carregar conexões:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createConnection = async (connectionData) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.post('/whatsapp', connectionData)
      connections.value.push(data)
      currentConnection.value = data

      notify({
        type: 'positive',
        message: 'Conexão criada com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao criar conexão'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateConnection = async (connectionId, connectionData) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.put(`/whatsapp/${connectionId}`, connectionData)
      
      const index = connections.value.findIndex(c => c.id === connectionId)
      if (index !== -1) {
        connections.value[index] = data
      }

      if (currentConnection.value?.id === connectionId) {
        currentConnection.value = data
      }

      notify({
        type: 'positive',
        message: 'Conexão atualizada com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao atualizar conexão'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteConnection = async (connectionId) => {
    try {
      loading.value = true
      error.value = null

      await api.delete(`/whatsapp/${connectionId}`)
      connections.value = connections.value.filter(c => c.id !== connectionId)

      if (currentConnection.value?.id === connectionId) {
        currentConnection.value = null
      }

      notify({
        type: 'positive',
        message: 'Conexão removida com sucesso',
        position: 'top'
      })

      return true
    } catch (err) {
      error.value = 'Erro ao remover conexão'
      throw err
    } finally {
      loading.value = false
    }
  }

  const startSession = async (connectionId) => {
    try {
      loading.value = true
      error.value = null
      retryCount.value = 0

      const { data } = await api.post(`/whatsapp/${connectionId}/start`)
      
      const index = connections.value.findIndex(c => c.id === connectionId)
      if (index !== -1) {
        connections.value[index] = data
      }

      if (currentConnection.value?.id === connectionId) {
        currentConnection.value = data
      }

      return data
    } catch (err) {
      error.value = 'Erro ao iniciar sessão'
      throw err
    } finally {
      loading.value = false
    }
  }

  const restartSession = async (connectionId) => {
    try {
      if (retryCount.value >= maxRetries) {
        throw new Error('Número máximo de tentativas excedido')
      }

      loading.value = true
      error.value = null
      retryCount.value++

      const { data } = await api.post(`/whatsapp/${connectionId}/restart`)
      
      const index = connections.value.findIndex(c => c.id === connectionId)
      if (index !== -1) {
        connections.value[index] = data
      }

      if (currentConnection.value?.id === connectionId) {
        currentConnection.value = data
      }

      return data
    } catch (err) {
      error.value = 'Erro ao reiniciar sessão'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async (connectionId) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.post(`/whatsapp/${connectionId}/logout`)
      
      const index = connections.value.findIndex(c => c.id === connectionId)
      if (index !== -1) {
        connections.value[index] = data
      }

      if (currentConnection.value?.id === connectionId) {
        currentConnection.value = data
      }

      return data
    } catch (err) {
      error.value = 'Erro ao fazer logout'
      throw err
    } finally {
      loading.value = false
    }
  }

  const setDefault = async (connectionId) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.post(`/whatsapp/${connectionId}/default`)
      
      connections.value = connections.value.map(conn => ({
        ...conn,
        isDefault: conn.id === connectionId
      }))

      notify({
        type: 'positive',
        message: 'Conexão padrão definida com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao definir conexão padrão'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Socket handlers
  const handleStatusUpdate = (data) => {
    const { connectionId, status, qr } = data

    const connection = connections.value.find(c => c.id === connectionId)
    if (connection) {
      connection.status = status
      if (qr) connection.qrcode = qr

      if (currentConnection.value?.id === connectionId) {
        currentConnection.value = connection
        qrCode.value = qr
      }

      // Notificar problemas
      if ([STATUS.DISCONNECTED, STATUS.TIMEOUT, STATUS.DESTROYED].includes(status)) {
        notify({
          type: 'negative',
          message: `Problema na conexão ${connection.name}`,
          position: 'top'
        })
      }

      // Notificar sucesso
      if (status === STATUS.READY) {
        notify({
          type: 'positive',
          message: `Conexão ${connection.name} estabelecida`,
          position: 'top'
        })
      }
    }
  }

  const handleConnectionUpdate = (data) => {
    const index = connections.value.findIndex(c => c.id === data.id)
    if (index !== -1) {
      connections.value[index] = data
    } else {
      connections.value.push(data)
    }

    if (currentConnection.value?.id === data.id) {
      currentConnection.value = data
    }
  }

  const handleConnectionDelete = (connectionId) => {
    connections.value = connections.value.filter(c => c.id !== connectionId)
    
    if (currentConnection.value?.id === connectionId) {
      currentConnection.value = null
    }
  }

  // Socket listeners
  const setupSocketListeners = () => {
    socket.value?.on('whatsapp:status', handleStatusUpdate)
    socket.value?.on('whatsapp:update', handleConnectionUpdate)
    socket.value?.on('whatsapp:delete', handleConnectionDelete)
  }

  const removeSocketListeners = () => {
    socket.value?.off('whatsapp:status', handleStatusUpdate)
    socket.value?.off('whatsapp:update', handleConnectionUpdate)
    socket.value?.off('whatsapp:delete', handleConnectionDelete)
  }

  // Lifecycle
  onMounted(() => {
    setupSocketListeners()
    loadConnections()
  })

  onUnmounted(() => {
    removeSocketListeners()
  })

  return {
    // Estado
    connections,
    loading,
    error,
    qrCode,
    currentConnection,
    retryCount,

    // Constantes
    STATUS,
    maxRetries,

    // Computed
    activeConnections,
    defaultConnection,
    hasProblems,
    needsQRCode,

    // Métodos
    loadConnections,
    createConnection,
    updateConnection,
    deleteConnection,
    startSession,
    restartSession,
    logout,
    setDefault
  }
}
