<template>
  <q-input
    v-model="dateValue"
    :label="label"
    :error="!!errorMessage"
    :error-message="errorMessage"
    outlined
    dense
    mask="##/##/####"
  >
    <template #append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date 
            v-model="dateValue" 
            mask="DD/MM/YYYY"
            @update:model-value="handleDateChange"
          />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup>
import { ref, watch } from 'vue'
import { format, parse } from 'date-fns'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Estado
const dateValue = ref(props.modelValue)

// Watch para sincronizar v-model
watch(() => props.modelValue, (newValue) => {
  dateValue.value = newValue
})

// Métodos
const handleDateChange = (value) => {
  if (!value) return
  
  const date = parse(value, 'dd/MM/yyyy', new Date())
  emit('update:modelValue', format(date, 'yyyy-MM-dd'))
}
</script> 