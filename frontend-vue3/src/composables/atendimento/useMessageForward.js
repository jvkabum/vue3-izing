import { ref, computed } from 'vue'
import { useAtendimentoStore } from 'src/stores/atendimento'
import { useAtendimentoNotification } from './useAtendimentoNotification'
import { EnviarMensagem } from 'src/service/tickets'

export function useMessageForward() {
  const store = useAtendimentoStore()
  const notification = useAtendimentoNotification()

  // Estado
  const loading = ref(false)
  const showForwardModal = ref(false)
  const selectedContact = ref(null)
  const messagesToForward = ref([])
  const isMultiForwardEnabled = ref(false)

  // Computed
  const canForward = computed(() => 
    selectedContact.value && messagesToForward.value.length > 0
  )

  const hasMaxMessages = computed(() => 
    messagesToForward.value.length >= 10
  )

  // Métodos
  const openForwardModal = message => {
    if (message) {
      messagesToForward.value = [message]
    }
    showForwardModal.value = true
  }

  const closeForwardModal = () => {
    showForwardModal.value = false
    selectedContact.value = null
    messagesToForward.value = []
    isMultiForwardEnabled.value = false
  }

  const toggleMultiForward = () => {
    isMultiForwardEnabled.value = !isMultiForwardEnabled.value
    if (!isMultiForwardEnabled.value) {
      messagesToForward.value = []
    }
  }

  const addMessageToForward = message => {
    if (hasMaxMessages.value) {
      notification.notifyWarning('Máximo de 10 mensagens atingido')
      return false
    }

    const index = messagesToForward.value.findIndex(m => m.id === message.id)
    if (index === -1) {
      messagesToForward.value.push(message)
      return true
    }
    return false
  }

  const removeMessageFromForward = message => {
    const index = messagesToForward.value.findIndex(m => m.id === message.id)
    if (index !== -1) {
      messagesToForward.value.splice(index, 1)
      return true
    }
    return false
  }

  const isMessageSelected = message => 
    messagesToForward.value.some(m => m.id === message.id)

  const forwardMessages = async () => {
    if (!canForward.value) {
      notification.notifyWarning('Selecione um contato para encaminhar')
      return
    }

    loading.value = true
    try {
      for (const message of messagesToForward.value) {
        const formData = new FormData()

        if (message.mediaUrl) {
          const response = await fetch(message.mediaUrl)
          const blob = await response.blob()
          formData.append('medias', blob, message.mediaName || 'file')
        }

        formData.append('body', message.body)
        formData.append('contactId', selectedContact.value.id)
        formData.append('fromMe', true)

        await EnviarMensagem(formData)
      }

      notification.notifySuccess(
        `Mensagem(ns) encaminhada(s) para ${selectedContact.value.name}`
      )
      closeForwardModal()
    } catch {
      notification.notifyError('Erro ao encaminhar mensagem(ns)')
    } finally {
      loading.value = false
    }
  }

  return {
    // Estado
    loading,
    showForwardModal,
    selectedContact,
    messagesToForward,
    isMultiForwardEnabled,
    canForward,
    hasMaxMessages,

    // Métodos
    openForwardModal,
    closeForwardModal,
    toggleMultiForward,
    addMessageToForward,
    removeMessageFromForward,
    isMessageSelected,
    forwardMessages
  }
}
