<template>
  <q-dialog
    v-model="dialogModel"
    persistent
    @hide="onHide"
  >
    <q-card :style="cardStyle">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Agendamento de Mensagem</div>
        <q-space />
        <q-btn
          flat
          round
          dense
          icon="close"
          color="negative"
          class="bg-padrao btn-rounded"
          v-close-popup
        >
          <q-tooltip>Fechar</q-tooltip>
        </q-btn>
      </q-card-section>

      <q-card-section class="q-pt-md">
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-input
              filled
              v-model="scheduleDate"
              label="Data e Hora do Agendamento"
              mask="##/##/#### ##:##"
              :rules="[
                val => !!val || 'Data é obrigatória',
                val => isValidDate(val) || 'Data inválida'
              ]"
            >
              <template #append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="scheduleDate"
                      mask="DD/MM/YYYY HH:mm"
                      :options="dateOptions"
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Fechar"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-time
                      v-model="scheduleDate"
                      mask="DD/MM/YYYY HH:mm"
                      format24h
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Fechar"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>

        <input-mensagem
          class="q-mt-md"
          :mensagens-rapidas="quickMessages"
          v-model:replying-message="replyingMessageModel"
          :schedule-date="scheduleDate"
          :is-schedule-mode="true"
          @message-sent="onMessageScheduled"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { date } from 'quasar'
import InputMensagem from './InputMensagem.vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  quickMessages: {
    type: Array,
    default: () => []
  },
  replyingMessage: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits([
  'update:modelValue',
  'update:replyingMessage',
  'message-scheduled'
])

// Composables
const $q = useQuasar()

// Estado
const scheduleDate = ref('')

// Computed
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const replyingMessageModel = computed({
  get: () => props.replyingMessage,
  set: (value) => emit('update:replyingMessage', value)
})

const cardStyle = computed(() => 
  $q.screen.width < 770 
    ? 'width: 98vw; max-width: 98vw' 
    : 'width: 50vw; max-width: 50vw'
)

// Métodos
const isValidDate = (val) => {
  if (!val) return false
  
  const [datePart, timePart] = val.split(' ')
  if (!datePart || !timePart) return false
  
  const [day, month, year] = datePart.split('/')
  const [hour, minute] = timePart.split(':')
  
  const dateObj = new Date(year, month - 1, day, hour, minute)
  const now = new Date()
  
  return dateObj > now && date.isValid(dateObj)
}

const dateOptions = (date) => {
  const today = new Date()
  const selectedDate = new Date(date)
  return selectedDate >= today
}

const onMessageScheduled = (message) => {
  emit('message-scheduled', {
    ...message,
    scheduleDate: scheduleDate.value
  })
  dialogModel.value = false
}

const onHide = () => {
  scheduleDate.value = ''
  emit('update:replyingMessage', null)
}
</script>

<style lang="scss" scoped>
.bg-padrao {
  &.q-btn {
    border-radius: 8px;
    
    &--flat {
      &.text-negative {
        color: var(--q-negative);
        
        &:hover {
          background: rgba(var(--q-negative-rgb), 0.1);
        }
      }
    }
  }
}

.btn-rounded {
  border-radius: 50%;
}

:deep(.q-field) {
  &--filled {
    .q-field__control {
      border-radius: 8px;
    }
  }
}

:deep(.q-date) {
  min-width: 320px;
}

:deep(.q-time) {
  min-width: 280px;
}
</style>
