import { ref, onUnmounted } from 'vue'

export function useMediaPlayer() {
  const audio = ref(null)
  const playing = ref(false)
  const volume = ref(1)
  const error = ref(null)

  const play = async (src) => {
    try {
      if (!audio.value) {
        audio.value = new Audio(src)
        audio.value.volume = volume.value
      }
      await audio.value.play()
      playing.value = true
    } catch (err) {
      error.value = err.message
    }
  }

  const stop = () => {
    if (!audio.value) return
    audio.value.pause()
    audio.value.currentTime = 0
    playing.value = false
  }

  const setVolume = (value) => {
    volume.value = value
    if (audio.value) {
      audio.value.volume = value
    }
  }

  onUnmounted(() => {
    if (audio.value) {
      audio.value.pause()
      audio.value = null
    }
  })

  return {
    playing,
    volume,
    error,
    play,
    stop,
    setVolume
  }
} 