<template>
  <div class="auto-reply">
    <!-- Cabeçalho -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Respostas Automáticas</div>
      <div class="row q-gutter-sm">
        <q-btn
          color="primary"
          icon="add"
          label="Nova Resposta"
          @click="openReplyDialog()"
        />
        <q-btn-dropdown color="secondary" label="Ações">
          <q-list>
            <q-item clickable v-close-popup @click="importReplies">
              <q-item-section avatar>
                <q-icon name="upload_file" />
              </q-item-section>
              <q-item-section>Importar Respostas</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="exportReplies">
              <q-item-section avatar>
                <q-icon name="download" />
              </q-item-section>
              <q-item-section>Exportar Respostas</q-item-section>
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
          placeholder="Buscar respostas..."
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
            v-model="selectedTrigger"
            :options="triggerOptions"
            label="Tipo de Gatilho"
            outlined
            dense
            clearable
            emit-value
            map-options
          />
        </div>
        <div class="col">
          <q-select
            v-model="selectedStatus"
            :options="statusOptions"
            label="Status"
            outlined
            dense
            clearable
            emit-value
            map-options
          />
        </div>
      </div>
    </div>

    <!-- Lista de Respostas -->
    <div class="replies-grid">
      <q-card
        v-for="reply in filteredReplies"
        :key="reply.id"
        class="reply-card"
        :class="{ 'reply-card--active': reply.active }"
      >
        <q-card-section>
          <!-- Cabeçalho -->
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-subtitle1 text-weight-medium">
              {{ reply.name }}
            </div>
            <div class="row q-gutter-sm">
              <q-btn
                flat
                round
                dense
                :color="reply.active ? 'positive' : 'grey'"
                :icon="reply.active ? 'check_circle' : 'radio_button_unchecked'"
                @click="toggleReplyStatus(reply)"
              >
                <q-tooltip>{{ reply.active ? 'Ativo' : 'Inativo' }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="edit"
                @click="openReplyDialog(reply)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                @click="confirmDelete(reply)"
              >
                <q-tooltip>Excluir</q-tooltip>
              </q-btn>
            </div>
          </div>

          <!-- Gatilho -->
          <div class="trigger-section q-mb-sm">
            <q-chip
              :color="getTriggerColor(reply.trigger.type)"
              text-color="white"
              dense
            >
              {{ getTriggerLabel(reply.trigger.type) }}
            </q-chip>
            <div class="trigger-preview q-mt-xs">
              {{ getTriggerPreview(reply.trigger) }}
            </div>
          </div>

          <!-- Preview -->
          <div class="message-preview">
            {{ reply.message }}
          </div>

          <!-- Rodapé -->
          <div class="row items-center justify-between q-mt-sm">
            <!-- Condições -->
            <div class="conditions-preview text-caption text-grey">
              {{ getConditionsPreview(reply.conditions) }}
            </div>

            <!-- Estatísticas -->
            <div class="stats-preview text-caption">
              <q-icon name="send" size="xs" />
              <span class="q-ml-xs">{{ reply.stats.usageCount }} envios</span>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Dialogs -->
    <reply-dialog
      v-model="showReplyDialog"
      :reply="selectedReply"
      @save="saveReply"
    />

    <!-- Dialog de Confirmação -->
    <q-dialog v-model="showConfirmDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span class="q-ml-sm">Deseja realmente excluir esta resposta?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn
            flat
            label="Excluir"
            color="negative"
            @click="deleteReply"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAutoReply } from '../../composables/fluxo/useAutoReply'
import { useNotificationSystem } from '../../composables/sistema/useNotificationSystem'
import ReplyDialog from './ReplyDialog.vue'

// Composables
const {
  replies,
  saveReply: saveReplyData,
  deleteReply: deleteReplyData,
  toggleStatus,
  importReplies: importRepliesData,
  exportReplies: exportRepliesData
} = useAutoReply()
const { notifySuccess, notifyError } = useNotificationSystem()

// Estado
const searchTerm = ref('')
const selectedTrigger = ref(null)
const selectedStatus = ref(null)
const showReplyDialog = ref(false)
const showConfirmDialog = ref(false)
const selectedReply = ref(null)
const replyToDelete = ref(null)

