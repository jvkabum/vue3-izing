<template>
  <q-page class="flex flex-center">
    <div class="text-h6">Bem-vindo ao Izing Flow!</div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

// Aqui você pode adicionar lógica ou estados se necessário
const welcomeMessage = ref('Bem-vindo ao Izing Flow!')
</script>

<style scoped>
.flex {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
