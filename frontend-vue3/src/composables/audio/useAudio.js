import { ref } from 'vue'
import MicRecorder from 'mic-recorder-to-mp3'

export function useAudio() {
  const isRecording = ref(false)
  const recorder = ref(new MicRecorder({ bitRate: 128 }))
  const audioBlob = ref(null)

  const startRecording = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      await recorder.value.start()
      isRecording.value = true
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error)
      throw error
    }
  }

  const stopRecording = async () => {
    if (!isRecording.value) return null

    try {
      const [buffer, blob] = await recorder.value.stop().getMp3()
      audioBlob.value = blob
      
      return {
        buffer,
        blob,
        url: URL.createObjectURL(blob),
        filename: `audio_${Date.now()}.mp3`
      }
    } catch (error) {
      console.error('Erro ao parar gravação:', error)
      throw error
    } finally {
      isRecording.value = false
    }
  }

  const cancelRecording = () => {
    if (isRecording.value) {
      recorder.value.stop()
      isRecording.value = false
    }
  }

  return {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    cancelRecording
  }
} 