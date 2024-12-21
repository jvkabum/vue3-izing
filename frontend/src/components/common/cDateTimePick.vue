<template>
  <q-input
    v-model="dateTimeModel"
    :label="label"
    :error="!!errorMessage"
    :error-message="errorMessage"
    outlined
    dense
    mask="##/##/#### ##:##"
  >
    <template #append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date v-model="dateModel" mask="DD/MM/YYYY">
            <div class="row items-center justify-end q-gutter-sm">
              <q-btn label="Fechar" color="primary" flat v-close-popup />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
      <q-icon name="access_time" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-time v-model="timeModel" mask="HH:mm" format24h>
            <div class="row items-center justify-end q-gutter-sm">
              <q-btn label="Fechar" color="primary" flat v-close-popup />
            </div>
          </q-time>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { format, parse } from 'date-fns'

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

const emit = defineEmits(['update:modelValue'])

const dateTimeModel = ref(props.modelValue)

const dateModel = computed({
  get: () => {
    if (!dateTimeModel.value) return ''
    const date = parse(dateTimeModel.value, 'dd/MM/yyyy HH:mm', new Date())
    return format(date, 'dd/MM/yyyy')
  },
  set: (value) => {
    const time = timeModel.value || '00:00'
    dateTimeModel.value = `${value} ${time}`
  }
})

const timeModel = computed({
  get: () => {
    if (!dateTimeModel.value) return ''
    const date = parse(dateTimeModel.value, 'dd/MM/yyyy HH:mm', new Date())
    return format(date, 'HH:mm')
  },
  set: (value) => {
    const date = dateModel.value || format(new Date(), 'dd/MM/yyyy')
    dateTimeModel.value = `${date} ${value}`
  }
})

watch(dateTimeModel, (newValue) => {
  if (!newValue) return
  const date = parse(newValue, 'dd/MM/yyyy HH:mm', new Date())
  emit('update:modelValue', format(date, 'yyyy-MM-dd HH:mm'))
})
</script> 