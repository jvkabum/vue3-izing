import { ref, computed } from 'vue'
import { useAtendimentoNotification } from './useAtendimentoNotification'
import { ListarContatos } from 'src/service/contatos'
import { useMessageFormat } from './useMessageFormat'

export function useContactState() {
  const notification = useAtendimentoNotification()
  const { formatPhoneNumber } = useMessageFormat()

  // Estado
  const loading = ref(false)
  const contacts = ref([])
  const selectedContact = ref(null)
  const showContactModal = ref(false)
  const searchQuery = ref('')

  // Computed
  const filteredContacts = computed(() => {
    if (!searchQuery.value) return contacts.value

    const query = searchQuery.value.toLowerCase()
    return contacts.value.filter(contact => 
      contact.name?.toLowerCase().includes(query) ||
      contact.number?.toLowerCase().includes(query)
    )
  })

  const formattedContacts = computed(() => 
    filteredContacts.value.map(contact => ({
      ...contact,
      formattedNumber: formatPhoneNumber(contact.number)
    }))
  )

  // Métodos
  const searchContacts = async search => {
    if (search.length < 2) {
      if (contacts.value.length) {
        contacts.value = [...contacts.value]
      }
      return
    }

    loading.value = true
    try {
      const { data } = await ListarContatos({
        searchParam: search
      })
      contacts.value = data.contacts
    } catch {
      notification.notifyError('Erro ao buscar contatos')
    } finally {
      loading.value = false
    }
  }

  const setSearchQuery = query => {
    searchQuery.value = query
  }

  const selectContact = contact => {
    selectedContact.value = contact
  }

  const clearSelectedContact = () => {
    selectedContact.value = null
  }

  const openContactModal = () => {
    showContactModal.value = true
  }

  const closeContactModal = () => {
    showContactModal.value = false
    clearSelectedContact()
  }

  const handleContactCreated = contact => {
    contacts.value.unshift(contact)
    selectContact(contact)
    closeContactModal()
    notification.notifySuccess('Contato criado com sucesso')
  }

  const handleContactUpdated = contact => {
    const index = contacts.value.findIndex(c => c.id === contact.id)
    if (index !== -1) {
      contacts.value[index] = contact
      notification.notifySuccess('Contato atualizado com sucesso')
    }
  }

  const resetState = () => {
    contacts.value = []
    selectedContact.value = null
    showContactModal.value = false
    searchQuery.value = ''
  }

  return {
    // Estado
    loading,
    contacts,
    selectedContact,
    showContactModal,
    searchQuery,

    // Computed
    filteredContacts,
    formattedContacts,

    // Métodos
    searchContacts,
    setSearchQuery,
    selectContact,
    clearSelectedContact,
    openContactModal,
    closeContactModal,
    handleContactCreated,
    handleContactUpdated,
    resetState
  }
}
