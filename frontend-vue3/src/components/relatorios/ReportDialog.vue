<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 600px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ isEditing ? 'Editar' : 'Novo' }} Relatório</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <!-- Informações Básicas -->
          <div class="row q-col-gutter-md">
            <!-- Nome e Tipo -->
            <div class="col-12 col-md-8">
              <q-input
                v-model="form.name"
                label="Nome do Relatório *"
                :rules="[val => !!val || 'Nome é obrigatório']"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.type"
                :options="reportTypeOptions"
                label="Tipo *"
                :rules="[val => !!val || 'Tipo é obrigatório']"
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

          <!-- Período -->
          <q-expansion-item
            icon="event"
            label="Período"
            header-class="text-primary"
            default-opened
          >
            <q-card>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <!-- Tipo de Período -->
                  <div class="col-12">
                    <q-select
                      v-model="form.period.type"
                      :options="periodTypeOptions"
                      label="Tipo de Período"
                      outlined
                      dense
                      emit-value
                      map-options
                    />
                  </div>

                  <!-- Período Fixo -->
                  <template v-if="form.period.type === 'fixed'">
                    <div class="col-12">
                      <q-input
                        v-model="form.period.dateRange"
                        label="Período"
                        outlined
                        dense
                        readonly
                      >
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-date
                                v-model="form.period.dateRange"
                                range
                                mask="DD/MM/YYYY"
                              >
                                <div class="row items-center justify-end q-gutter-sm">
                                  <q-btn
                                    label="Cancelar"
                                    color="primary"
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
                      </q-input>
                    </div>
                  </template>

                  <!-- Período Relativo -->
                  <template v-else-if="form.period.type === 'relative'">
                    <div class="col-6">
                      <q-input
                        v-model.number="form.period.value"
                        label="Valor"
                        type="number"
                        outlined
                        dense
                        min="1"
                      />
                    </div>
                    <div class="col-6">
                      <q-select
                        v-model="form.period.unit"
                        :options="periodUnitOptions"
                        label="Unidade"
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

          <!-- Filtros -->
          <q-expansion-item
            icon="filter_list"
            label="Filtros"
            header-class="text-primary"
            default-opened
          >
            <q-card>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <!-- Atendentes -->
                  <div class="col-12">
                    <q-select
                      v-model="form.filters.agents"
                      :options="agentOptions"
                      label="Atendentes"
                      multiple
                      use-chips
                      outlined
                      dense
                    />
                  </div>

                  <!-- Filas -->
                  <div class="col-12">
                    <q-select
                      v-model="form.filters.queues"
                      :options="queueOptions"
                      label="Filas"
                      multiple
                      use-chips
                      outlined
                      dense
                    />
                  </div>

                  <!-- Tags -->
                  <div class="col-12">
                    <q-select
                      v-model="form.filters.tags"
                      :options="tagOptions"
                      label="Tags"
                      multiple
                      use-chips
                      outlined
                      dense
                    />
                  </div>

                  <!-- Status -->
                  <div class="col-12">
                    <q-select
                      v-model="form.filters.status"
                      :options="statusOptions"
                      label="Status"
                      multiple
                      use-chips
                      outlined
                      dense
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- Configurações -->
          <q-expansion-item
            icon="settings"
            label="Configurações"
            header-class="text-primary"
          >
            <q-card>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <!-- Agendamento -->
                  <div class="col-12">
                    <q-checkbox
                      v-model="form.settings.scheduled"
                      label="Agendar envio automático"
                    />
                  </div>

                  <template v-if="form.settings.scheduled">
                    <!-- Frequência -->
                    <div class="col-12">
                      <q-select
                        v-model="form.settings.frequency"
                        :options="frequencyOptions"
                        label="Frequência"
                        outlined
                        dense
                        emit-value
                        map-options
                      />
                    </div>

                    <!-- Destinatários -->
                    <div class="col-12">
                      <q-input
                        v-model="form.settings.recipients"
                        label="Destinatários (emails)"
                        type="textarea"
                        outlined
                        dense
                        hint="Um email por linha"
                      />
                    </div>
                  </template>

                  <!-- Formato -->
                  <div class="col-12">
                    <q-select
                      v-model="form.settings.format"
                      :options="formatOptions"
                      label="Formato"
                      outlined
                      dense
                      emit-value
                      map-options
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
  report: {
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
  type: '',
  description: '',
  period: {
    type: 'fixed',
    dateRange: {
      from: '',
      to: ''
    },
    value: 1,
    unit: 'days'
  },
  filters: {
    agents: [],
    queues: [],
    tags: [],
    status: []
  },
  settings: {
    scheduled: false,
    frequency: 'daily',
    recipients: '',
    format: 'pdf'
  }
})

// Computed
const isEditing = computed(() => !!props.report)

// Opções
const reportTypeOptions = [
  { label: 'Atendimentos', value: 'tickets' },
  { label: 'Tempo Médio', value: 'avgTime' },
  { label: 'Satisfação', value: 'satisfaction' },
  { label: 'Volume por Canal', value: 'channels' }
]

const periodTypeOptions = [
  { label: 'Período Fixo', value: 'fixed' },
  { label: 'Período Relativo', value: 'relative' }
]

const periodUnitOptions = [
  { label: 'Dias', value: 'days' },
  { label: 'Semanas', value: 'weeks' },
  { label: 'Meses', value: 'months' }
]

const agentOptions = [
  { label: 'João Silva', value: 1 },
  { label: 'Maria Santos', value: 2 },
  { label: 'Pedro Souza', value: 3 }
]

const queueOptions = [
  { label: 'Suporte', value: 1 },
  { label: 'Vendas', value: 2 },
  { label: 'Financeiro', value: 3 }
]

const tagOptions = [
  { label: 'Urgente', value: 'urgent' },
  { label: 'VIP', value: 'vip' },
  { label: 'Bug', value: 'bug' }
]

const statusOptions = [
  { label: 'Aberto', value: 'open' },
  { label: 'Em Andamento', value: 'in_progress' },
  { label: 'Resolvido', value: 'resolved' },
  { label: 'Fechado', value: 'closed' }
]

const frequencyOptions = [
  { label: 'Diário', value: 'daily' },
  { label: 'Semanal', value: 'weekly' },
  { label: 'Mensal', value: 'monthly' }
]

const formatOptions = [
  { label: 'PDF', value: 'pdf' },
  { label: 'Excel', value: 'excel' },
  { label: 'CSV', value: 'csv' }
]

// Watch
watch(() => props.report, (newReport) => {
  if (newReport) {
    form.value = { ...form.value, ...newReport }
  } else {
    resetForm()
  }
}, { immediate: true })

// Métodos
const resetForm = () => {
  form.value = {
    name: '',
    type: '',
    description: '',
    period: {
      type: 'fixed',
      dateRange: {
        from: '',
        to: ''
      },
      value: 1,
      unit: 'days'
    },
    filters: {
      agents: [],
      queues: [],
      tags: [],
      status: []
    },
    settings: {
      scheduled: false,
      frequency: 'daily',
      recipients: '',
      format: 'pdf'
    }
  }
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
