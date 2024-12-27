import { ref } from 'vue'

export function useAudioRecording() {
  const isRecording = ref(false)
  const audioStream = ref(null)
  const mediaRecorder = ref(null)
  const audioChunks = ref([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioStream.value = stream
      mediaRecorder.value = new MediaRecorder(stream)
      audioChunks.value = []

      mediaRecorder.value.ondataavailable = event => {
        audioChunks.value.push(event.data)
      }

      mediaRecorder.value.start()
      isRecording.value = true
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error)
      throw new Error('Não foi possível iniciar a gravação de áudio')
    }
  }

  const stopRecording = () => {
    if (!mediaRecorder.value) return

    return new Promise(resolve => {
      mediaRecorder.value.onstop = () => {
        const audioBlob = new Blob(audioChunks.value, { type: 'audio/ogg; codecs=opus' })
        const audioFile = new File([audioBlob], 'audio.ogg', { type: 'audio/ogg' })
        
        stopStream()
        resolve(audioFile)
      }

      mediaRecorder.value.stop()
      isRecording.value = false
    })
  }

  const cancelRecording = () => {
    if (mediaRecorder.value && isRecording.value) {
      mediaRecorder.value.stop()
      stopStream()
    }
    isRecording.value = false
  }

  const stopStream = () => {
    if (audioStream.value) {
      audioStream.value.getTracks().forEach(track => track.stop())
      audioStream.value = null
    }
  }

  return {
    isRecording,
    startRecording,
    stopRecording,
    cancelRecording
  }
}
