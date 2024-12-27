import { ref, onMounted } from 'vue'

export function useSound() {
  // Estado
  const audioContext = ref(null)
  const notificationSound = ref(null)
  const somAtivo = ref(true)
  const volume = ref(0.5)

  // Carrega o som de notificação
  const carregarSom = async () => {
    try {
      if (!audioContext.value) {
        audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
      }

      const response = await fetch('/sound.mp3')
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioContext.value.decodeAudioData(arrayBuffer)
      notificationSound.value = audioBuffer
    } catch (error) {
      console.error('Erro ao carregar som:', error)
    }
  }

  // Toca o som de notificação
  const playNotificationSound = () => {
    if (!somAtivo.value || !audioContext.value || !notificationSound.value) return

    try {
      const source = audioContext.value.createBufferSource()
      const gainNode = audioContext.value.createGain()

      source.buffer = notificationSound.value
      gainNode.gain.value = volume.value

      source.connect(gainNode)
      gainNode.connect(audioContext.value.destination)

      source.start(0)
    } catch (error) {
      console.error('Erro ao tocar som:', error)
    }
  }

  // Alterna o som
  const toggleSom = () => {
    somAtivo.value = !somAtivo.value
    localStorage.setItem('som-ativo', somAtivo.value)
  }

  // Ajusta o volume
  const ajustarVolume = (novoVolume) => {
    volume.value = Math.max(0, Math.min(1, novoVolume))
    localStorage.setItem('volume-som', volume.value)
  }

  // Lifecycle hooks
  onMounted(() => {
    // Carrega preferências salvas
    const somAtivoSalvo = localStorage.getItem('som-ativo')
    if (somAtivoSalvo !== null) {
      somAtivo.value = somAtivoSalvo === 'true'
    }

    const volumeSalvo = localStorage.getItem('volume-som')
    if (volumeSalvo !== null) {
      volume.value = parseFloat(volumeSalvo)
    }

    // Carrega o som
    carregarSom()
  })

  return {
    // Estado
    somAtivo,
    volume,

    // Métodos
    playNotificationSound,
    toggleSom,
    ajustarVolume
  }
}
