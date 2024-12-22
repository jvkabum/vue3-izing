<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 600px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ isEditing ? 'Editar' : 'Nova' }} Resposta Automática</div>
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
                label="Nome *"
                :rules="[val => !!val || 'Nome é obrigatório']"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-4">
              <q-toggle
                v-model="form.active"
                label="Ativo"
              />
            </div>
          </div>

          <!-- Gatilho -->
          <q-expansion-item
            icon="sensors"
            label="Gatilho"
            header-class="text-primary"
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
                      label="Tipo de Gatilho *"
                      :rules="[val => !!val || 'Tipo de gatilho é obrigatório']"
                      outlined
                      dense
                      emit-value
                      map-options
                    />
                  </div>

                  <!-- Configurações específicas do gatilho -->
                  <template v-if="form.trigger.type === 'keyword'">
                    <div class="col-12">
                      <q-select
                        v-model="form.trigger.keywords"
                        label="Palavras-chave *"
                        use-input
                        use-chips
                        multiple
                        outlined
                        dense
                        :rules="[val => val.length > 0 || 'Adicione pelo menos uma palavra-chave']"
                        @new-value="addKeyword"
                        hint="Digite uma palavra e pressione Enter"
                      />
                    </div>
                    <div class="col-12">
                      <q-checkbox
                        v-model="form.trigger.exactMatch"
                        label="Correspondência exata"
                      />
                    </div>
                  </template>

                  <template v-if="form.trigger.type === 'inactivity'">
                    <div class="col-12">
                      <q-input
                        v-model.number="form.trigger.minutes"
                        label="Minutos de inatividade *"
                        type="number"
                        :rules="[val => val > 0 || 'Tempo deve ser maior que 0']"
                        outlined
                        dense
                        min="1"
                      />
                    </div>
                  </template>

                  <template v-if="form.trigger.type === 'schedule'">
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="form.trigger.time"
                        label="Horário *"
                        type="time"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-12">
                      <q-option-group
                        v-model="form.trigger.days"
                        :options="dayOptions"
                        label="Dias da Semana"
                        type="checkbox"
                        inline
                      />
                    </div>
                  </template>

                  <template v-if="form.trigger.type === 'event'">
                    <div class="col-12">
                      <q-select
                        v-model="form.trigger.event"
                        :options="eventOptions"
                        label="Evento *"
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

          <!-- Mensagem -->
          <q-input
            v-model="form.message"
            label="Mensagem *"
            type="textarea"
            :rules="[val => !!val || 'Mensagem é obrigatória']"
            outlined
            autogrow
            class="message-input"
          >
            <template v-slot:after>
              <q-btn-dropdown
                flat
                dense
                icon="add_circle"
                class="variable-button"
              >
                <q-list>
                  <q-item
                    v-for="variable in availableVariables"
                    :key="variable.value"
                    clickable
                    v-close-popup
                    @click="insertVariable(variable.value)"
                  >
                    <q-item-section>
                      <q-item-label>{{ variable.label }}</q-item-label>
                      <q-item-label caption>{{ variable.value }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </template>
          </q-input>

          <!-- Preview -->
          <div class="preview-section">
            <div class="text-subtitle2 q-mb-sm">Preview</div>
            <div class="preview-content">
              {{ processedMessage }}
            </div>
          </div>

          <!-- Condições -->
          <q-expansion-item
            icon="rule"
            label="Condições"
            header-class="text-primary"
          >
            <q-card>
              <q-card-section>
                <div v-for="(condition, index) in form.conditions" :key="index" class="row q-col-gutter-sm q-mb-sm">
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
                  <!-- Prioridade -->
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model.number="form.settings.priority"
                      label="Prioridade"
                      type="number"
                      outlined
                      dense
                      min="0"
                    />
                  </div>

                  <!-- Opções -->
                  <div class="col-12">
                    <q-checkbox
                      v-model="form.settings.stopProcessing"
                      label="Parar processamento após esta resposta"
                    />
                  </div>
                  <div class="col-12">
                    <q-checkbox
                      v-model="form.settings.markAsRead"
                      label="Marcar mensagem como lida"
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
  reply: {
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
  active: true,
  trigger: {
    type: 'keyword',
    keywords: [],
    exactMatch: false,
    minutes: 5,
    time: '',
    days: [],
    event: ''
  },
  message: '',
  conditions: [],
  settings: {
    priority: 0,
    stopProcessing: false,
    markAsRead: true
  }
})

