import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'vuex'

export function useAtendimentoFilters() {
  const $q = useQuasar()
  const store = useStore()

  // Estado
  const filterParams = ref({
    searchParam: '',
    pageNumber: 1,
    status: ['open', 'pending', 'closed'],
    showAll: false,
    count: null,
    queuesIds: [],
    withUnreadMessages: false,
    isNotAssignedUser: false,
    includeNotQueueDefined: true
  })

  // Carregar filtros salvos
  const initializeFilters = () => {
    const savedFilters = localStorage.getItem('filtrosAtendimento')
    if (savedFilters) {
      filterParams.value = JSON.parse(savedFilters)
    }
  }

  // Computed
  const hasActiveFilters = computed(() => {
    const { queuesIds, showAll, withUnreadMessages, isNotAssignedUser } = filterParams.value
    return !!(queuesIds?.length || showAll || withUnreadMessages || isNotAssignedUser)
  })

  const userQueues = computed(() => {
    try {
      const queues = JSON.parse(localStorage.getItem('queues'))
      if (!queues) return []
      
      const filasUsuario = queues.map(q => {
        if (q.isActive) {
          return q.id
        }
      }).filter(Boolean)

      const filasCadastradas = JSON.parse(localStorage.getItem('filasCadastradas') || '[]')
      return filasCadastradas.filter(f => filasUsuario.includes(f.id)) || []
    } catch (error) {
      console.error('Erro ao carregar filas do usuário:', error)
      return []
    }
  })

  // Métodos
  const updateFilter = (key, value) => {
    filterParams.value[key] = value
  }

  const resetFilters = () => {
    filterParams.value = {
      searchParam: '',
      pageNumber: 1,
      status: ['open', 'pending', 'closed'],
      showAll: false,
      count: null,
      queuesIds: [],
      withUnreadMessages: false,
      isNotAssignedUser: false,
      includeNotQueueDefined: true
    }
    saveFilters()
  }

  const saveFilters = () => {
    localStorage.setItem('filtrosAtendimento', JSON.stringify(filterParams.value))
    store.commit('SET_FILTER_PARAMS', { ...filterParams.value })
  }

  const toggleStatus = (status) => {
    const index = filterParams.value.status.indexOf(status)
    if (index === -1) {
      filterParams.value.status.push(status)
    } else {
      filterParams.value.status.splice(index, 1)
    }
    saveFilters()
  }

  const toggleShowAll = () => {
    filterParams.value.showAll = !filterParams.value.showAll
    if (filterParams.value.showAll) {
      filterParams.value.queuesIds = []
      filterParams.value.withUnreadMessages = false
      filterParams.value.isNotAssignedUser = false
    }
    saveFilters()
  }

  const updateQueues = (queues) => {
    filterParams.value.queuesIds = queues
    saveFilters()
  }

  // Watch para salvar alterações
  watch(filterParams, () => {
    saveFilters()
  }, { deep: true })

  return {
    // Estado
    filterParams,

    // Computed
    hasActiveFilters,
    userQueues,

    // Métodos
    initializeFilters,
    updateFilter,
    resetFilters,
    saveFilters,
    toggleStatus,
    toggleShowAll,
    updateQueues
  }
}
