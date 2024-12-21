<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">Versão do Sistema</div>
      <q-separator />
      <div class="q-mt-md">
        <div>Versão: {{ version }}</div>
        <div>Data de Lançamento: {{ releaseDate }}</div>
        <div>Última Atualização: {{ lastUpdate }}</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'

// Estado para armazenar informações da versão
const version = ref('1.0.0')
const releaseDate = ref('2023-01-01')
const lastUpdate = ref('2023-01-15')

// Método para carregar informações da versão (simulação)
const loadVersionInfo = () => {
  // Aqui você pode fazer uma chamada à API para obter as informações da versão
  // Exemplo:
  // const response = await api.get('/version')
  // version.value = response.data.version
  // releaseDate.value = response.data.releaseDate
  // lastUpdate.value = response.data.lastUpdate
}

// Carregar informações ao montar
loadVersionInfo()
</script>

<style scoped>
.system-version-container {
  padding: 16px;

  .q-card {
    margin-bottom: 16px;
  }
}
</style>
