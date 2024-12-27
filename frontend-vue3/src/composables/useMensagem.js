import { ref, onMounted, onBeforeUnmount } from 'vue'
import { uid, LocalStorage } from 'quasar'
import { api } from 'src/boot/axios'
import MicRecorder from 'mic-recorder-to-mp3'

const Mp3Recorder = new MicRecorder({ bitRate: 128 })

export function useMensagem() {
  const loading = ref(false)
  const abrirFilePicker = ref(false)
  const abrirModalPreviewImagem = ref(false)
  const isRecordingAudio = ref(false)
  const urlMediaPreview = ref({
    title: '',
    src: ''
  })
  const visualizarMensagensRapidas = ref(false)
  const arquivos = ref([])
  const textChat = ref('')
  const sign = ref(false)
  const scheduleDate = ref(null)

  const openFilePreview = (event) => {
    const data = event.clipboardData.files[0]
    const urlImg = window.URL.createObjectURL(data)
    return urlImg
  }

  const handleInputPaste = (e, destinatario) => {
    if (!destinatario?.id) return
    if (e.clipboardData.files[0]) {
      textChat.value = ''
      arquivos.value = [e.clipboardData.files[0]]
      abrirModalPreviewImagem.value = true
      urlMediaPreview.value = {
        title: `Enviar imagem para ${destinatario?.name}`,
        src: openFilePreview(e)
      }
    }
  }

  const mensagemRapidaSelecionada = (mensagem) => {
    if (mensagem.id) {
      mensagem.message = mensagem.message.replace(/^\[\d+\] - /, '')
      mensagem.message = `[${mensagem.id}] - ` + mensagem.message
    }
    textChat.value = mensagem.message
  }

  const handleSartRecordingAudio = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      await Mp3Recorder.start()
      isRecordingAudio.value = true
    } catch (error) {
      isRecordingAudio.value = false
    }
  }

  const handleStopRecordingAudio = async (destinatarioId, isScheduleDate) => {
    loading.value = true
    try {
      const [, blob] = await Mp3Recorder.stop().getMp3()
      if (blob.size < 10000) {
        loading.value = false
        isRecordingAudio.value = false
        return
      }

      const formData = new FormData()
      const filename = `${new Date().getTime()}.mp3`
      formData.append('medias', blob, filename)
      formData.append('body', filename)
      formData.append('fromMe', true)
      formData.append('id', uid())
      if (isScheduleDate) {
        formData.append('scheduleDate', scheduleDate.value)
      }

      await api.post(`/messages/${destinatarioId}`, formData)
      
      arquivos.value = []
      textChat.value = ''
      abrirFilePicker.value = false
      abrirModalPreviewImagem.value = false
      isRecordingAudio.value = false
      loading.value = false
      
      return true
    } catch (error) {
      isRecordingAudio.value = false
      loading.value = false
      throw error
    }
  }

  const handleCancelRecordingAudio = async () => {
    try {
      await Mp3Recorder.stop().getMp3()
      isRecordingAudio.value = false
      loading.value = false
    } catch (error) {
      throw error
    }
  }

  const prepararUploadMedia = (isScheduleDate) => {
    if (!arquivos.value.length) {
      throw new Error('Não existem arquivos para envio')
    }
    const formData = new FormData()
    formData.append('fromMe', true)
    formData.append('id', uid())
    arquivos.value.forEach(media => {
      formData.append('medias', media)
      formData.append('body', media.name)
      if (isScheduleDate) {
        formData.append('scheduleDate', scheduleDate.value)
      }
    })
    return formData
  }

  const prepararMensagemTexto = (mensagensRapidas, replyingMessage, isScheduleDate) => {
    if (textChat.value.trim() === '') {
      throw new Error('Mensagem Inexistente')
    }

    if (textChat.value.trim() && textChat.value.trim().startsWith('/')) {
      let search = textChat.value.trim().toLowerCase()
      search = search.replace('/', '')
      const mensagemRapida = mensagensRapidas.find(m => m.key.toLowerCase() === search)
      if (mensagemRapida?.message) {
        textChat.value = mensagemRapida.message
      } else {
        const error = mensagensRapidas.length > 1
          ? 'Várias mensagens rápidas encontradas. Selecione uma ou digite uma chave única da mensagem.'
          : '/ indica que você deseja enviar uma mensagem rápida, mas nenhuma foi localizada. Cadastre ou apague a / e digite sua mensagem.'
        throw new Error(error)
      }
    }

    let mensagem = textChat.value.trim()
    const username = localStorage.getItem('username')
    if (username && sign.value) {
      mensagem = `*${username}*:\n ${mensagem}`
    }

    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: '',
      body: mensagem,
      scheduleDate: isScheduleDate ? scheduleDate.value : null,
      quotedMsg: replyingMessage,
      id: uid()
    }

    return message
  }

  const enviarMensagem = async (destinatarioId, mensagem) => {
    try {
      loading.value = true
      const { data } = await api.post(`/messages/${destinatarioId}`, mensagem)
      return data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const handleSign = (state) => {
    sign.value = state
    LocalStorage.set('sign', sign.value)
  }

  onMounted(() => {
    if (![null, undefined].includes(LocalStorage.getItem('sign'))) {
      handleSign(LocalStorage.getItem('sign'))
    }
  })

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
    enviarMensagem,
    handleSign
  }
}
