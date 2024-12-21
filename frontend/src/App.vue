<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script setup>
import { onBeforeMount } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Constantes
const IDLE_TIMEOUT = 5 // seconds

// Lifecycle Hooks
onBeforeMount(() => {
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  if (usuario?.configs?.isDark) {
    $q.dark.set(usuario?.configs?.isDark)
  }
})

// Nota: O código de idle time foi comentado no original, então mantive comentado aqui
// const idleSecondsCounter = ref(0)
// 
// function checkIdleTime() {
//   idleSecondsCounter.value++
//   if (idleSecondsCounter.value >= IDLE_TIMEOUT) {
//     alert('Time expired!')
//   }
// }
//
// Eventos de reset do idle timer também foram mantidos comentados como no original
// document.onclick = () => idleSecondsCounter.value = 0
// document.onmousemove = () => idleSecondsCounter.value = 0
// document.onkeypress = () => idleSecondsCounter.value = 0
// window.setInterval(checkIdleTime, 1000)
</script>
