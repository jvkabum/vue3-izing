import { ref, onMounted, watch } from 'vue'

/**
 * Composable para gerenciar os filtros de atendimento
 * @returns {Object} Objeto contendo estados e métodos para gerenciar filtros
 */
export function useAtendimentoFilters() {
  // Estado dos filtros
  const filterParams = ref({
    searchParam: '',
    pageNumber: 1,
    status: ['open', 'pending'], // Status padrão
    showAll: false,
    count: null,
    queuesIds: [],
    withUnreadMessages: false,
    isNotAssignedUser: false,
    includeNotQueueDefined: true
  })

  // Filas disponíveis para o usuário
  const userQueues = ref([])

  /**
   * Carrega as filas do usuário do localStorage
   */
  const loadUserQueues = () => {
    try {
      const queues = JSON.parse(localStorage.getItem('queues') || '[]')
      const filasCadastradas = JSON.parse(localStorage.getItem('filasCadastradas') || '[]')
      
      // Mapeia as filas com seus nomes
      userQueues.value = queues.map(queue => {
        const fila = filasCadastradas.find(f => f.id === queue.id)
        return {
          id: queue.id,
          queue: fila?.queue || `Fila ${queue.id}`
        }
      })
    } catch (error) {
      console.error('Erro ao carregar filas:', error)
      userQueues.value = []
    }
  }

  /**
   * Carrega os filtros salvos do localStorage
   */
  const loadSavedFilters = () => {
    try {
      const savedFilters = JSON.parse(localStorage.getItem('filtrosAtendimento'))
      if (savedFilters) {
        filterParams.value = {
          ...filterParams.value,
          ...savedFilters
        }
      }
    } catch (error) {
      console.error('Erro ao carregar filtros salvos:', error)
    }
  }

  /**
   * Salva os filtros atuais no localStorage
   */
  const saveFilters = () => {
    localStorage.setItem('filtrosAtendimento', JSON.stringify(filterParams.value))
  }

  /**
   * Reseta os filtros para os valores padrão
   */
  const resetFilters = () => {
    filterParams.value = {
      searchParam: '',
      pageNumber: 1,
      status: ['open', 'pending'],
      showAll: false,
      count: null,
      queuesIds: [],
      withUnreadMessages: false,
      isNotAssignedUser: false,
      includeNotQueueDefined: true
    }
    saveFilters()
  }

  // Watch para salvar filtros quando mudarem
  watch(filterParams, () => {
    saveFilters()
  }, { deep: true })

  // Carrega dados ao montar o componente
  onMounted(() => {
    loadUserQueues()
    loadSavedFilters()
  })

  return {
    filterParams,
    userQueues,
    loadUserQueues,
    loadSavedFilters,
    saveFilters,
    resetFilters
  }
}
