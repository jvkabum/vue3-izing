import { ref } from 'vue'

export function useMensagem() {
  const loading = ref(false)
  const abrirFilePicker = ref(false)
  const abrirModalPreviewImagem = ref(false)
  const isRecordingAudio = ref(false)
  const urlMediaPreview = ref('')
  const visualizarMensagensRapidas = ref(false)
  const arquivos = ref([])
  const textChat = ref('')
  const sign = ref(false)
  const scheduleDate = ref(null)

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
      arquivos.value = files
    }
  }

  const mensagemRapidaSelecionada = resposta => {
    textChat.value = resposta.message
    visualizarMensagensRapidas.value = false
  }

  const handleSartRecordingAudio = () => {
    isRecordingAudio.value = true
  }

  const handleStopRecordingAudio = () => {
    isRecordingAudio.value = false
  }

  const handleCancelRecordingAudio = () => {
    isRecordingAudio.value = false
  }

  const prepararUploadMedia = (isSchedule = false) => {
    const formData = new FormData()
    arquivos.value.forEach(file => {
      formData.append('medias', file)
    })
    
    if (isSchedule) {
      formData.append('scheduleDate', scheduleDate.value)
    }

    return formData
  }

  const prepararMensagemTexto = (mensagensRapidas, replyingMessage, isSchedule = false) => {
    if (!textChat.value.trim()) return null

    const message = {
      body: textChat.value
    }

    if (replyingMessage?.id) {
      message.quotedMsg = replyingMessage
    }

    if (isSchedule) {
      message.scheduleDate = scheduleDate.value
    }

    return message
  }

  const handleSign = value => {
    sign.value = value
    localStorage.setItem('sign', value)
  }

  return {
    loading,
    abrirFilePicker,
    abrirModalPreviewImagem,
    isRecordingAudio,
    urlMediaPreview,
    visualizarMensagensRapidas,
    arquivos,
    textChat,
    sign,
    scheduleDate,
    handleInputPaste,
    mensagemRapidaSelecionada,
    handleSartRecordingAudio,
    handleStopRecordingAudio,
    handleCancelRecordingAudio,
    prepararUploadMedia,
    prepararMensagemTexto,
    handleSign
  }
}
