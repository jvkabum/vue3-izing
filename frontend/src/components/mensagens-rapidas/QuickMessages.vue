<template>
  <div class="quick-messages">
    <!-- Cabeçalho -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Mensagens Rápidas</div>
      <div class="row q-gutter-sm">
        <q-btn
          color="primary"
          icon="add"
          label="Nova Mensagem"
          @click="openMessageDialog()"
        />
        <q-btn-dropdown color="secondary" label="Ações">
          <q-list>
            <q-item clickable v-close-popup @click="importMessages">
              <q-item-section avatar>
                <q-icon name="upload_file" />
              </q-item-section>
              <q-item-section>Importar Mensagens</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="exportMessages">
              <q-item-section avatar>
                <q-icon name="download" />
              </q-item-section>
              <q-item-section>Exportar Mensagens</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <!-- Filtros -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="searchTerm"
          dense
          outlined
          placeholder="Buscar mensagens..."
          clearable
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-8 row q-col-gutter-sm">
        <div class="col">
          <q-select
            v-model="selectedCategory"
            :options="categoryOptions"
            label="Categoria"
            outlined
            dense
            clearable
            emit-value
            map-options
          />
        </div>
        <div class="col">
          <q-select
            v-model="selectedTags"
            :options="tagOptions"
            label="Tags"
            multiple
            outlined
            dense
            use-chips
          />
        </div>
      </div>
    </div>

    <!-- Lista de Mensagens -->
    <div class="messages-grid">
      <q-card
        v-for="message in filteredMessages"
        :key="message.id"
        class="message-card"
        :class="{ 'message-card--shortcut': message.shortcut }"
      >
        <q-card-section>
          <!-- Cabeçalho -->
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-subtitle1 text-weight-medium">
              {{ message.title }}
            </div>
            <div class="row q-gutter-sm">
              <q-btn
                flat
                round
                dense
                color="grey"
                icon="content_copy"
                @click="copyMessage(message)"
              >
                <q-tooltip>Copiar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="edit"
                @click="openMessageDialog(message)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                @click="confirmDelete(message)"
              >
                <q-tooltip>Excluir</q-tooltip>
              </q-btn>
            </div>
          </div>

          <!-- Atalho -->
          <div v-if="message.shortcut" class="shortcut q-mb-sm">
            <q-chip
              dense
              color="primary"
              text-color="white"
              icon="keyboard"
            >
              {{ message.shortcut }}
            </q-chip>
          </div>

          <!-- Preview -->
          <div class="message-preview">
            {{ message.content }}
          </div>

          <!-- Rodapé -->
          <div class="row items-center justify-between q-mt-sm">
            <!-- Tags -->
            <div class="row q-gutter-x-xs">
              <q-chip
                v-for="tag in message.tags"
                :key="tag"
                dense
                size="sm"
              >
                {{ tag }}
              </q-chip>
            </div>

            <!-- Categoria -->
            <div class="text-caption text-grey">
              {{ getCategoryLabel(message.category) }}
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Dialogs -->
    <message-dialog
      v-model="showMessageDialog"
      :message="selectedMessage"
      @save="saveMessage"
    />

    <!-- Dialog de Confirmação -->
    <q-dialog v-model="showConfirmDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span class="q-ml-sm">Deseja realmente excluir esta mensagem?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn
            flat
            label="Excluir"
            color="negative"
            @click="deleteMessage"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useQuickMessages } from '../../composables/mensagens-rapidas/useQuickMessages'
import { useNotificationSystem } from '../../composables/sistema/useNotificationSystem'
import MessageDialog from './MessageDialog.vue'

// Composables
const $q = useQuasar()
const {
  messages,
  categories,
  saveMessage: saveMessageData,
  deleteMessage: deleteMessageData,
  importMessages: importMessagesData,
  exportMessages: exportMessagesData
} = useQuickMessages()
const { notifySuccess, notifyError } = useNotificationSystem()

// Estado
const searchTerm = ref('')
const selectedCategory = ref(null)
const selectedTags = ref([])
const showMessageDialog = ref(false)
const showConfirmDialog = ref(false)
const selectedMessage = ref(null)
const messageToDelete = ref(null)

// Computed
const categoryOptions = computed(() => 
  categories.value.map(category => ({
    label: category.name,
    value: category.id
  }))
)

const tagOptions = computed(() => {
  const tags = new Set()
  messages.value.forEach(message => {
    message.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags)
})

const filteredMessages = computed(() => {
  let filtered = [...messages.value]

  // Busca
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(message =>
      message.title.toLowerCase().includes(search) ||
      message.content.toLowerCase().includes(search) ||
      message.shortcut?.toLowerCase().includes(search)
    )
  }

  // Categoria
  if (selectedCategory.value) {
    filtered = filtered.filter(message => 
      message.category === selectedCategory.value
    )
  }

  // Tags
  if (selectedTags.value.length) {
    filtered = filtered.filter(message =>
      selectedTags.value.every(tag => message.tags.includes(tag))
    )
  }

  return filtered
})

// Métodos
const openMessageDialog = (message = null) => {
  selectedMessage.value = message
  showMessageDialog.value = true
}

const saveMessage = async (messageData) => {
  try {
    await saveMessageData(messageData)
    showMessageDialog.value = false
    notifySuccess('Mensagem salva com sucesso')
  } catch (err) {
    notifyError('Erro ao salvar mensagem')
  }
}

const confirmDelete = (message) => {
  messageToDelete.value = message
  showConfirmDialog.value = true
}

const deleteMessage = async () => {
  try {
    await deleteMessageData(messageToDelete.value.id)
    notifySuccess('Mensagem excluída com sucesso')
  } catch (err) {
    notifyError('Erro ao excluir mensagem')
  }
}

const copyMessage = (message) => {
  navigator.clipboard.writeText(message.content)
    .then(() => {
      notifySuccess('Mensagem copiada para a área de transferência')
    })
    .catch(() => {
      notifyError('Erro ao copiar mensagem')
    })
}

const importMessages = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  
  input.onchange = async (e) => {
    try {
      const file = e.target.files[0]
      await importMessagesData(file)
      notifySuccess('Mensagens importadas com sucesso')
    } catch (err) {
      notifyError('Erro ao importar mensagens')
    }
  }
  
  input.click()
}

const exportMessages = async () => {
  try {
    await exportMessagesData()
    notifySuccess('Mensagens exportadas com sucesso')
  } catch (err) {
    notifyError('Erro ao exportar mensagens')
  }
}

const getCategoryLabel = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category?.name || 'Sem categoria'
}
</script>

<style lang="scss" scoped>
.quick-messages {
  padding: 20px;

  .messages-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;

    .message-card {
      height: 100%;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      &--shortcut {
        border-left: 4px solid var(--q-primary);
      }

      .message-preview {
        max-height: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.7);
      }
    }
  }
}

.dark {
  .message-card {
    &:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    .message-preview {
      color: rgba(255, 255, 255, 0.7);
    }
  }
}
</style>
