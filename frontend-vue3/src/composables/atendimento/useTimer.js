import { ref, computed } from 'vue'

export function useTimer() {
  const minutes = ref(0)
  const seconds = ref(0)
  let timer = null

  const displayTime = computed(() => {
    const paddedMinutes = minutes.value < 10 ? `0${minutes.value}` : minutes.value
    const paddedSeconds = seconds.value < 10 ? `0${seconds.value}` : seconds.value
    return `${paddedMinutes}:${paddedSeconds}`
  })

  function startTimer() {
    timer = setInterval(() => {
      if (seconds.value === 59) {
        minutes.value++
        seconds.value = 0
      } else {
        seconds.value++
      }
    }, 1000)
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function resetTimer() {
    stopTimer()
    minutes.value = 0
    seconds.value = 0
  }

  return {
    displayTime,
    startTimer,
    stopTimer,
    resetTimer
  }
}
