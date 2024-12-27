import { ref, computed } from 'vue'

export function useAtendimentoTabs() {
  const activeTab = ref('open')

  const tabs = [
    {
      id: 1,
      name: 'open',
      label: 'Abertos',
      icon: 'mdi-message-text',
      color: 'positive',
      count: 0
    },
    {
      id: 2,
      name: 'pending',
      label: 'Pendentes',
      icon: 'mdi-message-processing',
      color: 'warning',
      count: 0
    },
    {
      id: 3,
      name: 'closed',
      label: 'Resolvidos',
      icon: 'mdi-message-check',
      color: 'negative',
      count: 0
    }
  ]

  const visibleTabs = computed(() => {
    return tabs.map(tab => ({
      ...tab,
      active: tab.name === activeTab.value
    }))
  })

  function updateTabCounts(tickets) {
    const counts = {
      open: 0,
      pending: 0,
      closed: 0
    }

    tickets.forEach(ticket => {
      counts[ticket.status]++
    })

    tabs.forEach(tab => {
      tab.count = counts[tab.name]
    })
  }

  function setActiveTab(tabName) {
    activeTab.value = tabName
  }

  function getTabColor(status) {
    const tab = tabs.find(t => t.name === status)
    return tab ? tab.color : 'grey'
  }

  function getTabIcon(status) {
    const tab = tabs.find(t => t.name === status)
    return tab ? tab.icon : 'mdi-message'
  }

  function getTabLabel(status) {
    const tab = tabs.find(t => t.name === status)
    return tab ? tab.label : 'Desconhecido'
  }

  function getTabCount(status) {
    const tab = tabs.find(t => t.name === status)
    return tab ? tab.count : 0
  }

  function isActiveTab(tabName) {
    return activeTab.value === tabName
  }

  return {
    activeTab,
    visibleTabs,
    updateTabCounts,
    setActiveTab,
    getTabColor,
    getTabIcon,
    getTabLabel,
    getTabCount,
    isActiveTab
  }
}
