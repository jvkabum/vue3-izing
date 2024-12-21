import { ref, computed } from 'vue'

export function useAtendimentoTabs() {
  // Estado
  const selectedTab = ref('open')
  const loading = ref(false)
  const tickets = ref({
    open: [],
    pending: [],
    closed: [],
    group: []
  })

  // Computed properties
  const availableTabs = computed(() => [
    {
      name: 'open',
      label: 'Em Aberto',
      count: tickets.value.open.length,
      color: 'primary'
    },
    {
      name: 'pending',
      label: 'Pendentes',
      count: tickets.value.pending.length,
      color: 'orange'
    },
    {
      name: 'closed',
      label: 'Resolvidos',
      count: tickets.value.closed.length,
      color: 'green'
    },
    {
      name: 'group',
      label: 'Grupo',
      count: tickets.value.group.length,
      color: 'purple'
    }
  ])

  const openTickets = computed(() => tickets.value.open)
  const pendingTickets = computed(() => tickets.value.pending)
  const closedTickets = computed(() => tickets.value.closed)
  const groupTickets = computed(() => tickets.value.group)

  // Métodos
  const selectFirstAvailableTab = () => {
    const firstTabWithTickets = availableTabs.value.find(tab => tickets.value[tab.name].length > 0)
    if (firstTabWithTickets) {
      selectedTab.value = firstTabWithTickets.name
    }
  }

  const updateTickets = (newTickets) => {
    tickets.value = {
      open: newTickets.filter(t => t.status === 'open'),
      pending: newTickets.filter(t => t.status === 'pending'),
      closed: newTickets.filter(t => t.status === 'closed'),
      group: newTickets.filter(t => t.isGroup)
    }
  }

  const setLoading = (value) => {
    loading.value = value
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