// Computed
const isEditing = computed(() => !!props.reply)

const processedMessage = computed(() => {
  let message = form.value.message
  availableVariables.forEach(variable => {
    const regex = new RegExp(variable.value, 'g')
    message = message.replace(regex, variable.example || variable.value)
  })
  return message
})

// Opções
const triggerOptions = [
  { label: 'Palavra-chave', value: 'keyword' },
  { label: 'Inatividade', value: 'inactivity' },
  { label: 'Horário', value: 'schedule' },
  { label: 'Evento', value: 'event' }
]

const dayOptions = [
  { label: 'Dom', value: '0' },
  { label: 'Seg', value: '1' },
  { label: 'Ter', value: '2' },
  { label: 'Qua', value: '3' },
  { label: 'Qui', value: '4' },
  { label: 'Sex', value: '5' },
  { label: 'Sáb', value: '6' }
]

const eventOptions = [
  { label: 'Início do Atendimento', value: 'conversation_start' },
  { label: 'Fim do Atendimento', value: 'conversation_end' },
  { label: 'Transferência', value: 'transfer' },
  { label: 'Fora do Horário', value: 'out_of_hours' }
]

const availableVariables = [
  {
    label: 'Nome do Cliente',
    value: '{{customer.name}}',
    example: 'João Silva'
  },
  {
    label: 'Nome do Atendente',
    value: '{{agent.name}}',
    example: 'Maria Santos'
  },
  {
    label: 'Fila Atual',
    value: '{{queue.name}}',
    example: 'Suporte'
  }
]

const conditionFieldOptions = [
  { label: 'Cliente', value: 'customer' },
  { label: 'Fila', value: 'queue' },
  { label: 'Horário', value: 'time' },
  { label: 'Tag', value: 'tag' }
]

const conditionOperatorOptions = [
  { label: 'Igual', value: 'eq' },
  { label: 'Diferente', value: 'ne' },
  { label: 'Contém', value: 'contains' },
  { label: 'Não Contém', value: 'not_contains' }
]

// Watch
watch(() => props.reply, (newReply) => {
  if (newReply) {
    form.value = { ...form.value, ...newReply }
  } else {
    resetForm()
  }
}, { immediate: true })

// Métodos
const resetForm = () => {
  form.value = {
    name: '',
    active: true,
    trigger: {
      type: 'keyword',
      keywords: [],
      exactMatch: false,
      minutes: 5,
      time: '',
      days: [],
      event: ''
    },
    message: '',
    conditions: [],
    settings: {
      priority: 0,
      stopProcessing: false,
      markAsRead: true
    }
  }
}

const addKeyword = (val, done) => {
  if (val.length > 0) {
    form.value.trigger.keywords.push(val)
    done()
  }
}

const insertVariable = (variable) => {
  const textarea = document.querySelector('.message-input textarea')
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = form.value.message
  
  form.value.message = text.substring(0, start) + variable + text.substring(end)
  
  setTimeout(() => {
    textarea.selectionStart = textarea.selectionEnd = start + variable.length
    textarea.focus()
  })
}

const addCondition = () => {
  form.value.conditions.push({
    field: '',
    operator: 'eq',
    value: ''
  })
}

const removeCondition = (index) => {
  form.value.conditions.splice(index, 1)
}

const handleSubmit = () => {
  emit('save', { ...form.value })
}

defineExpose({
  resetForm
})
</script>

<style lang="scss" scoped>
.preview-section {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
  padding: 12px;

  .preview-content {
    white-space: pre-wrap;
    font-family: monospace;
    font-size: 14px;
  }
}

.variable-button {
  border-left: 1px solid rgba(0, 0, 0, 0.12);
}

.q-expansion-item {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  margin-bottom: 8px;

  .q-card {
    box-shadow: none;
  }
}

.dark {
  .preview-section {
    background: rgba(255, 255, 255, 0.05);
  }

  .variable-button {
    border-left-color: rgba(255, 255, 255, 0.12);
  }

  .q-expansion-item {
    border-color: rgba(255, 255, 255, 0.12);
  }
}
</style>
