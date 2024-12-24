import { ref, computed } from 'vue'

/**
 * Composable para gerenciar as tabs de atendimento
 * @returns {Object} Objeto contendo estados e métodos das tabs
 */
export function useAtendimentoTabs() {
  // Estado
  const selectedTab = ref('open')
  const loading = ref(false)
  const tickets = ref([])

  /**
   * Configuração das tabs disponíveis
   */
  const availableTabs = computed(() => [
    {
      name: 'open',
      label: 'Abertos',
      color: 'primary',
      count: openTickets.value.length
    },
    {
      name: 'pending',
      label: 'Pendentes',
      color: 'negative',
      count: pendingTickets.value.length
    },
    {
      name: 'closed',
      label: 'Resolvidos',
      color: 'positive',
      count: closedTickets.value.length
    },
    {
      name: 'group',
      label: 'Grupos',
      color: 'blue',
      count: groupTickets.value.length
    }
  ])

  /**
   * Filtra tickets por status aberto
   */
  const openTickets = computed(() => 
    tickets.value.filter(ticket => 
      ticket.status === 'open' && !ticket.isGroup
    )
  )

  /**
   * Filtra tickets por status pendente
   */
  const pendingTickets = computed(() => 
    tickets.value.filter(ticket => 
      ticket.status === 'pending' && !ticket.isGroup
    )
  )

  /**
   * Filtra tickets por status fechado
   */
  const closedTickets = computed(() => 
    tickets.value.filter(ticket => 
      ticket.status === 'closed' && !ticket.isGroup
    )
  )

  /**
   * Filtra tickets de grupo
   */
  const groupTickets = computed(() => 
    tickets.value.filter(ticket => 
      ticket.isGroup
    )
  )

  /**
   * Seleciona a primeira tab disponível com tickets
   */
  const selectFirstAvailableTab = () => {
    const tabsOrder = ['open', 'pending', 'closed', 'group']
    const ticketCounts = {
      open: openTickets.value.length,
      pending: pendingTickets.value.length,
      closed: closedTickets.value.length,
      group: groupTickets.value.length
    }

    for (const tab of tabsOrder) {
      if (ticketCounts[tab] > 0) {
        selectedTab.value = tab
        return
      }
    }

    // Se não houver tickets, seleciona a primeira tab
    selectedTab.value = tabsOrder[0]
  }

  /**
   * Atualiza a lista de tickets
   * @param {Array} newTickets - Nova lista de tickets
   */
  const updateTickets = (newTickets) => {
    tickets.value = newTickets
  }

  /**
   * Define o estado de carregamento
   * @param {boolean} state - Estado de loading
   */
  const setLoading = (state) => {
    loading.value = state
  }

  return {
    // Estado
    selectedTab,
    loading,
    
    // Computed
    availableTabs,
    openTickets,
    pendingTickets,
    closedTickets,
    groupTickets,
    
    // Métodos
    selectFirstAvailableTab,
    updateTickets,
    setLoading
  }
}
