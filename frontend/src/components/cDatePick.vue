<template>
  <q-input
    v-model="formattedDate"
    label="Selecionar Data"
    outlined
    dense
    @focus="showDatePicker = true"
    readonly
  />
  <q-popup-proxy
    v-model="showDatePicker"
    transition-show="scale"
    transition-hide="scale"
    cover
  >
    <q-date
      v-model="selectedDate"
      @input="updateDate"
      mask="DD/MM/YYYY"
      locale="pt-BR"
    />
  </q-popup-proxy>
</template>

<script setup>
import { ref, watch } from 'vue'

// Estado para controlar a exibição do seletor de data
const showDatePicker = ref(false)
const selectedDate = ref(null)

// Estado para armazenar a data formatada
const formattedDate = ref('')

// Atualiza a data formatada
const updateDate = (date) => {
  selectedDate.value = date
  formattedDate.value = date ? date.toLocaleDateString('pt-BR') : ''
  showDatePicker.value = false
}

// Watch para atualizar a data formatada
watch(selectedDate, (newDate) => {
  formattedDate.value = newDate ? newDate.toLocaleDateString('pt-BR') : ''
})
</script>

<style lang="scss" scoped>
.date-picker {
  position: relative;
}
</style>