// Opções
const triggerOptions = [
  { label: 'Palavra-chave', value: 'keyword' },
  { label: 'Inatividade', value: 'inactivity' },
  { label: 'Horário', value: 'schedule' },
  { label: 'Evento', value: 'event' }
]

const statusOptions = [
  { label: 'Ativo', value: 'active' },
  { label: 'Inativo', value: 'inactive' }
]

// Computed
const filteredReplies = computed(() => {
  let filtered = [...replies.value]

  // Busca
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(reply =>
      reply.name.toLowerCase().includes(search) ||
      reply.message.toLowerCase().includes(search) ||
      (reply.trigger.keywords?.some(k => k.toLowerCase().includes(search)))
    )
  }

  // Tipo de Gatilho
  if (selectedTrigger.value) {
    filtered = filtered.filter(reply =>
      reply.trigger.type === selectedTrigger.value
    )
  }

  // Status
  if (selectedStatus.value) {
    filtered = filtered.filter(reply =>
      reply.active === (selectedStatus.value === 'active')
    )
  }

  return filtered
})

// Métodos
const openReplyDialog = (reply = null) => {
  selectedReply.value = reply
  showReplyDialog.value = true
}

const saveReply = async (replyData) => {
  try {
    await saveReplyData(replyData)
    showReplyDialog.value = false
    notifySuccess('Resposta salva com sucesso')
  } catch (err) {
    notifyError('Erro ao salvar resposta')
  }
}

const confirmDelete = (reply) => {
  replyToDelete.value = reply
  showConfirmDialog.value = true
}

const deleteReply = async () => {
  try {
    await deleteReplyData(replyToDelete.value.id)
    notifySuccess('Resposta excluída com sucesso')
  } catch (err) {
    notifyError('Erro ao excluir resposta')
  }
}

const toggleReplyStatus = async (reply) => {
  try {
    await toggleStatus(reply.id)
    notifySuccess(`Resposta ${reply.active ? 'desativada' : 'ativada'} com sucesso`)
  } catch (err) {
    notifyError('Erro ao alterar status da resposta')
  }
}

const importReplies = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  
  input.onchange = async (e) => {
    try {
      const file = e.target.files[0]
      await importRepliesData(file)
      notifySuccess('Respostas importadas com sucesso')
    } catch (err) {
      notifyError('Erro ao importar respostas')
    }
  }
  
  input.click()
}

const exportReplies = async () => {
  try {
    await exportRepliesData()
    notifySuccess('Respostas exportadas com sucesso')
  } catch (err) {
    notifyError('Erro ao exportar respostas')
  }
}

const getTriggerColor = (type) => {
  const colors = {
    keyword: 'primary',
    inactivity: 'warning',
    schedule: 'info',
    event: 'purple'
  }
  return colors[type] || 'grey'
}

const getTriggerLabel = (type) => {
  const labels = {
    keyword: 'Palavra-chave',
    inactivity: 'Inatividade',
    schedule: 'Horário',
    event: 'Evento'
  }
  return labels[type] || type
}

const getTriggerPreview = (trigger) => {
  switch (trigger.type) {
    case 'keyword':
      return `Palavras-chave: ${trigger.keywords.join(', ')}`
    case 'inactivity':
      return `Após ${trigger.minutes} minutos de inatividade`
    case 'schedule':
      return `${trigger.time} (${trigger.days.join(', ')})`
    case 'event':
      return `Evento: ${trigger.event}`
    default:
      return ''
  }
}

const getConditionsPreview = (conditions) => {
  if (!conditions?.length) return 'Sem condições'
  return `${conditions.length} condição(ões)`
}
</script>

<style lang="scss" scoped>
.auto-reply {
  padding: 20px;

  .replies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;

    .reply-card {
      height: 100%;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      &--active {
        border-left: 4px solid var(--q-positive);
      }

      .trigger-preview {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.7);
      }

      .message-preview {
        max-height: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.7);
      }
    }
  }
}

.dark {
  .reply-card {
    &:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    .trigger-preview,
    .message-preview {
      color: rgba(255, 255, 255, 0.7);
    }
  }
}
</style>
