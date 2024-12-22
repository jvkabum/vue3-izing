<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ isEditing ? 'Editar' : 'Novo' }} Fluxo</div>
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
                label="Nome do Fluxo *"
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

          <!-- Configurações de Gatilho -->
          <q-expansion-item
            group="settings"
            icon="play_circle"
            label="Gatilhos"
            default-opened
          >
            <q-card>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <!-- Tipo de Gatilho -->
                  <div class="col-12">
                    <q-select
                      v-model="form.trigger.type"
                      :options="triggerOptions"
                      label="Tipo de Gatilho"
                      outlined
                      dense
                      emit-value
                      map-options
                    />
                  </div>

                  <!-- Palavras-chave (se for gatilho por palavra) -->
                  <div v-if="form.trigger.type === 'keyword'" class="col-12">
                    <q-select
                      v-model="form.trigger.keywords"
                      label="Palavras-chave"
                      use-input
                      use-chips
                      multiple
                      outlined
                      dense
                      @new-value="addKeyword"
                      :input-debounce="0"
                    />
                    <div class="text-caption q-mt-sm">
                      Digite uma palavra e pressione Enter para adicionar
                    </div>
                  </div>

                  <!-- Condições (se for gatilho condicional) -->
                  <div v-if="form.trigger.type === 'condition'" class="col-12">
                    <div v-for="(condition, index) in form.trigger.conditions" :key="index" class="row q-col-gutter-sm q-mb-sm">
                      <div class="col">
                        <q-select
                          v-model="condition.field"
                          :options="conditionFieldOptions"
                          label="Campo"
                          outlined
                          dense
                        />
                      </div>
                      <div class="col">
                        <q-select
                          v-model="condition.operator"
                          :options="conditionOperatorOptions"
                          label="Operador"
                          outlined
                          dense
                        />
                      </div>
                      <div class="col">
                        <q-input
                          v-model="condition.value"
                          label="Valor"
                          outlined
                          dense
                        />
                      </div>
                      <div class="col-auto">
                        <q-btn
                          flat
                          round
                          color="negative"
                          icon="remove"
                          @click="removeCondition(index)"
                        />
                      </div>
                    </div>
                    <q-btn
                      flat
                      color="primary"
                      icon="add"
                      label="Adicionar Condição"
                      @click="addCondition"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- Configurações Avançadas -->
          <q-expansion-item
            group="settings"
            icon="settings"
            label="Configurações Avançadas"
          >
            <q-card>
              <q-card-section>
                <div class="row q-col-gutter-md">
                  <!-- Timeout -->
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model.number="form.settings.timeout"
                      label="Timeout (segundos)"
                      type="number"
                      outlined
                      dense
                      min="0"
                    />
                  </div>

                  <!-- Retry -->
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model.number="form.settings.retryAttempts"
                      label="Tentativas de Retry"
                      type="number"
                      outlined
                      dense
                      min="0"
                    />
                  </div>

                  <!-- Opções -->
                  <div class="col-12">
                    <q-checkbox
                      v-model="form.settings.saveHistory"
                      label="Salvar histórico de execução"
                    />
                  </div>
                  <div class="col-12">
                    <q-checkbox
                      v-model="form.settings.enableLogging"
                      label="Habilitar logs detalhados"
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
  flow: {
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
  status: 'draft',
  trigger: {
    type: 'manual',
    keywords: [],
    conditions: []
  },
  settings: {
    timeout: 30,
    retryAttempts: 3,
    saveHistory: true,
    enableLogging: false
  }
})

// Computed
const isEditing = computed(() => !!props.flow)

// Opções
const statusOptions = [
  { label: 'Rascunho', value: 'draft' },
  { label: 'Ativo', value: 'active' },
  { label: 'Inativo', value: 'inactive' }
]

const triggerOptions = [
  { label: 'Manual', value: 'manual' },
  { label: 'Palavra-chave', value: 'keyword' },
  { label: 'Condicional', value: 'condition' },
  { label: 'Agendado', value: 'scheduled' }
]

const conditionFieldOptions = [
  { label: 'Nome do Cliente', value: 'customer.name' },
  { label: 'Email', value: 'customer.email' },
  { label: 'Telefone', value: 'customer.phone' },
  { label: 'Última Mensagem', value: 'lastMessage' },
  { label: 'Horário', value: 'time' }
]

const conditionOperatorOptions = [
  { label: 'Igual', value: 'eq' },
  { label: 'Diferente', value: 'ne' },
  { label: 'Contém', value: 'contains' },
  { label: 'Maior que', value: 'gt' },
  { label: 'Menor que', value: 'lt' }
]

// Watch
watch(() => props.flow, (newFlow) => {
  if (newFlow) {
    form.value = { ...form.value, ...newFlow }
  } else {
    resetForm()
  }
}, { immediate: true })

// Métodos
const resetForm = () => {
  form.value = {
    name: '',
    description: '',
    status: 'draft',
    trigger: {
      type: 'manual',
      keywords: [],
      conditions: []
    },
    settings: {
      timeout: 30,
      retryAttempts: 3,
      saveHistory: true,
      enableLogging: false
    }
  }
}

const addKeyword = (val, done) => {
  if (val.length > 0) {
    form.value.trigger.keywords.push(val)
    done()
  }
}

const addCondition = () => {
  form.value.trigger.conditions.push({
    field: '',
    operator: 'eq',
    value: ''
  })
}

const removeCondition = (index) => {
  form.value.trigger.conditions.splice(index, 1)
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
