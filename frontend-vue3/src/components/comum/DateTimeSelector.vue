<template>
  <q-input
    v-model="dateTimeModel"
    :label="label"
    :error="!!errorMessage || !isDateTimeValid"
    :error-message="errorMessage || invalidDateTimeMessage"
    outlined
    dense
    mask="##/##/#### ##:##"
    :readonly="readonly"
    :disable="disable"
    :hint="hint"
    :class="{ 'cursor-not-allowed': disable }"
  >
    <template #append>
      <q-icon 
        name="event" 
        class="cursor-pointer"
        :class="{ 'cursor-not-allowed': disable }"
      >
        <q-popup-proxy 
          v-if="!disable"
          cover 
          transition-show="scale" 
          transition-hide="scale"
        >
          <q-date 
            v-model="dateModel" 
            mask="DD/MM/YYYY"
            :options="dateOptions"
            :navigation-min-year-month="minYearMonth"
            :navigation-max-year-month="maxYearMonth"
            today-btn
          >
            <div class="row items-center justify-end q-gutter-sm">
              <q-btn
                v-if="clearable"
                label="Limpar"
                color="primary"
                flat
                v-close-popup
                @click="clearDateTime"
              />
              <q-btn
                label="OK"
                color="primary"
                flat
                v-close-popup
              />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
      <q-icon 
        name="access_time" 
        class="cursor-pointer"
        :class="{ 'cursor-not-allowed': disable }"
      >
        <q-popup-proxy 
          v-if="!disable"
          cover 
          transition-show="scale" 
          transition-hide="scale"
        >
          <q-time 
            v-model="timeModel" 
            mask="HH:mm" 
            format24h
            :options="timeOptions"
          >
            <div class="row items-center justify-end q-gutter-sm">
              <q-btn
                v-if="clearable"
                label="Limpar"
                color="primary"
                flat
                v-close-popup
                @click="clearDateTime"
              />
              <q-btn
                label="OK"
                color="primary"
                flat
                v-close-popup
              />
            </div>
          </q-time>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup>
import { computed } from 'vue'
import { useDateTimePicker } from '../../composables/useDateTimePicker'

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
  },
  hint: {
    type: String,
    default: ''
  },
  readonly: {
    type: Boolean,
    default: false
  },
  disable: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: true
  },
  minDate: {
    type: String,
    default: ''
  },
  maxDate: {
    type: String,
    default: ''
  },
  minTime: {
    type: String,
    default: ''
  },
  maxTime: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const {
  dateTimeModel,
  dateModel,
  timeModel,
  validateDateTime,
  clearDateTime,
  formatDateTime
} = useDateTimePicker(props, emit)

// Computed
const isDateTimeValid = computed(() => validateDateTime(dateTimeModel.value))

const invalidDateTimeMessage = computed(() => 
  !isDateTimeValid.value ? 'Data e hora inválidas' : ''
)

const minYearMonth = computed(() => 
  props.minDate ? formatDateTime(props.minDate, 'yyyy-MM-dd', 'YYYY/MM') : undefined
)

const maxYearMonth = computed(() => 
  props.maxDate ? formatDateTime(props.maxDate, 'yyyy-MM-dd', 'YYYY/MM') : undefined
)

const dateOptions = computed(() => {
  if (!props.minDate && !props.maxDate) return undefined

  return (date) => {
    const currentDate = formatDateTime(date, 'YYYY/MM/DD', 'yyyy-MM-dd')
    if (props.minDate && currentDate < props.minDate) return false
    if (props.maxDate && currentDate > props.maxDate) return false
    return true
  }
})

const timeOptions = computed(() => {
  if (!props.minTime && !props.maxTime) return undefined

  return (hr, min) => {
    const time = `${hr}:${min}`
    if (props.minTime && time < props.minTime) return false
    if (props.maxTime && time > props.maxTime) return false
    return true
  }
})
</script>

<style lang="scss" scoped>
.cursor-not-allowed {
  cursor: not-allowed;
}
</style>
