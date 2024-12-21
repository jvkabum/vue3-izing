<template>
  <q-input
    v-model="modelValue"
    :label="label"
    :type="type"
    :outlined="outlined"
    :dense="dense"
    :error="error"
    :error-message="errorMessage"
    @input="$emit('update:modelValue', modelValue)"
  />
</template>

<script setup>
// Props para o componente
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'text'
  },
  outlined: {
    type: Boolean,
    default: false
  },
  dense: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  }
})
</script>

<style lang="scss" scoped>
.q-input {
  margin-bottom: 16px; /* Espaçamento inferior */
}
</style>
