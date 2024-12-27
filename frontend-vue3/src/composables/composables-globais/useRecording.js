import { ref, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

export function useRecording() {
  const $q = useQuasar()
  
  const isRecording = ref(false)
  const recordingTime = ref(0)
  const mediaRecorder = ref(null)
  const audioChunks = ref([])
  const timerInterval = ref(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      mediaRecorder.value = new MediaRecorder(stream)
      audioChunks.value = []
      
      mediaRecorder.value.ondataavailable = (event) => {
        audioChunks.value.push(event.data)
      }

      mediaRecorder.value.onstop = () => {
        const audioBlob = new Blob(audioChunks.value, { type: 'audio/mp3' })
        audioChunks.value = []
        stopTimer()
        
        // Retorna o blob para ser enviado
        return audioBlob
      }

      mediaRecorder.value.start()
      isRecording.value = true
      startTimer()

    } catch (error) {
      console.error('Erro ao iniciar gravação:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao iniciar gravação',
        caption: error.message,
        position: 'top'
      })
      throw error
    }
  }

  const stopRecording = async () => {
    if (!mediaRecorder.value) return null

    return new Promise((resolve) => {
      mediaRecorder.value.onstop = () => {
        const audioBlob = new Blob(audioChunks.value, { type: 'audio/mp3' })
        audioChunks.value = []
        stopTimer()
        isRecording.value = false
        
        // Encerra todas as tracks do stream
        mediaRecorder.value.stream.getTracks().forEach(track => track.stop())
        
        resolve(audioBlob)
      }

      mediaRecorder.value.stop()
    })
  }

  const cancelRecording = () => {
    if (!mediaRecorder.value) return

    // Encerra todas as tracks do stream
    mediaRecorder.value.stream.getTracks().forEach(track => track.stop())
    
    audioChunks.value = []
    stopTimer()
    isRecording.value = false
    mediaRecorder.value = null
  }

  const startTimer = () => {
    recordingTime.value = 0
    timerInterval.value = setInterval(() => {
      recordingTime.value++
    }, 1000)
  }

  const stopTimer = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
    recordingTime.value = 0
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  onUnmounted(() => {
    if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
      cancelRecording()
    }
    stopTimer()
  })

  return {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
    formatTime
  }
}
