import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAtendimentoStore } from 'src/stores/atendimento'
import { useAtendimentoNotification } from './useAtendimentoNotification'
import { EnviarMensagem, DeletarMensagem, EditarMensagem } from 'src/service/tickets'

export function useAtendimentoMessages() {
  const $q = useQuasar()
  const store = useAtendimentoStore()
  const notification = useAtendimentoNotification()

  // Estado
  const loading = ref(false)
  const replyingMessage = ref(null)
  const editingMessage = ref(null)
  const showEmojiPicker = ref(false)
  const messageText = ref('')
  const attachments = ref([])
  const isRecording = ref(false)

  // Computed
  const messages = computed(() => store.messages)
  const ticketFocado = computed(() => store.ticketFocado)
  const canSendMessage = computed(() => 
    ticketFocado.value?.status === 'open' && 
    (messageText.value.trim() || attachments.value.length > 0)
  )

  // Métodos
  const sendMessage = async () => {
    if (!canSendMessage.value) return

    loading.value = true
    try {
      const formData = new FormData()
      
      if (messageText.value.trim()) {
        formData.append('body', messageText.value.trim())
      }

      attachments.value.forEach(file => {
        formData.append('medias', file)
      })

      if (replyingMessage.value) {
        formData.append('quotedMsg', JSON.stringify(replyingMessage.value))
      }

      await EnviarMensagem(ticketFocado.value.id, formData)
      
      // Limpar campos
      messageText.value = ''
      attachments.value = []
      replyingMessage.value = null
      showEmojiPicker.value = false

      notification.notifySuccess('Mensagem enviada com sucesso')
    } catch (error) {
      notification.notifyError('Erro ao enviar mensagem')
    } finally {
      loading.value = false
    }
  }

  const editMessage = async (messageId, newText) => {
    loading.value = true
    try {
      await EditarMensagem({
        id: messageId,
        body: newText
      })
      editingMessage.value = null
      notification.notifySuccess('Mensagem editada com sucesso')
    } catch (error) {
      notification.notifyError('Erro ao editar mensagem')
    } finally {
      loading.value = false
    }
  }

  const deleteMessage = async messageId => {
    try {
      await $q.dialog({
        title: 'Confirmação',
        message: 'Deseja realmente apagar esta mensagem?',
        cancel: true,
        persistent: true
      })

      loading.value = true
      await DeletarMensagem({ id: messageId })
      notification.notifySuccess('Mensagem apagada com sucesso')
    } catch (error) {
      if (error) { // Se não for cancelamento do diálogo
        notification.notifyError('Erro ao apagar mensagem')
      }
    } finally {
      loading.value = false
    }
  }

  const setReplyingMessage = message => {
    replyingMessage.value = message
  }

  const clearReplyingMessage = () => {
    replyingMessage.value = null
  }

  const setEditingMessage = message => {
    editingMessage.value = message
    messageText.value = message.body
  }

  const clearEditingMessage = () => {
    editingMessage.value = null
    messageText.value = ''
  }

  const addAttachment = file => {
    attachments.value.push(file)
  }

  const removeAttachment = index => {
    attachments.value.splice(index, 1)
  }

  const toggleEmojiPicker = () => {
    showEmojiPicker.value = !showEmojiPicker.value
  }

  const addEmoji = emoji => {
    messageText.value += emoji
  }

  const startRecording = () => {
    isRecording.value = true
  }

  const stopRecording = () => {
    isRecording.value = false
  }

  return {
    // Estado
    loading,
    replyingMessage,
    editingMessage,
    showEmojiPicker,
    messageText,
    attachments,
    isRecording,

    // Computed
    messages,
    ticketFocado,
    canSendMessage,

    // Métodos
    sendMessage,
    editMessage,
    deleteMessage,
    setReplyingMessage,
    clearReplyingMessage,
    setEditingMessage,
    clearEditingMessage,
    addAttachment,
    removeAttachment,
    toggleEmojiPicker,
    addEmoji,
    startRecording,
    stopRecording
  }
}
