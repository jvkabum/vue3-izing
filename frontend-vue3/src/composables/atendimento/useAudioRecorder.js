import { ref } from 'vue'
import MicRecorder from 'mic-recorder-to-mp3'

export function useAudioRecorder() {
  const isRecording = ref(false)
  const recorder = new MicRecorder({ bitRate: 128 })

  async function startRecording() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      await recorder.start()
      isRecording.value = true
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error)
      isRecording.value = false
      throw error
    }
  }

  async function stopRecording() {
    try {
      const [buffer, blob] = await recorder.stop().getMp3()
      isRecording.value = false
      
      // Retorna apenas se o arquivo tiver tamanho significativo
      if (blob.size < 10000) {
        throw new Error('Arquivo de áudio muito pequeno')
      }

      return {
        buffer,
        blob,
        filename: `${new Date().getTime()}.mp3`
      }
    } catch (error) {
      console.error('Erro ao parar gravação:', error)
      isRecording.value = false
      throw error
    }
  }

  async function cancelRecording() {
    try {
      await recorder.stop().getMp3()
      isRecording.value = false
    } catch (error) {
      console.error('Erro ao cancelar gravação:', error)
      isRecording.value = false
      throw error
    }
  }

  return {
    isRecording,
    startRecording,
    stopRecording,
    cancelRecording
  }
}
