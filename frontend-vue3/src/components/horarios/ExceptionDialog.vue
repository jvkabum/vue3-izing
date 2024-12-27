<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 400px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ isEditing ? 'Editar' : 'Nova' }} Exceção</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <!-- Data -->
          <q-input
            v-model="form.date"
            label="Data *"
            type="date"
            :rules="[
              val => !!val || 'Data é obrigatória',
              validateFutureDate
            ]"
            outlined
            dense
          />

          <!-- Tipo de Exceção -->
          <q-select
            v-model="form.type"
            :options="exceptionTypeOptions"
            label="Tipo de Exceção *"
            :rules="[val => !!val || 'Tipo é obrigatório']"
            outlined
            dense
            emit-value
            map-options
          />

          <!-- Horários (se não for fechado) -->
          <template v-if="form.type !== 'closed'">
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input
                  v-model="form.start"
                  label="Horário Inicial *"
                  type="time"
                  :rules="[
                    val => !!val || 'Horário inicial é obrigatório',
                    validateTimeRange
                  ]"
                  outlined
                  dense
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="form.end"
                  label="Horário Final *"
                  type="time"
                  :rules="[
                    val => !!val || 'Horário final é obrigatório',
                    validateTimeRange
                  ]"
                  outlined
                  dense
                />
              </div>
            </div>

            <!-- Capacidade -->
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input
                  v-model.number="form.capacity"
                  label="Capacidade"
                  type="number"
                  :rules="[val => val > 0 || 'Capacidade deve ser maior que 0']"
                  outlined
                  dense
                  min="1"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model.number="form.interval"
                  label="Intervalo (min)"
                  type="number"
                  outlined
                  dense
                  min="0"
                />
              </div>
            </div>
          </template>

          <!-- Descrição -->
          <q-input
            v-model="form.description"
            label="Descrição"
            type="textarea"
            outlined
            autogrow
          />

          <!-- Notificação -->
          <q-expansion-item
            icon="notifications"
            label="Notificações"
            header-class="text-primary"
          >
            <q-card>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <!-- Notificar Clientes -->
                  <div class="col-12">
                    <q-checkbox
                      v-model="form.notifications.notifyCustomers"
                      label="Notificar clientes agendados"
                    />
                  </div>

                  <!-- Notificar Atendentes -->
                  <div class="col-12">
                    <q-checkbox
                      v-model="form.notifications.notifyAgents"
                      label="Notificar atendentes"
                    />
                  </div>

                  <!-- Mensagem Personalizada -->
                  <div class="col-12">
                    <q-input
                      v-model="form.notifications.customMessage"
                      label="Mensagem Personalizada"
                      type="textarea"
                      outlined
                      autogrow
                    />
                  </div>

                  <!-- Antecedência -->
                  <div class="col-12">
                    <q-input
                      v-model.number="form.notifications.notifyBefore"
                      label="Notificar com Antecedência (horas)"
                      type="number"
                      outlined
                      dense
                      min="0"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- Reagendamento -->
          <q-expansion-item
            v-if="form.type === 'closed'"
            icon="event"
            label="Opções de Reagendamento"
            header-class="text-primary"
          >
            <q-card>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <!-- Permitir Reagendamento -->
                  <div class="col-12">
                    <q-checkbox
                      v-model="form.rescheduling.allowed"
                      label="Permitir reagendamento automático"
                    />
                  </div>

                  <!-- Período para Reagendamento -->
                  <template v-if="form.rescheduling.allowed">
                    <div class="col-6">
                      <q-input
                        v-model.number="form.rescheduling.daysBeforeAfter"
                        label="Dias (antes/depois)"
                        type="number"
                        outlined
                        dense
                        min="1"
                      />
                    </div>
                    <div class="col-6">
                      <q-select
                        v-model="form.rescheduling.priority"
                        :options="reschedulingPriorityOptions"
                        label="Prioridade"
                        outlined
                        dense
                        emit-value
                        map-options
                      />
                    </div>
                  </template>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="primary" v-close-popup />
        <q-btn
          :label="isEditing ? 'Salvar' : 'Criar'"
          color="primary"
          @click="handleSubmit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { date } from 'quasar'

const props = defineProps({
  modelValue: Boolean,
  exception: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

// Estado
const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = ref({
  date: '',
  type: 'closed',
  start: '',
  end: '',
  capacity: 1,
  interval: 0,
  description: '',
  notifications: {
    notifyCustomers: true,
    notifyAgents: true,
    customMessage: '',
    notifyBefore: 24
  },
  rescheduling: {
    allowed: false,
    daysBeforeAfter: 7,
    priority: 'closest'
  }
})

// Computed
const isEditing = computed(() => !!props.exception)

// Opções
const exceptionTypeOptions = [
  { label: 'Fechado', value: 'closed' },
  { label: 'Horário Especial', value: 'special' },
  { label: 'Capacidade Reduzida', value: 'reduced' }
]

const reschedulingPriorityOptions = [
  { label: 'Data mais próxima', value: 'closest' },
  { label: 'Mesmo horário', value: 'same-time' },
  { label: 'Mesmo dia da semana', value: 'same-weekday' }
]

// Watch
watch(() => props.exception, (newException) => {
  if (newException) {
    form.value = { ...form.value, ...newException }
  } else {
    resetForm()
  }
}, { immediate: true })

// Métodos
const resetForm = () => {
  form.value = {
    date: '',
    type: 'closed',
    start: '',
    end: '',
    capacity: 1,
    interval: 0,
    description: '',
    notifications: {
      notifyCustomers: true,
      notifyAgents: true,
      customMessage: '',
      notifyBefore: 24
    },
    rescheduling: {
      allowed: false,
      daysBeforeAfter: 7,
      priority: 'closest'
    }
  }
}

const validateFutureDate = (val) => {
  if (!val) return true
  const today = date.formatDate(new Date(), 'YYYY-MM-DD')
  return val >= today || 'Data deve ser futura'
}

const validateTimeRange = () => {
  if (!form.value.start || !form.value.end) return true

  const start = new Date(`2000-01-01T${form.value.start}`)
  const end = new Date(`2000-01-01T${form.value.end}`)

  return start < end || 'Horário final deve ser maior que o inicial'
}

const handleSubmit = () => {
  emit('save', { ...form.value })
}

defineExpose({
  resetForm
})
</script>

<style lang="scss" scoped>
.q-expansion-item {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  margin-bottom: 8px;

  .q-card {
    box-shadow: none;
  }
}

.dark {
  .q-expansion-item {
    border-color: rgba(255, 255, 255, 0.12);
  }
}
</style>
