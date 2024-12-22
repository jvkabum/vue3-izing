<template>
  <div class="queue-list">
    <!-- Cabeçalho -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Filas de Atendimento</div>
      <div class="row q-gutter-sm">
        <q-btn
          color="primary"
          icon="add"
          label="Nova Fila"
          @click="openQueueDialog()"
        />
      </div>
    </div>

    <!-- Filtros -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="searchTerm"
          dense
          outlined
          placeholder="Buscar filas..."
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
            v-model="selectedStatus"
            :options="statusOptions"
            outlined
            dense
            label="Status"
            clearable
            emit-value
            map-options
          />
        </div>
      </div>
    </div>

    <!-- Lista de Filas -->
    <div class="row q-col-gutter-md">
      <div v-for="queue in filteredQueues" :key="queue.id" class="col-12 col-md-4">
        <q-card class="queue-card">
          <q-card-section>
            <!-- Cabeçalho da Fila -->
            <div class="row items-center justify-between">
              <div class="text-h6">{{ queue.name }}</div>
              <div class="row q-gutter-sm">
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="edit"
                  size="sm"
                  @click="openQueueDialog(queue)"
                >
                  <q-tooltip>Editar fila</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="confirmDelete(queue)"
                >
                  <q-tooltip>Excluir fila</q-tooltip>
                </q-btn>
              </div>
            </div>

            <!-- Status da Fila -->
            <div class="row items-center q-mt-sm">
              <q-chip
                :color="getStatusColor(queue.status)"
                text-color="white"
                size="sm"
              >
                {{ getStatusLabel(queue.status) }}
              </q-chip>
            </div>

            <!-- Métricas -->
            <div class="row q-col-gutter-md q-mt-md">
              <div class="col-6">
                <div class="text-caption text-grey">Atendentes</div>
                <div class="text-h6">{{ queue.agents?.length || 0 }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey">Em Espera</div>
                <div class="text-h6">{{ queue.waitingTickets || 0 }}</div>
              </div>
            </div>

            <!-- Configurações -->
            <q-list dense class="q-mt-md">
              <q-item>
                <q-item-section>
                  <q-item-label caption>Horário de Funcionamento</q-item-label>
                  <q-item-label>{{ formatSchedule(queue.schedule) }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Tempo Médio de Espera</q-item-label>
                  <q-item-label>{{ formatWaitTime(queue.averageWaitTime) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <!-- Atendentes -->
          <q-card-section>
            <div class="text-subtitle2">Atendentes</div>
            <div class="row q-gutter-xs q-mt-sm">
              <q-avatar
                v-for="agent in queue.agents"
                :key="agent.id"
                size="32px"
                class="cursor-pointer"
              >
                <img :src="agent.avatar || 'default-avatar.png'" />
                <q-tooltip>{{ agent.name }}</q-tooltip>
              </q-avatar>
              <q-btn
                flat
                round
                color="primary"
                icon="person_add"
                size="sm"
                @click="openAgentDialog(queue)"
              >
                <q-tooltip>Adicionar atendente</q-tooltip>
              </q-btn>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialog de Fila -->
    <queue-dialog
      v-model="showQueueDialog"
      :queue="selectedQueue"
      @save="saveQueue"
    />

    <!-- Dialog de Atendentes -->
    <agent-dialog
      v-model="showAgentDialog"
      :queue="selectedQueue"
      @save="saveAgents"
    />

    <!-- Dialog de Confirmação -->
    <q-dialog v-model="showConfirmDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span class="q-ml-sm">Deseja realmente excluir esta fila?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Excluir" color="negative" @click="deleteQueue" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQueue } from '../../composables/fila/useQueue'
import { useNotificationSystem } from '../../composables/sistema/useNotificationSystem'
import QueueDialog from './QueueDialog.vue'
import AgentDialog from './AgentDialog.vue'

// Composables
const { 
  queues,
  loading,
  error,
  createQueue,
  updateQueue,
  deleteQueue: removeQueue,
  loadQueues
} = useQueue()
const { notifySuccess, notifyError } = useNotificationSystem()

// Estado
const searchTerm = ref('')
const selectedStatus = ref(null)
const showQueueDialog = ref(false)
const showAgentDialog = ref(false)
const showConfirmDialog = ref(false)
const selectedQueue = ref(null)
const queueToDelete = ref(null)

// Opções
const statusOptions = [
  { label: 'Ativa', value: 'active' },
  { label: 'Inativa', value: 'inactive' }
]

// Computed
const filteredQueues = computed(() => {
  let filtered = [...queues.value]

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(queue => 
      queue.name.toLowerCase().includes(search)
    )
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(queue => queue.status === selectedStatus.value)
  }

  return filtered
})

// Métodos
const openQueueDialog = (queue = null) => {
  selectedQueue.value = queue
  showQueueDialog.value = true
}

const openAgentDialog = (queue) => {
  selectedQueue.value = queue
  showAgentDialog.value = true
}

const saveQueue = async (queueData) => {
  try {
    if (queueData.id) {
      await updateQueue(queueData)
      notifySuccess('Fila atualizada com sucesso')
    } else {
      await createQueue(queueData)
      notifySuccess('Fila criada com sucesso')
    }
    showQueueDialog.value = false
    loadQueues()
  } catch (err) {
    notifyError('Erro ao salvar fila')
  }
}

const saveAgents = async (agents) => {
  try {
    await updateQueue({
      ...selectedQueue.value,
      agents
    })
    notifySuccess('Atendentes atualizados com sucesso')
    showAgentDialog.value = false
    loadQueues()
  } catch (err) {
    notifyError('Erro ao atualizar atendentes')
  }
}

const confirmDelete = (queue) => {
  queueToDelete.value = queue
  showConfirmDialog.value = true
}

const deleteQueue = async () => {
  try {
    await removeQueue(queueToDelete.value.id)
    notifySuccess('Fila excluída com sucesso')
    loadQueues()
  } catch (err) {
    notifyError('Erro ao excluir fila')
  }
}

const getStatusColor = (status) => {
  const colors = {
    active: 'positive',
    inactive: 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    active: 'Ativa',
    inactive: 'Inativa'
  }
  return labels[status] || status
}

const formatSchedule = (schedule) => {
  if (!schedule) return 'Não definido'
  return `${schedule.start} - ${schedule.end}`
}

const formatWaitTime = (minutes) => {
  if (!minutes) return '0min'
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
}

// Lifecycle
onMounted(async () => {
  try {
    await loadQueues()
  } catch (err) {
    notifyError('Erro ao carregar filas')
  }
})
</script>

<style lang="scss" scoped>
.queue-list {
  padding: 20px;

  .queue-card {
    height: 100%;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  }
}

.dark {
  .queue-card {
    &:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
  }
}
</style>
