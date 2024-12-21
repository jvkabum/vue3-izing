<template>
  <q-input
    ref="inputRef"
    v-model="inputValue"
    :label="label"
    :error="!!errorMessage"
    :error-message="errorMessage"
    :rules="rules"
    outlined
    dense
    @update:model-value="handleInput"
    v-bind="$attrs"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData" />
    </template>
  </q-input>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  rules: {
    type: Array,
    default: () => []
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Estado
const inputRef = ref(null)
const inputValue = ref(props.modelValue)

// Watch para sincronizar v-model
watch(() => props.modelValue, (newValue) => {
  inputValue.value = newValue
})

// Métodos
const handleInput = (value) => {
  inputValue.value = value
  emit('update:modelValue', value || null)
}
</script> 