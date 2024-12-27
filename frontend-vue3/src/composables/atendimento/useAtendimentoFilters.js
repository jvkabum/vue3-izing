import { ref, computed } from 'vue'

export function useAtendimentoFilters() {
  const filters = ref({
    status: 'open',
    search: '',
    userId: null,
    channel: null,
    date: null,
    tags: []
  })

  const hasActiveFilters = computed(() => {
    return filters.value.search ||
           filters.value.userId ||
           filters.value.channel ||
           filters.value.date ||
           filters.value.tags.length > 0
  })

  function filterTickets(tickets) {
    if (!tickets) return []

    return tickets.filter(ticket => {
      // Filtrar por status
      if (filters.value.status && ticket.status !== filters.value.status) {
        return false
      }

      // Filtrar por usuário
      if (filters.value.userId && ticket.userId !== filters.value.userId) {
        return false
      }

      // Filtrar por canal
      if (filters.value.channel && ticket.channel !== filters.value.channel) {
        return false
      }

      // Filtrar por data
      if (filters.value.date) {
        const ticketDate = new Date(ticket.updatedAt || ticket.createdAt)
        const filterDate = new Date(filters.value.date)
        
        if (ticketDate.toDateString() !== filterDate.toDateString()) {
          return false
        }
      }

      // Filtrar por tags
      if (filters.value.tags.length > 0) {
        const ticketTags = ticket.tags || []
        const hasAllTags = filters.value.tags.every(tag => 
          ticketTags.includes(tag)
        )
        if (!hasAllTags) {
          return false
        }
      }

      // Filtrar por texto de busca
      if (filters.value.search) {
        const searchLower = filters.value.search.toLowerCase()
        const contactName = ticket.contact?.name?.toLowerCase() || ''
        const lastMessage = ticket.lastMessage?.body?.toLowerCase() || ''
        const protocol = ticket.protocol?.toLowerCase() || ''

        return contactName.includes(searchLower) || 
               lastMessage.includes(searchLower) ||
               protocol.includes(searchLower)
      }

      return true
    })
  }

  function setFilter(key, value) {
    filters.value[key] = value
  }

  function addTag(tag) {
    if (!filters.value.tags.includes(tag)) {
      filters.value.tags.push(tag)
    }
  }

  function removeTag(tag) {
    const index = filters.value.tags.indexOf(tag)
    if (index !== -1) {
      filters.value.tags.splice(index, 1)
    }
  }

  function clearFilters() {
    filters.value = {
      status: 'open',
      search: '',
      userId: null,
      channel: null,
      date: null,
      tags: []
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'open':
        return 'positive'
      case 'pending':
        return 'warning'
      case 'closed':
        return 'negative'
      default:
        return 'grey'
    }
  }

  function getChannelIcon(channel) {
    switch (channel?.toLowerCase()) {
      case 'whatsapp':
        return 'mdi-whatsapp'
      case 'instagram':
        return 'mdi-instagram'
      case 'facebook':
        return 'mdi-facebook'
      case 'telegram':
        return 'mdi-telegram'
      default:
        return 'mdi-chat'
    }
  }

  function getChannelColor(channel) {
    switch (channel?.toLowerCase()) {
      case 'whatsapp':
        return 'green'
      case 'instagram':
        return 'purple'
      case 'facebook':
        return 'blue'
      case 'telegram':
        return 'light-blue'
      default:
        return 'grey'
    }
  }

  return {
    filters,
    hasActiveFilters,
    filterTickets,
    setFilter,
    addTag,
    removeTag,
    clearFilters,
    getStatusColor,
    getChannelIcon,
    getChannelColor
  }
}
