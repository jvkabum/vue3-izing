import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '../services/api'
import { useSocket } from './useSocket'
import { useAuth } from './useAuth'

export function useQuickReplies() {
  // Composables
  const $q = useQuasar()
  const { socket } = useSocket()
  const { isAdmin } = useAuth()

  // Estado
  const quickReplies = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchTerm = ref('')

  // Computed
  const filteredReplies = computed(() => {
    if (!searchTerm.value) return quickReplies.value

    const search = searchTerm.value.toLowerCase()
    return quickReplies.value.filter(reply => 
      reply.key.toLowerCase().includes(search) ||
      reply.message.toLowerCase().includes(search)
    )
  })

  const groupedReplies = computed(() => {
    const groups = {}
    filteredReplies.value.forEach(reply => {
      const category = reply.category || 'Geral'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(reply)
    })
    return groups
  })

  const shortcutMap = computed(() => {
    const map = {}
    quickReplies.value.forEach(reply => {
      map[reply.key.toLowerCase()] = reply
    })
    return map
  })

  // Métodos
  const loadQuickReplies = async () => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.get('/quick-replies')
      quickReplies.value = data

      return data
    } catch (err) {
      error.value = 'Erro ao carregar mensagens rápidas'
      console.error('Erro ao carregar mensagens rápidas:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createQuickReply = async (replyData) => {
    try {
      loading.value = true
      error.value = null

      // Validar chave única
      if (shortcutMap.value[replyData.key.toLowerCase()]) {
        throw new Error('Já existe uma mensagem com esta chave')
      }

      const { data } = await api.post('/quick-replies', replyData)
      quickReplies.value.push(data)

      $q.notify({
        type: 'positive',
        message: 'Mensagem rápida criada com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = err.message || 'Erro ao criar mensagem rápida'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateQuickReply = async (replyId, replyData) => {
    try {
      loading.value = true
      error.value = null

      // Validar chave única
      const existing = shortcutMap.value[replyData.key.toLowerCase()]
      if (existing && existing.id !== replyId) {
        throw new Error('Já existe uma mensagem com esta chave')
      }

      const { data } = await api.put(`/quick-replies/${replyId}`, replyData)
      
      const index = quickReplies.value.findIndex(r => r.id === replyId)
      if (index !== -1) {
        quickReplies.value[index] = data
      }

      $q.notify({
        type: 'positive',
        message: 'Mensagem rápida atualizada com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = err.message || 'Erro ao atualizar mensagem rápida'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteQuickReply = async (replyId) => {
    try {
      loading.value = true
      error.value = null

      await api.delete(`/quick-replies/${replyId}`)
      quickReplies.value = quickReplies.value.filter(r => r.id !== replyId)

      $q.notify({
        type: 'positive',
        message: 'Mensagem rápida removida com sucesso',
        position: 'top'
      })

      return true
    } catch (err) {
      error.value = 'Erro ao remover mensagem rápida'
      throw err
    } finally {
      loading.value = false
    }
  }

  const findByShortcut = (shortcut) => {
    if (!shortcut) return null
    return shortcutMap.value[shortcut.toLowerCase()]
  }

  const processMessage = (message) => {
    if (!message.startsWith('/')) return message

    const shortcut = message.substring(1).toLowerCase()
    const quickReply = findByShortcut(shortcut)
    
    if (!quickReply) {
      throw new Error('Mensagem rápida não encontrada')
    }

    return quickReply.message
  }

  // Socket handlers
  const handleQuickReplyUpdate = (data) => {
    const index = quickReplies.value.findIndex(r => r.id === data.id)
    if (index !== -1) {
      quickReplies.value[index] = data
    } else {
      quickReplies.value.push(data)
    }
  }

  const handleQuickReplyDelete = (replyId) => {
    quickReplies.value = quickReplies.value.filter(r => r.id !== replyId)
  }

  // Socket listeners
  const setupSocketListeners = () => {
    socket.value?.on('quickReply:update', handleQuickReplyUpdate)
    socket.value?.on('quickReply:delete', handleQuickReplyDelete)
  }

  const removeSocketListeners = () => {
    socket.value?.off('quickReply:update', handleQuickReplyUpdate)
    socket.value?.off('quickReply:delete', handleQuickReplyDelete)
  }

  // Lifecycle
  onMounted(() => {
    setupSocketListeners()
    loadQuickReplies()
  })

  onUnmounted(() => {
    removeSocketListeners()
  })

  return {
    // Estado
    quickReplies,
    loading,
    error,
    searchTerm,

    // Computed
    filteredReplies,
    groupedReplies,
    shortcutMap,

    // Métodos
    loadQuickReplies,
    createQuickReply,
    updateQuickReply,
    deleteQuickReply,
    findByShortcut,
    processMessage
  }
}
