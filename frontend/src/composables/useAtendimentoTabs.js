import { ref, computed } from 'vue'
import { useStore } from 'vuex'

export function useAtendimentoTabs() {
  const store = useStore()
  
  // Estado
  const selectedTab = ref('open')
  const loading = ref(false)

  // Computed
  const tickets = computed(() => store.getters.tickets)

  const openTickets = computed(() => 
    tickets.value.filter(ticket => 
      ticket.status === 'open' && !ticket.isGroup
    )
  )

  const pendingTickets = computed(() => 
    tickets.value.filter(ticket => 
      ticket.status === 'pending' && !ticket.isGroup
    )
  )

  const closedTickets = computed(() => 
    tickets.value.filter(ticket => 
      ticket.status === 'closed' && !ticket.isGroup
    )
  )

  const groupTickets = computed(() => 
    tickets.value.filter(ticket => 
      ticket.isGroup
    )
  )

  const availableTabs = computed(() => {
    const tabs = []

    if (openTickets.value.length > 0) {
      tabs.push({
        name: 'open',
        label: 'Abertos',
        count: openTickets.value.length,
        color: 'red'
      })
    }

    if (pendingTickets.value.length > 0) {
      tabs.push({
        name: 'pending',
        label: 'Pendentes',
        count: pendingTickets.value.length,
        color: 'red'
      })
    }

    if (closedTickets.value.length > 0) {
      tabs.push({
        name: 'closed',
        label: 'Fechados',
        count: closedTickets.value.length,
        color: 'red'
      })
    }

    if (groupTickets.value.length > 0) {
      tabs.push({
        name: 'group',
        label: 'Grupos',
        count: groupTickets.value.length,
        color: 'red'
      })
    }

    return tabs
  })

  const currentTabTickets = computed(() => {
    switch (selectedTab.value) {
      case 'open':
        return openTickets.value
      case 'pending':
        return pendingTickets.value
      case 'closed':
        return closedTickets.value
      case 'group':
        return groupTickets.value
      default:
        return []
    }
  })

  // Métodos
  const changeTab = (tabName) => {
    if (availableTabs.value.some(tab => tab.name === tabName)) {
      selectedTab.value = tabName
    }
  }

  const selectFirstAvailableTab = () => {
    if (availableTabs.value.length > 0) {
      selectedTab.value = availableTabs.value[0].name
    }
  }

  // Watch para tickets
  watch(tickets, () => {
    // Se a tab atual não tem mais tickets, selecionar primeira tab disponível
    if (currentTabTickets.value.length === 0) {
      selectFirstAvailableTab()
    }
  })

  return {
    // Estado
    selectedTab,
    loading,

    // Computed
    availableTabs,
    currentTabTickets,
    openTickets,
    pendingTickets,
    closedTickets,
    groupTickets,

    // Métodos
    changeTab,
    selectFirstAvailableTab
  }
}
