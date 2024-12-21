<template>
  <q-input
    v-model="dateValue"
    :label="label"
    :error="!!errorMessage || !isDateValid"
    :error-message="errorMessage || invalidDateMessage"
    outlined
    dense
    mask="##/##/####"
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
            v-model="dateValue" 
            mask="DD/MM/YYYY"
            :options="dateOptions"
            :navigation-min-year-month="minYearMonth"
            :navigation-max-year-month="maxYearMonth"
            today-btn
            @update:model-value="handleDateChange"
          >
            <div class="row items-center justify-end q-gutter-sm">
              <q-btn
                v-if="clearable"
                label="Limpar"
                color="primary"
                flat
                v-close-popup
                @click="clearDate"
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
    </template>
  </q-input>
</template>

<script setup>
import { computed } from 'vue'
import { useDateInput } from '../../composables/useDateInput'

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
  }
})

const emit = defineEmits(['update:modelValue'])

const {
  dateValue,
  handleDateChange,
  validateDate,
  formatDate
} = useDateInput(props, emit)

// Computed
const isDateValid = computed(() => validateDate(dateValue.value))

const invalidDateMessage = computed(() => 
  !isDateValid.value ? 'Data inválida' : ''
)

const minYearMonth = computed(() => 
  props.minDate ? formatDate(props.minDate, 'yyyy-MM-dd', 'YYYY/MM') : undefined
)

const maxYearMonth = computed(() => 
  props.maxDate ? formatDate(props.maxDate, 'yyyy-MM-dd', 'YYYY/MM') : undefined
)

const dateOptions = computed(() => {
  if (!props.minDate && !props.maxDate) return undefined

  return (date) => {
    const currentDate = formatDate(date, 'YYYY/MM/DD', 'yyyy-MM-dd')
    if (props.minDate && currentDate < props.minDate) return false
    if (props.maxDate && currentDate > props.maxDate) return false
    return true
  }
})

// Methods
const clearDate = () => {
  dateValue.value = ''
  emit('update:modelValue', '')
}
</script>

<style lang="scss" scoped>
.cursor-not-allowed {
  cursor: not-allowed;
}
</style>
