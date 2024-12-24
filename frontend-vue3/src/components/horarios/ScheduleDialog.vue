<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 400px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ isEditing ? 'Editar' : 'Novo' }} Horário</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <!-- Dia da Semana -->
          <q-select
            v-if="!day"
            v-model="form.day"
            :options="weekDayOptions"
            label="Dia da Semana *"
            :rules="[val => !!val || 'Dia é obrigatório']"
            outlined
            dense
            emit-value
            map-options
          />

          <!-- Horário -->
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
                label="Capacidade de Atendimento"
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

          <!-- Configurações -->
          <q-expansion-item
            icon="settings"
            label="Configurações Avançadas"
            header-class="text-primary"
          >
            <q-card>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <!-- Tipo de Agendamento -->
                  <div class="col-12">
                    <q-select
                      v-model="form.settings.scheduleType"
                      :options="scheduleTypeOptions"
                      label="Tipo de Agendamento"
                      outlined
                      dense
                      emit-value
                      map-options
                    />
                  </div>

                  <!-- Duração -->
                  <div class="col-12">
                    <q-input
                      v-model.number="form.settings.duration"
                      label="Duração Padrão (min)"
                      type="number"
                      outlined
                      dense
                      min="1"
                    />
                  </div>

                  <!-- Opções -->
                  <div class="col-12">
                    <q-checkbox
                      v-model="form.settings.allowOverbook"
                      label="Permitir Overbooking"
                    />
                  </div>
                  <div class="col-12">
                    <q-checkbox
                      v-model="form.settings.requireApproval"
                      label="Requer Aprovação"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- Restrições -->
          <q-expansion-item
            icon="block"
            label="Restrições"
            header-class="text-primary"
          >
            <q-card>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <!-- Grupos -->
                  <div class="col-12">
                    <q-select
                      v-model="form.restrictions.groups"
                      :options="groupOptions"
                      label="Grupos Permitidos"
                      multiple
                      outlined
                      dense
                      use-chips
                    />
                  </div>

                  <!-- Tags -->
                  <div class="col-12">
                    <q-select
                      v-model="form.restrictions.tags"
                      :options="tagOptions"
                      label="Tags Necessárias"
                      multiple
                      outlined
                      dense
                      use-chips
                    />
                  </div>

                  <!-- Limite por Cliente -->
                  <div class="col-12">
                    <q-input
                      v-model.number="form.restrictions.customerLimit"
                      label="Limite por Cliente"
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
  schedule: {
    type: Object,
    default: null
  },
  day: {
    type: String,
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
  day: props.day || '',
  start: '',
  end: '',
  capacity: 1,
  interval: 0,
  settings: {
    scheduleType: 'fixed',
    duration: 30,
    allowOverbook: false,
    requireApproval: false
  },
  restrictions: {
    groups: [],
    tags: [],
    customerLimit: 0
  }
})

// Computed
const isEditing = computed(() => !!props.schedule)

// Opções
const weekDayOptions = [
  { label: 'Domingo', value: '0' },
  { label: 'Segunda', value: '1' },
  { label: 'Terça', value: '2' },
  { label: 'Quarta', value: '3' },
  { label: 'Quinta', value: '4' },
  { label: 'Sexta', value: '5' },
  { label: 'Sábado', value: '6' }
]

const scheduleTypeOptions = [
  { label: 'Horários Fixos', value: 'fixed' },
  { label: 'Flexível', value: 'flexible' }
]

const groupOptions = [
  { label: 'Suporte', value: 'support' },
  { label: 'Vendas', value: 'sales' },
  { label: 'Financeiro', value: 'financial' }
]

const tagOptions = [
  { label: 'VIP', value: 'vip' },
  { label: 'Premium', value: 'premium' },
  { label: 'Prioritário', value: 'priority' }
]

// Watch
watch(() => props.schedule, (newSchedule) => {
  if (newSchedule) {
    form.value = { ...form.value, ...newSchedule }
  } else {
    resetForm()
  }
}, { immediate: true })

// Métodos
const resetForm = () => {
  form.value = {
    day: props.day || '',
    start: '',
    end: '',
    capacity: 1,
    interval: 0,
    settings: {
      scheduleType: 'fixed',
      duration: 30,
      allowOverbook: false,
      requireApproval: false
    },
    restrictions: {
      groups: [],
      tags: [],
      customerLimit: 0
    }
  }
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
