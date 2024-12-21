<template>
  <div>
    <slot v-if="!hasError" />
    <q-card v-else>
      <q-card-section>
        <div class="text-h6">Ocorreu um erro</div>
        <div class="q-mt-md">{{ errorMessage }}</div>
        <q-btn label="Tentar Novamente" @click="resetError" color="primary" />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')

// Método para resetar o erro
const resetError = () => {
  hasError.value = false
  errorMessage.value = ''
}

// Expor métodos
defineExpose({
  setError: (message) => {
    hasError.value = true
    errorMessage.value = message
  }
})
</script>

<style lang="scss" scoped>
.error-boundary {
  padding: 16px;
}
</style>
