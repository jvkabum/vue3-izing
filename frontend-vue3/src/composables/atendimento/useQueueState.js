import { ref, computed } from 'vue'
import { useAtendimentoNotification } from './useAtendimentoNotification'
import { useQueueStore } from 'src/stores/queue'

export function useQueueState() {
  const queueStore = useQueueStore()
  const notification = useAtendimentoNotification()

  // Estado
  const loading = ref(false)
  const selectedQueues = ref([])
  const showQueueModal = ref(false)
  const searchQuery = ref('')

  // Computed
  const queues = computed(() => queueStore.queues)

  const filteredQueues = computed(() => {
    if (!searchQuery.value) return queues.value

    const query = searchQuery.value.toLowerCase()
    return queues.value.filter(queue => 
      queue.name?.toLowerCase().includes(query) ||
      queue.description?.toLowerCase().includes(query)
    )
  })

  const selectedQueueNames = computed(() => 
    selectedQueues.value.map(queueId => {
      const queue = queues.value.find(q => q.id === queueId)
      return queue?.name || ''
    }).filter(Boolean)
  )

  // Métodos
  const loadQueues = async () => {
    loading.value = true
    try {
      await queueStore.fetchQueues()
    } catch {
      notification.notifyError('Erro ao carregar filas')
    } finally {
      loading.value = false
    }
  }

  const setSearchQuery = query => {
    searchQuery.value = query
  }

  const toggleQueue = queueId => {
    const index = selectedQueues.value.indexOf(queueId)
    if (index === -1) {
      selectedQueues.value.push(queueId)
    } else {
      selectedQueues.value.splice(index, 1)
    }
  }

  const selectQueue = queueId => {
    selectedQueues.value = [queueId]
  }

  const selectMultipleQueues = queueIds => {
    selectedQueues.value = [...queueIds]
  }

  const clearSelectedQueues = () => {
    selectedQueues.value = []
  }

  const openQueueModal = () => {
    showQueueModal.value = true
  }

  const closeQueueModal = () => {
    showQueueModal.value = false
  }

  const isQueueSelected = queueId => 
    selectedQueues.value.includes(queueId)

  const resetState = () => {
    selectedQueues.value = []
    showQueueModal.value = false
    searchQuery.value = ''
  }

  return {
    // Estado
    loading,
    selectedQueues,
    showQueueModal,
    searchQuery,

    // Computed
    queues,
    filteredQueues,
    selectedQueueNames,

    // Métodos
    loadQueues,
    setSearchQuery,
    toggleQueue,
    selectQueue,
    selectMultipleQueues,
    clearSelectedQueues,
    openQueueModal,
    closeQueueModal,
    isQueueSelected,
    resetState
  }
}
