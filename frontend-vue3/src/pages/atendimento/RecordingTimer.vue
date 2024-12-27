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

const { displayTime, startTimer, stopTimer } = useTimer()

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  stopTimer()
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
