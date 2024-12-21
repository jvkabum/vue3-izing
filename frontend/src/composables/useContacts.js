import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '../services/api'
import { useSocket } from './useSocket'
import { useAuth } from './useAuth'

export function useContacts() {
  // Composables
  const $q = useQuasar()
  const { socket } = useSocket()
  const { isAdmin } = useAuth()

  // Estado
  const contacts = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchTerm = ref('')
  const filters = ref({
    tags: [],
    queues: [],
    status: 'all',
    assignedUser: null,
    dateRange: null
  })
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true
  })

  // Computed
  const filteredContacts = computed(() => {
    let result = [...contacts.value]

    // Busca
    if (searchTerm.value) {
      const search = searchTerm.value.toLowerCase()
      result = result.filter(contact => 
        contact.name?.toLowerCase().includes(search) ||
        contact.number?.includes(search) ||
        contact.email?.toLowerCase().includes(search)
      )
    }

    // Tags
    if (filters.value.tags.length) {
      result = result.filter(contact => 
        contact.tags?.some(tag => 
          filters.value.tags.includes(tag.id)
        )
      )
    }

    // Filas
    if (filters.value.queues.length) {
      result = result.filter(contact => 
        contact.queues?.some(queue => 
          filters.value.queues.includes(queue.id)
        )
      )
    }

    // Status
    if (filters.value.status !== 'all') {
      result = result.filter(contact => 
        contact.status === filters.value.status
      )
    }

    // Usuário atribuído
    if (filters.value.assignedUser) {
      result = result.filter(contact => 
        contact.assignedUser?.id === filters.value.assignedUser
      )
    }

    // Data
    if (filters.value.dateRange) {
      const [start, end] = filters.value.dateRange
      result = result.filter(contact => {
        const date = new Date(contact.createdAt)
        return date >= start && date <= end
      })
    }

    return result
  })

  const groupedContacts = computed(() => {
    const groups = {}
    filteredContacts.value.forEach(contact => {
      const firstLetter = contact.name?.[0]?.toUpperCase() || '#'
      if (!groups[firstLetter]) {
        groups[firstLetter] = []
      }
      groups[firstLetter].push(contact)
    })
    return groups
  })

  // Métodos
  const loadContacts = async (params = {}) => {
    try {
      loading.value = true
      error.value = null

      const searchParams = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...filters.value,
        ...params
      }

      const { data } = await api.get('/contacts', { params: searchParams })
      
      if (searchParams.page === 1) {
        contacts.value = data.contacts
      } else {
        contacts.value = [...contacts.value, ...data.contacts]
      }

      pagination.value = {
        ...pagination.value,
        total: data.count,
        hasMore: data.hasMore
      }

      return data
    } catch (err) {
      error.value = 'Erro ao carregar contatos'
      console.error('Erro ao carregar contatos:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createContact = async (contactData) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.post('/contacts', contactData)
      contacts.value.unshift(data)

      $q.notify({
        type: 'positive',
        message: 'Contato criado com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao criar contato'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateContact = async (contactId, contactData) => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.put(`/contacts/${contactId}`, contactData)
      
      const index = contacts.value.findIndex(c => c.id === contactId)
      if (index !== -1) {
        contacts.value[index] = data
      }

      $q.notify({
        type: 'positive',
        message: 'Contato atualizado com sucesso',
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao atualizar contato'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteContact = async (contactId) => {
    try {
      loading.value = true
      error.value = null

      await api.delete(`/contacts/${contactId}`)
      contacts.value = contacts.value.filter(c => c.id !== contactId)

      $q.notify({
        type: 'positive',
        message: 'Contato removido com sucesso',
        position: 'top'
      })

      return true
    } catch (err) {
      error.value = 'Erro ao remover contato'
      throw err
    } finally {
      loading.value = false
    }
  }

  const importContacts = async (file, options = {}) => {
    try {
      loading.value = true
      error.value = null

      const formData = new FormData()
      formData.append('file', file)
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, value)
      })

      const { data } = await api.post('/contacts/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      $q.notify({
        type: 'positive',
        message: `${data.imported} contatos importados com sucesso`,
        position: 'top'
      })

      return data
    } catch (err) {
      error.value = 'Erro ao importar contatos'
      throw err
    } finally {
      loading.value = false
    }
  }

  const exportContacts = async (format = 'csv') => {
    try {
      loading.value = true
      error.value = null

      const { data } = await api.get('/contacts/export', {
        params: { format },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = `contatos.${format}`
      link.click()
      window.URL.revokeObjectURL(url)

      return true
    } catch (err) {
      error.value = 'Erro ao exportar contatos'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateFilters = (newFilters) => {
    filters.value = {
      ...filters.value,
      ...newFilters
    }
    pagination.value.page = 1
    return loadContacts()
  }

  const loadMore = () => {
    if (!pagination.value.hasMore || loading.value) return

    pagination.value.page++
    return loadContacts()
  }

  // Socket handlers
  const handleContactUpdate = (data) => {
    const index = contacts.value.findIndex(c => c.id === data.id)
    if (index !== -1) {
      contacts.value[index] = data
    } else {
      contacts.value.unshift(data)
    }
  }

  const handleContactDelete = (contactId) => {
    contacts.value = contacts.value.filter(c => c.id !== contactId)
  }

  // Socket listeners
  const setupSocketListeners = () => {
    socket.value?.on('contact:update', handleContactUpdate)
    socket.value?.on('contact:delete', handleContactDelete)
  }

  const removeSocketListeners = () => {
    socket.value?.off('contact:update', handleContactUpdate)
    socket.value?.off('contact:delete', handleContactDelete)
  }

  // Lifecycle
  onMounted(() => {
    setupSocketListeners()
    loadContacts()
  })

  onUnmounted(() => {
    removeSocketListeners()
  })

  return {
    // Estado
    contacts,
    loading,
    error,
    searchTerm,
    filters,
    pagination,

    // Computed
    filteredContacts,
    groupedContacts,

    // Métodos
    loadContacts,
    createContact,
    updateContact,
    deleteContact,
    importContacts,
    exportContacts,
    updateFilters,
    loadMore
  }
}
