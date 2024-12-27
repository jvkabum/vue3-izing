<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 600px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ isEditing ? 'Editar' : 'Nova' }} Fila</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <!-- Informações Básicas -->
          <div class="row q-col-gutter-md">
            <!-- Nome e Status -->
            <div class="col-12 col-md-8">
              <q-input
                v-model="form.name"
                label="Nome da Fila *"
                :rules="[val => !!val || 'Nome é obrigatório']"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.status"
                :options="statusOptions"
                label="Status"
                outlined
                dense
                emit-value
                map-options
              />
            </div>

            <!-- Descrição -->
            <div class="col-12">
              <q-input
                v-model="form.description"
                label="Descrição"
                type="textarea"
                outlined
                autogrow
              />
            </div>
          </div>

          <!-- Horário de Funcionamento -->
          <q-expansion-item
            group="settings"
            icon="schedule"
            label="Horário de Funcionamento"
            default-opened
          >
            <q-card>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.schedule.start"
                      label="Horário Inicial"
                      type="time"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="form.schedule.end"
                      label="Horário Final"
                      type="time"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-12">
                    <q-option-group
                      v-model="form.schedule.days"
                      :options="daysOptions"
                      type="checkbox"
                      inline
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- Configurações de Atendimento -->
          <q-expansion-item
            group="settings"
            icon="settings"
            label="Configurações de Atendimento"
            default-opened
          >
            <q-card>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <!-- Capacidade -->
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model.number="form.settings.maxConcurrent"
                      label="Atendimentos Simultâneos"
                      type="number"
                      outlined
                      dense
                      min="1"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model.number="form.settings.maxWaiting"
                      label="Máximo em Espera"
                      type="number"
                      outlined
                      dense
                      min="0"
                    />
                  </div>

                  <!-- Tempos -->
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model.number="form.settings.maxWaitTime"
                      label="Tempo Máximo de Espera (min)"
                      type="number"
                      outlined
                      dense
                      min="0"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model.number="form.settings.alertWaitTime"
                      label="Alerta de Espera (min)"
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

          <!-- Mensagens -->
          <q-expansion-item
            group="settings"
            icon="message"
            label="Mensagens Automáticas"
          >
            <q-card>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <q-input
                      v-model="form.messages.welcome"
                      label="Mensagem de Boas-vindas"
                      type="textarea"
                      outlined
                      autogrow
                    />
                  </div>
                  <div class="col-12">
                    <q-input
                      v-model="form.messages.closed"
                      label="Mensagem Fora do Horário"
                      type="textarea"
                      outlined
                      autogrow
                    />
                  </div>
                  <div class="col-12">
                    <q-input
                      v-model="form.messages.maxWaiting"
                      label="Mensagem Fila Cheia"
                      type="textarea"
                      outlined
                      autogrow
                    />
                  </div>
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

const props = defineProps({
  modelValue: Boolean,
  queue: {
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
  name: '',
  description: '',
  status: 'active',
  schedule: {
    start: '09:00',
    end: '18:00',
    days: ['2', '3', '4', '5', '6'] // Segunda a Sexta
  },
  settings: {
    maxConcurrent: 5,
    maxWaiting: 10,
    maxWaitTime: 30,
    alertWaitTime: 15
  },
  messages: {
    welcome: 'Bem-vindo! Em breve um atendente estará disponível.',
    closed: 'Nosso horário de atendimento é de segunda a sexta, das 9h às 18h.',
    maxWaiting: 'Nossa fila está cheia no momento. Por favor, tente novamente mais tarde.'
  }
})

// Computed
const isEditing = computed(() => !!props.queue)

// Opções
const statusOptions = [
  { label: 'Ativa', value: 'active' },
  { label: 'Inativa', value: 'inactive' }
]

const daysOptions = [
  { label: 'Dom', value: '1' },
  { label: 'Seg', value: '2' },
  { label: 'Ter', value: '3' },
  { label: 'Qua', value: '4' },
  { label: 'Qui', value: '5' },
  { label: 'Sex', value: '6' },
  { label: 'Sáb', value: '7' }
]

// Watch
watch(() => props.queue, (newQueue) => {
  if (newQueue) {
    form.value = {
      ...form.value,
      ...newQueue
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Métodos
const resetForm = () => {
  form.value = {
    name: '',
    description: '',
    status: 'active',
    schedule: {
      start: '09:00',
      end: '18:00',
      days: ['2', '3', '4', '5', '6']
    },
    settings: {
      maxConcurrent: 5,
      maxWaiting: 10,
      maxWaitTime: 30,
      alertWaitTime: 15
    },
    messages: {
      welcome: 'Bem-vindo! Em breve um atendente estará disponível.',
      closed: 'Nosso horário de atendimento é de segunda a sexta, das 9h às 18h.',
      maxWaiting: 'Nossa fila está cheia no momento. Por favor, tente novamente mais tarde.'
    }
  }
}

const handleSubmit = () => {
  const queueData = { ...form.value }

  if (props.queue) {
    queueData.id = props.queue.id
  }

  emit('save', queueData)
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
