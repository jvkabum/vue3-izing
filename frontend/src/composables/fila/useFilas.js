import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '@/service/api'
import { useSocket } from '@/composables/integracoes/useSocket'
import { useAuth } from '@/composables/autenticacao/useAuth'

export function useQueues() {
  // Composables
  const $q = useQuasar()
  const { socket } = useSocket()
  const { isAdmin, userQueues } = useAuth()

  // Estado
  const queues = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedQueues = ref([])

  // Computed
  const availableQueues = computed(() => {
    if (isAdmin.value) return queues.value
    return queues.value.filter(queue => 
      userQueues.value.some(uq => uq.id === queue.id)
    )
  })

  const queuesByStatus = computed(() => {
    const grouped = {
      active: [],
      inactive: []
    }
    queues.value.forEach(queue => {
      if (queue.active) {
        grouped.active.push(queue)
      } else {
        grouped.inactive.push(queue)
      }
    })
    return grouped
  })

  const queueStats = computed(() => {
    const stats = {
      total: queues.value.length,
      active: queuesByStatus.value.active.length,
      inactive: queuesByStatus.value.inactive.length
    }
    return stats
  })

  // Métodos
  const loadQueues = async () => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.get('/queues')
      queues.value = data

      // Restaurar seleção salva
      const savedSelection = localStorage.getItem('selectedQueues')
      if (savedSelection) {
        try {
          selectedQueues.value = JSON.parse(savedSelection)
        } catch (err) {
          console.error('Erro ao restaurar filas selecionadas:', err)
        }
      }

      return data
    } catch (err) {
      error.value = 'Erro ao carregar filas'
      console.error('Erro ao carregar filas:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createQueue = async (queueData) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.post('/queues', queueData)
      queues.value.push(data)

      $q.notify({
        type: 'positive',
        message: 'Fila criada com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao criar fila'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateQueue = async (queueId, queueData) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.put(`/queues/${queueId}`, queueData)
      
      const index = queues.value.findIndex(q => q.id === queueId)
      if (index !== -1) {
        queues.value[index] = data
      }

      $q.notify({
        type: 'positive',
        message: 'Fila atualizada com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao atualizar fila'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteQueue = async (queueId) => {
    try {
      loading.value = true
      error.value = null

      await api.delete(`/queues/${queueId}`)
      queues.value = queues.value.filter(q => q.id !== queueId)

      // Remover da seleção se necessário
      selectedQueues.value = selectedQueues.value.filter(id => id !== queueId)
      saveQueueSelection()

      $q.notify({
        type: 'positive',
        message: 'Fila removida com sucesso',
        position: 'top'
      })

      return true
    } catch (err) {
      error.value = 'Erro ao remover fila'
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleQueueSelection = (queueId) => {
    const index = selectedQueues.value.indexOf(queueId)
    if (index === -1) {
      selectedQueues.value.push(queueId)
    } else {
      selectedQueues.value.splice(index, 1)
    }
    saveQueueSelection()
  }

  const selectAllQueues = () => {
    selectedQueues.value = availableQueues.value.map(q => q.id)
    saveQueueSelection()
  }

  const clearQueueSelection = () => {
    selectedQueues.value = []
    saveQueueSelection()
  }

  const saveQueueSelection = () => {
    localStorage.setItem('selectedQueues', JSON.stringify(selectedQueues.value))
  }

  // Socket handlers
  const handleQueueUpdate = (data) => {
    const index = queues.value.findIndex(q => q.id === data.id)
    if (index !== -1) {
      queues.value[index] = data
    } else {
      queues.value.push(data)
    }
  }

  const handleQueueDelete = (queueId) => {
    queues.value = queues.value.filter(q => q.id !== queueId)
    selectedQueues.value = selectedQueues.value.filter(id => id !== queueId)
    saveQueueSelection()
  }

  // Socket listeners
  const setupSocketListeners = () => {
    socket.value?.on('queue:update', handleQueueUpdate)
    socket.value?.on('queue:delete', handleQueueDelete)
  }

  const removeSocketListeners = () => {
    socket.value?.off('queue:update', handleQueueUpdate)
    socket.value?.off('queue:delete', handleQueueDelete)
  }

  // Lifecycle hooks
  onMounted(() => {
    setupSocketListeners()
    loadQueues()
  })

  onUnmounted(() => {
    removeSocketListeners()
  })

  return {
    // Estado
    queues,
    loading,
    error,
    selectedQueues,

    // Computed
    availableQueues,
    queuesByStatus,
    queueStats,

    // Métodos
    loadQueues,
    createQueue,
    updateQueue,
    deleteQueue,
    toggleQueueSelection,
    selectAllQueues,
    clearQueueSelection
  }
}
