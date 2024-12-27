import { ref } from 'vue'
import MicRecorder from 'mic-recorder-to-mp3'

export function useAudioRecorder() {
  // Estado
  const isRecording = ref(false)
  const error = ref(null)
  const recorder = ref(null)
  const audioBlob = ref(null)

  // Inicializar recorder
  const initRecorder = () => {
    recorder.value = new MicRecorder({ 
      bitRate: 128,
      sampleRate: 44100,
      channels: 2
    })
  }

  // Verificar permissões
  const checkPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      return true
    } catch (err) {
      error.value = {
        type: 'permission',
        message: 'Permissão de microfone necessária',
        details: err
      }
      return false
    }
  }

  // Iniciar gravação
  const startRecording = async () => {
    try {
      error.value = null
      audioBlob.value = null

      // Verificar suporte
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Seu navegador não suporta gravação de áudio')
      }

      // Verificar permissões
      const hasPermission = await checkPermissions()
      if (!hasPermission) return false

      // Inicializar se necessário
      if (!recorder.value) {
        initRecorder()
      }

      // Iniciar gravação
      await recorder.value.start()
      isRecording.value = true
      return true
    } catch (err) {
      error.value = {
        type: 'start',
        message: 'Erro ao iniciar gravação',
        details: err
      }
      return false
    }
  }

  // Parar gravação
  const stopRecording = async () => {
    try {
      if (!isRecording.value || !recorder.value) return null

      const [buffer, blob] = await recorder.value.stop().getMp3()
      isRecording.value = false
      audioBlob.value = blob

      // Validar tamanho mínimo (100KB) para evitar gravações muito curtas
      if (blob.size < 100000) {
        error.value = {
          type: 'duration',
          message: 'Gravação muito curta'
        }
        return null
      }

      return {
        buffer,
        blob,
        size: blob.size,
        type: blob.type,
        duration: buffer.length / 44100 // Duração em segundos
      }
    } catch (err) {
      error.value = {
        type: 'stop',
        message: 'Erro ao finalizar gravação',
        details: err
      }
      return null
    } finally {
      isRecording.value = false
    }
  }

  // Cancelar gravação
  const cancelRecording = async () => {
    try {
      if (recorder.value) {
        await recorder.value.stop().getMp3()
      }
    } catch (err) {
      console.error('Erro ao cancelar gravação:', err)
    } finally {
      isRecording.value = false
      audioBlob.value = null
      error.value = null
    }
  }

  // Criar FormData para upload
  const createFormData = (filename = null) => {
    if (!audioBlob.value) return null

    const formData = new FormData()
    const audioFilename = filename || `audio_${Date.now()}.mp3`
    
    formData.append('medias', audioBlob.value, audioFilename)
    formData.append('body', audioFilename)
    formData.append('fromMe', true)
    
    return formData
  }

  // Limpar recursos
  const cleanup = () => {
    cancelRecording()
    recorder.value = null
    audioBlob.value = null
    error.value = null
  }

  return {
    // Estado
    isRecording,
    error,
    audioBlob,

    // Métodos
    startRecording,
    stopRecording,
    cancelRecording,
    createFormData,
    cleanup
  }
}
