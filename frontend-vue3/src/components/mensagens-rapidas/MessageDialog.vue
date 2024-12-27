<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 600px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ isEditing ? 'Editar' : 'Nova' }} Mensagem</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <!-- Título e Atalho -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-8">
              <q-input
                v-model="form.title"
                label="Título *"
                :rules="[val => !!val || 'Título é obrigatório']"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.shortcut"
                label="Atalho"
                outlined
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="keyboard" />
                </template>
                <template v-slot:hint>
                  Ex: /ola, /obrigado
                </template>
              </q-input>
            </div>
          </div>

          <!-- Mensagem -->
          <q-input
            v-model="form.content"
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
              {{ processedContent }}
            </div>
          </div>

          <!-- Categoria e Tags -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.category"
                :options="categoryOptions"
                label="Categoria"
                outlined
                dense
                emit-value
                map-options
                :rules="[val => !!val || 'Categoria é obrigatória']"
              >
                <template v-slot:after>
                  <q-btn
                    round
                    flat
                    dense
                    icon="add"
                    @click="openCategoryDialog"
                  >
                    <q-tooltip>Nova Categoria</q-tooltip>
                  </q-btn>
                </template>
              </q-select>
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.tags"
                :options="tagOptions"
                label="Tags"
                multiple
                use-input
                use-chips
                outlined
                dense
                @new-value="createTag"
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
                  <!-- Permissões -->
                  <div class="col-12">
                    <q-select
                      v-model="form.permissions.roles"
                      :options="roleOptions"
                      label="Permissões"
                      multiple
                      outlined
                      dense
                      use-chips
                    />
                  </div>

                  <!-- Opções -->
                  <div class="col-12">
                    <q-checkbox
                      v-model="form.settings.active"
                      label="Ativa"
                    />
                  </div>
                  <div class="col-12">
                    <q-checkbox
                      v-model="form.settings.requireConfirmation"
                      label="Requer confirmação antes de enviar"
                    />
                  </div>
                  <div class="col-12">
                    <q-checkbox
                      v-model="form.settings.allowEdit"
                      label="Permitir edição antes de enviar"
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

    <!-- Dialog de Nova Categoria -->
    <q-dialog v-model="showCategoryDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Nova Categoria</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="newCategory"
            label="Nome da Categoria"
            outlined
            dense
            autofocus
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn
            label="Criar"
            color="primary"
            @click="createCategory"
            :disable="!newCategory"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  message: {
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
  title: '',
  shortcut: '',
  content: '',
  category: '',
  tags: [],
  permissions: {
    roles: []
  },
  settings: {
    active: true,
    requireConfirmation: false,
    allowEdit: true
  }
})

const showCategoryDialog = ref(false)
const newCategory = ref('')

// Computed
const isEditing = computed(() => !!props.message)

const processedContent = computed(() => {
  let content = form.value.content
  availableVariables.forEach(variable => {
    const regex = new RegExp(variable.value, 'g')
    content = content.replace(regex, variable.example || variable.value)
  })
  return content
})

// Opções
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
    label: 'Data',
    value: '{{date}}',
    example: '01/01/2024'
  },
  {
    label: 'Hora',
    value: '{{time}}',
    example: '14:30'
  }
]

const categoryOptions = [
  { label: 'Saudações', value: 'greetings' },
  { label: 'Despedidas', value: 'farewells' },
  { label: 'Suporte', value: 'support' },
  { label: 'Vendas', value: 'sales' }
]

const tagOptions = [
  'início',
  'fim',
  'suporte',
  'vendas',
  'formal',
  'informal'
]

const roleOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Administradores', value: 'admin' },
  { label: 'Atendentes', value: 'agent' },
  { label: 'Supervisores', value: 'supervisor' }
]

// Watch
watch(() => props.message, (newMessage) => {
  if (newMessage) {
    form.value = { ...form.value, ...newMessage }
  } else {
    resetForm()
  }
}, { immediate: true })

// Métodos
const resetForm = () => {
  form.value = {
    title: '',
    shortcut: '',
    content: '',
    category: '',
    tags: [],
    permissions: {
      roles: []
    },
    settings: {
      active: true,
      requireConfirmation: false,
      allowEdit: true
    }
  }
}

const insertVariable = (variable) => {
  const textarea = document.querySelector('.message-input textarea')
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = form.value.content
  
  form.value.content = text.substring(0, start) + variable + text.substring(end)
  
  // Reposiciona o cursor após a variável inserida
  setTimeout(() => {
    textarea.selectionStart = textarea.selectionEnd = start + variable.length
    textarea.focus()
  })
}

const createTag = (val, done) => {
  if (val.length > 0) {
    if (!form.value.tags.includes(val)) {
      form.value.tags.push(val)
    }
    done()
  }
}

const openCategoryDialog = () => {
  showCategoryDialog.value = true
  newCategory.value = ''
}

const createCategory = () => {
  if (newCategory.value) {
    // Aqui você implementaria a lógica para salvar a nova categoria
    categoryOptions.push({
      label: newCategory.value,
      value: newCategory.value.toLowerCase()
    })
    form.value.category = newCategory.value.toLowerCase()
    showCategoryDialog.value = false
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

.dark {
  .preview-section {
    background: rgba(255, 255, 255, 0.05);
  }

  .variable-button {
    border-left-color: rgba(255, 255, 255, 0.12);
  }
}
</style>
