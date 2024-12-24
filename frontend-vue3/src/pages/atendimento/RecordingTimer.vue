<template>
  <div>
    <div class="timerBox">
      <span>{{ addZero(timer.minutes) }}:{{ addZero(timer.seconds) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const timer = ref({
  minutes: 0,
  seconds: 0
})

let interval = null

const addZero = (n) => {
  return n < 10 ? '0' + n : n
}

const startTimer = () => {
  interval = setInterval(() => {
    if (timer.value.seconds === 59) {
      timer.value.minutes += 1
      timer.value.seconds = 0
    } else {
      timer.value.seconds += 1
    }
  }, 1000)
}

const stopTimer = () => {
  clearInterval(interval)
}

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
