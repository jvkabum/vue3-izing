import { ref, computed } from 'vue'
import { useStore } from 'src/stores'
import { EnviarMensagemTexto } from 'src/service/tickets'

export function useMessageInput() {
  const store = useStore()
  const loading = ref(false)
  const messageText = ref('')
  const attachments = ref([])
  const showEmojiPicker = ref(false)
  const sign = ref(localStorage.getItem('sign') === 'true')

  const ticketFocado = computed(() => store.getters.ticketFocado)
  const canSendMessage = computed(() => ticketFocado.value?.status === 'open')

  const handleInputPaste = async event => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items
    const files = []

    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile()
        files.push(file)
      }
    }

    if (files.length) {
      event.preventDefault()
      attachments.value = files
    }
  }

  const addEmoji = emoji => {
    if (!emoji.data) return
    messageText.value += emoji.data
  }

  const sendMessage = async (ticketId, message) => {
    if (!message || !canSendMessage.value) return

    try {
      loading.value = true
      await EnviarMensagemTexto(ticketId, message)
      
      messageText.value = ''
      attachments.value = []
      
      window.dispatchEvent(new CustomEvent('scrollToBottomMessageChat'))
    } catch (error) {
      throw new Error('Erro ao enviar mensagem: ' + error.message)
    } finally {
      loading.value = false
    }
  }

  const handleSign = value => {
    sign.value = value
    localStorage.setItem('sign', value)
  }

  return {
    loading,
    messageText,
    attachments,
    showEmojiPicker,
    sign,
    ticketFocado,
    canSendMessage,
    handleInputPaste,
    addEmoji,
    sendMessage,
    handleSign
  }
}
