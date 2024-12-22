e import { ref, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

/**
 * Composable para gerenciar gravação de áudio
 * @returns {Object} Objeto contendo estados e métodos da gravação
 */
export function useAudioRecording() {
  const $q = useQuasar()
  
  // Estado
  const recordingTime = ref(0)
  const isRecording = ref(false)
  let timerInterval = null

  /**
   * Inicia o timer da gravação
   */
  const startTimer = () => {
    if (!timerInterval) {
      timerInterval = setInterval(() => {
        recordingTime.value++
      }, 1000)
    }
  }

  /**
   * Para o timer da gravação
   */
  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    recordingTime.value = 0
  }

  /**
   * Formata o tempo de gravação para exibição
   * @returns {string} Tempo formatado (MM:SS)
   */
  const formattedTime = () => {
    const minutes = Math.floor(recordingTime.value / 60)
    const seconds = recordingTime.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  /**
   * Manipula o fim da gravação
   * @param {Function} onStop - Callback a ser executado ao parar
   */
  const handleStop = (onStop) => {
    if (recordingTime.value < 1) {
      $q.notify({
        type: 'warning',
        message: 'Gravação muito curta',
        position: 'top',
        timeout: 2000
      })
      return
    }
    
    if (typeof onStop === 'function') {
      onStop()
    }
    
    stopTimer()
    isRecording.value = false
  }

  /**
   * Manipula o cancelamento da gravação
   * @param {Function} onCancel - Callback a ser executado ao cancelar
   */
  const handleCancel = (onCancel) => {
    stopTimer()
    isRecording.value = false
    
    if (typeof onCancel === 'function') {
      onCancel()
    }
  }

  /**
   * Inicia uma nova gravação
   */
  const startRecording = () => {
    recordingTime.value = 0
    isRecording.value = true
    startTimer()
  }

  // Limpa o timer ao desmontar o componente
  onUnmounted(() => {
    stopTimer()
  })

  return {
    recordingTime,
    isRecording,
    formattedTime,
    handleStop,
    handleCancel,
    startRecording,
    startTimer,
    stopTimer
  }
}
