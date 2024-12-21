<template>
  <q-input
    v-model="formattedDateTime"
    label="Selecionar Data e Hora"
    outlined
    dense
    @focus="showDateTimePicker = true"
    readonly
  />
  <q-popup-proxy
    v-model="showDateTimePicker"
    transition-show="scale"
    transition-hide="scale"
    cover
  >
    <div>
      <q-date
        v-model="selectedDate"
        @input="updateDateTime"
        mask="DD/MM/YYYY"
        locale="pt-BR"
      />
      <q-time
        v-model="selectedTime"
        @input="updateDateTime"
        format24h
      />
    </div>
  </q-popup-proxy>
</template>

<script setup>
import { ref, watch } from 'vue'

// Estado para controlar a exibição do seletor de data e hora
const showDateTimePicker = ref(false)
const selectedDate = ref(null)
const selectedTime = ref(null)

// Estado para armazenar a data e hora formatadas
const formattedDateTime = ref('')

// Atualiza a data e hora formatadas
const updateDateTime = () => {
  const date = selectedDate.value
  const time = selectedTime.value

  // Verifica se tanto a data quanto a hora estão selecionadas
  if (date && time) {
    const dateTime = new Date(date)
    const [hours, minutes] = time.split(':')
    dateTime.setHours(hours, minutes) // Define a hora e os minutos
    formattedDateTime.value = dateTime.toLocaleString('pt-BR') // Formata a data e hora
  } else {
    formattedDateTime.value = '' // Reseta se não houver seleção
  }

  showDateTimePicker.value = false // Fecha o seletor após a seleção
}

// Watch para atualizar a data e hora formatadas
watch([selectedDate, selectedTime], updateDateTime)
</script>

<style lang="scss" scoped>
.date-time-picker {
  position: relative; // Define a posição relativa para o componente
}
</style>
