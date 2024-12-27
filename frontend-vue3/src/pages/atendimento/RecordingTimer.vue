<template>
  <div>
    <div class="timerBox">
      <span>{{ displayTime }}</span>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useTimer } from 'src/composables/atendimento/useTimer'

const { displayTime, startTimer, stopTimer, resetTimer } = useTimer()

onMounted(() => {
  resetTimer() // Garante que o timer começa do zero
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})

// Expor resetTimer para componentes pais poderem resetar o timer se necessário
defineExpose({
  resetTimer
})
</script>

<style scoped>
.timerBox {
  width: 45px;
  text-align: center;
  font-size: 14px;
  margin-left: 5px;
  margin-right: 5px;
}
</style>
