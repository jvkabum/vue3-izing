<template>
  <div class="schedule-date-picker">
    <q-input
      v-model="dateTimeModel"
      outlined
      dense
      class="full-width"
      :rules="[
        val => !!val || 'Data/hora é obrigatória',
        val => isValidDateTime(val) || 'Data/hora deve ser futura'
      ]"
      hint="Selecione a data e hora para agendamento"
      :error="!!error"
      :error-message="error"
      readonly
    >
      <template #prepend>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy
            cover
            transition-show="scale"
            transition-hide="scale"
          >
            <q-date
              v-model="dateModel"
              mask="DD/MM/YYYY HH:mm"
              :options="dateOptions"
              today-btn
            >
              <div class="row items-center justify-end q-gutter-sm q-pa-sm">
                <q-btn
                  label="Cancelar"
                  color="negative"
                  flat
                  v-close-popup
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

      <template #append>
        <q-icon name="access_time" class="cursor-pointer">
          <q-popup-proxy
            cover
            transition-show="scale"
            transition-hide="scale"
          >
            <q-time
              v-model="timeModel"
              mask="DD/MM/YYYY HH:mm"
              format24h
              :options="timeOptions"
            >
              <div class="row items-center justify-end q-gutter-sm q-pa-sm">
                <q-btn
                  label="Cancelar"
                  color="negative"
                  flat
                  v-close-popup
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

    <!-- Preview do Agendamento -->
    <div 
      v-if="dateTimeModel"
      class="schedule-preview q-mt-sm"
    >
      <q-chip
        square
        :color="isValidDateTime(dateTimeModel) ? 'primary' : 'negative'"
        text-color="white"
        icon="schedule"
      >
        Agendado para {{ formattedDateTime }}
        <q-tooltip>
          {{ isValidDateTime(dateTimeModel) 
            ? 'Mensagem será enviada automaticamente neste horário'
            : 'Selecione uma data/hora futura' 
          }}
        </q-tooltip>
      </q-chip>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { date } from 'quasar'
import { format, isAfter, parseISO, addMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Estado
const error = ref('')
const dateModel = ref(null)
const timeModel = ref(null)

// Computed
const dateTimeModel = computed({
  get: () => props.modelValue,
  set: (value) => {
    error.value = ''
    if (!isValidDateTime(value)) {
      error.value = 'Selecione uma data/hora futura'
    }
    emit('update:modelValue', value)
  }
})

const formattedDateTime = computed(() => {
  if (!dateTimeModel.value) return ''
  
  try {
    const dateObj = parseISO(dateTimeModel.value)
    return format(dateObj, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })
  } catch (err) {
    return dateTimeModel.value
  }
})

// Métodos
const isValidDateTime = (value) => {
  if (!value) return false
  
  try {
    const selectedDate = parseISO(value)
    const minDate = addMinutes(new Date(), 5) // Mínimo 5 minutos no futuro
    return isAfter(selectedDate, minDate)
  } catch (err) {
    return false
  }
}

const dateOptions = (dateStr) => {
  const selectedDate = date.extractDate(dateStr, 'DD/MM/YYYY')
  const today = new Date()
  return date.isSameDate(selectedDate, today) || date.isAfterDate(selectedDate, today)
}

const timeOptions = (hr, min) => {
  if (!dateModel.value) return true
  
  const today = new Date()
  const selected = new Date(dateModel.value)
  
  if (date.isSameDate(selected, today)) {
    const currentHour = today.getHours()
    const currentMinute = today.getMinutes()
    
    if (hr < currentHour) return false
    if (hr === currentHour && min <= currentMinute) return false
  }
  
  return true
}
</script>

<style lang="scss" scoped>
.schedule-date-picker {
  :deep(.q-field) {
    &__control {
      padding: 0 8px;
      height: 40px;
      border-radius: 8px;
    }
    
    &__marginal {
      height: 40px;
    }
  }
}

.schedule-preview {
  .q-chip {
    transition: all 0.3s ease;
    
    &--colored {
      .q-chip__content {
        padding: 0 8px;
      }
      
      .q-icon {
        font-size: 18px;
        margin-right: 4px;
      }
    }
  }
}

:deep(.q-date) {
  min-width: 320px;
  
  &__calendar-item {
    &.q-date__calendar-item--selected {
      background: var(--q-primary) !important;
      color: white !important;
    }
  }
}

:deep(.q-time) {
  min-width: 280px;
  
  &__clock-position {
    &--selected {
      background: var(--q-primary) !important;
      color: white !important;
    }
  }
}
</style>
