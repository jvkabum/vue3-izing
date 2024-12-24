import { ref, computed } from 'vue'
import { useQuasar, uid, LocalStorage } from 'quasar'
import { useChat } from './useChat'
import { useTicketStatus } from './useTicketStatus'

/**
 * Composable para gerenciar input de mensagens
 * @param {Object} options - Opções de configuração
 * @returns {Object} Objeto contendo estados e métodos do input
 */
export function useMessageInput({ emit }) {
  const $q = useQuasar()
  const { sendMessage: sendChatMessage, scrollToBottom } = useChat()
  const { ticketStatus } = useTicketStatus()

  // Estado
  const loading = ref(false)
  const messageText = ref('')
  const files = ref([])
  const sign = ref(LocalStorage.getItem('sign') ?? false)
  const scheduleDate = ref(null)
  const showQuickMessages = ref(false)
  const showMediaPreview = ref(false)
  const mediaPreview = ref({ title: '', src: '' })
  const isRecordingAudio = ref(false)
  const inputRef = ref(null)

  /**
   * Computed
   */
  const showFileUpload = computed(() => files.value.length > 0)
  
  const isActionsDisabled = computed(() => 
    isRecordingAudio.value || ticketStatus.value !== 'open'
  )

  /**
   * Manipula seleção de mensagem rápida
   */
  const handleQuickMessageSelect = (message) => {
    messageText.value = message.message
    setTimeout(() => {
      inputRef.value?.focus()
    }, 300)
  }

  /**
   * Manipula estado da assinatura
   */
  const handleSign = (state) => {
    sign.value = state
    LocalStorage.set('sign', state)
  }

  /**
   * Manipula colagem de arquivos
   */
  const handlePaste = async (event) => {
    const file = event.clipboardData.files[0]
    if (file) {
      messageText.value = ''
      files.value = [file]
      showMediaPreview.value = true
      mediaPreview.value = {
        title: `Enviar imagem`,
        src: URL.createObjectURL(file)
      }
    }
  }

  /**
   * Prepara mensagem de texto
   */
  const prepareTextMessage = () => {
    let text = messageText.value.trim()
    if (!text) throw new Error('Mensagem vazia')

    if (sign.value) {
      const username = LocalStorage.getItem('username')
      text = `*${username}*:\n ${text}`
    }

    return {
      id: uid(),
      body: text,
      fromMe: true,
      scheduleDate: scheduleDate.value,
      quotedMsg: null // Será definido pelo componente
    }
  }

  /**
   * Prepara mensagem com arquivo
   */
  const prepareFileMessage = () => {
    const formData = new FormData()
    files.value.forEach(file => {
      formData.append('medias', file)
      formData.append('body', file.name)
    })
    
    if (scheduleDate.value) {
      formData.append('scheduleDate', scheduleDate.value)
    }
    
    return formData
  }

  /**
   * Prepara mensagem para envio
   */
  const prepareMessage = () => {
    if (showFileUpload.value) {
      return prepareFileMessage()
    }
    return prepareTextMessage()
  }

  /**
   * Reseta formulário
   */
  const resetForm = () => {
    messageText.value = ''
    files.value = []
    showMediaPreview.value = false
    mediaPreview.value = { title: '', src: '' }
    emit('update:replyingMessage', null)
  }

  /**
   * Envia mensagem
   */
  const sendMessage = async () => {
    if (scheduleDate.value && !scheduleDate.value) {
      $q.notify({
        type: 'warning',
        message: 'Para agendar uma mensagem, informe a data/hora.',
        position: 'top'
      })
      return
    }

    try {
      loading.value = true
      
      const message = prepareMessage()
      await sendChatMessage(message)
      
      resetForm()
      scrollToBottom()
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao enviar mensagem',
        position: 'top',
        timeout: 5000
      })
    } finally {
      loading.value = false
    }
  }

  /**
   * Manipula arquivos rejeitados
   */
  const handleRejectedFiles = (rejectedEntries) => {
    $q.notify({
      type: 'negative',
      message: `${rejectedEntries.length} arquivo(s) rejeitado(s)`,
      caption: 'Verifique o tamanho e formato dos arquivos',
      position: 'top',
      timeout: 5000
    })
  }

  return {
    // Estado
    loading,
    messageText,
    files,
    sign,
    scheduleDate,
    showQuickMessages,
    showMediaPreview,
    mediaPreview,
    isRecordingAudio,
    inputRef,

    // Computed
    showFileUpload,
    isActionsDisabled,

    // Métodos
    handleQuickMessageSelect,
    handleSign,
    handlePaste,
    sendMessage,
    resetForm,
    handleRejectedFiles
  }
}
