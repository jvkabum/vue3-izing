<template>
  <div 
    class="recording-timer"
    :class="{ 'text-white': isDark }"
  >
    <q-icon 
      name="mdi-record" 
      class="recording-icon" 
      color="negative"
    />
    {{ formattedTime }}
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

// Composables
const $q = useQuasar()

// Estado
const seconds = ref(0)
let timerInterval = null

// Computed
const isDark = computed(() => $q.dark.isActive)

const formattedTime = computed(() => {
  const minutes = Math.floor(seconds.value / 60)
  const remainingSeconds = seconds.value % 60
  
  const formattedMinutes = String(minutes).padStart(2, '0')
  const formattedSeconds = String(remainingSeconds).padStart(2, '0')
  
  return `${formattedMinutes}:${formattedSeconds}`
})

// Métodos
const startTimer = () => {
  stopTimer() // Limpar timer anterior se existir
  
  timerInterval = setInterval(() => {
    seconds.value++
    
    // Limite de 5 minutos
    if (seconds.value >= 300) {
      stopTimer()
      emit('limit-reached')
    }
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const resetTimer = () => {
  stopTimer()
  seconds.value = 0
}

// Emits
const emit = defineEmits(['limit-reached'])

// Lifecycle
onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})

// Expor métodos
defineExpose({
  resetTimer,
  startTimer,
  stopTimer,
  seconds
})
</script>

<style lang="scss" scoped>
.recording-timer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: monospace;
  font-size: 16px;
  font-weight: 600;
  min-width: 80px;
  padding: 4px 8px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.05);
  
  &.text-white {
    background: rgba(255, 255, 255, 0.1);
  }
}

.recording-icon {
  font-size: 12px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.5;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0.5;
    transform: scale(0.9);
  }
}
</style>
