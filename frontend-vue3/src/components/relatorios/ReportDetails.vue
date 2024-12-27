<template>
  <div class="report-details">
    <!-- Informações Básicas -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-subtitle1 q-mb-md">Informações do Atendimento</div>
            <q-list dense>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Protocolo</q-item-label>
                  <q-item-label>{{ data.protocol }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label caption>Data/Hora</q-item-label>
                  <q-item-label>{{ formatDateTime(data.date) }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label caption>Status</q-item-label>
                  <q-item-label>
                    <q-chip
                      :color="getStatusColor(data.status)"
                      text-color="white"
                      dense
                    >
                      {{ data.status }}
                    </q-chip>
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label caption>Duração</q-item-label>
                  <q-item-label>{{ data.duration }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-subtitle1 q-mb-md">Participantes</div>
            <q-list dense>
              <q-item>
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="data.customer?.avatar || 'default-avatar.png'" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Cliente</q-item-label>
                  <q-item-label>{{ data.customer?.name }}</q-item-label>
                  <q-item-label caption>{{ data.customer?.email }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="data.agent?.avatar || 'default-avatar.png'" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Atendente</q-item-label>
                  <q-item-label>{{ data.agent?.name }}</q-item-label>
                  <q-item-label caption>{{ data.agent?.email }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label caption>Fila</q-item-label>
                  <q-item-label>{{ data.queue }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Métricas -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="metric in metrics" :key="metric.id" class="col-12 col-md-3">
        <q-card class="metric-card">
          <q-card-section>
            <div class="text-subtitle2 text-grey">{{ metric.label }}</div>
            <div class="text-h5 q-mt-sm">{{ metric.value }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Timeline -->
    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">Timeline do Atendimento</div>
        <q-timeline color="primary">
          <q-timeline-entry
            v-for="event in timeline"
            :key="event.id"
            :title="event.title"
            :subtitle="formatDateTime(event.timestamp)"
            :icon="event.icon"
            :color="event.color"
          >
            <div v-if="event.content">{{ event.content }}</div>
          </q-timeline-entry>
        </q-timeline>
      </q-card-section>
    </q-card>

    <!-- Mensagens -->
    <q-card>
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">Histórico de Mensagens</div>
        <div class="messages-container">
          <div
            v-for="message in messages"
            :key="message.id"
            :class="[
              'message',
              `message--${message.direction}`
            ]"
          >
            <div class="message-content">
              <div class="message-text">{{ message.content }}</div>
              <div class="message-meta">
                {{ formatTime(message.timestamp) }}
                <q-icon
                  v-if="message.direction === 'outbound'"
                  :name="getMessageStatusIcon(message.status)"
                  :color="getMessageStatusColor(message.status)"
                  size="xs"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tags -->
    <div class="fixed-bottom-right q-pa-md">
      <div class="row q-gutter-x-sm justify-end">
        <q-chip
          v-for="tag in data.tags"
          :key="tag"
          color="primary"
          text-color="white"
        >
          {{ tag }}
        </q-chip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { date } from 'quasar'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

// Computed
const metrics = computed(() => [
  {
    id: 1,
    label: 'Tempo de Espera',
    value: formatDuration(props.data.waitTime)
  },
  {
    id: 2,
    label: 'Tempo de Atendimento',
    value: formatDuration(props.data.serviceTime)
  },
  {
    id: 3,
    label: 'Mensagens Trocadas',
    value: props.data.messageCount
  },
  {
    id: 4,
    label: 'Satisfação',
    value: props.data.satisfaction ? `${props.data.satisfaction}/5` : 'N/A'
  }
])

const timeline = computed(() => [
  {
    id: 1,
    title: 'Início do Atendimento',
    timestamp: props.data.startTime,
    icon: 'play_arrow',
    color: 'positive'
  },
  {
    id: 2,
    title: 'Transferência de Fila',
    timestamp: props.data.transferTime,
    icon: 'swap_horiz',
    color: 'warning',
    content: `Transferido para ${props.data.queue}`
  },
  {
    id: 3,
    title: 'Fim do Atendimento',
    timestamp: props.data.endTime,
    icon: 'check_circle',
    color: 'primary'
  }
])

const messages = computed(() => props.data.messages || [])

// Métodos
const formatDateTime = (timestamp) => {
  return date.formatDate(timestamp, 'DD/MM/YYYY HH:mm:ss')
}

const formatTime = (timestamp) => {
  return date.formatDate(timestamp, 'HH:mm')
}

const formatDuration = (minutes) => {
  if (!minutes) return '0min'
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
}

const getStatusColor = (status) => {
  const colors = {
    'Concluído': 'positive',
    'Em Andamento': 'warning',
    'Pendente': 'negative'
  }
  return colors[status] || 'grey'
}

const getMessageStatusIcon = (status) => {
  const icons = {
    'sent': 'check',
    'delivered': 'done_all',
    'read': 'done_all'
  }
  return icons[status] || 'schedule'
}

const getMessageStatusColor = (status) => {
  const colors = {
    'sent': 'grey',
    'delivered': 'blue',
    'read': 'light-blue'
  }
  return colors[status] || 'grey'
}
</script>

<style lang="scss" scoped>
.report-details {
  .metric-card {
    height: 100%;
  }

  .messages-container {
    max-height: 400px;
    overflow-y: auto;
    padding: 16px;

    .message {
      display: flex;
      margin-bottom: 16px;

      &--inbound {
        justify-content: flex-start;

        .message-content {
          background: rgba(0, 0, 0, 0.03);
          border-radius: 12px 12px 12px 0;
        }
      }

      &--outbound {
        justify-content: flex-end;

        .message-content {
          background: var(--q-primary);
          color: white;
          border-radius: 12px 12px 0 12px;

          .message-meta {
            color: rgba(255, 255, 255, 0.7);
          }
        }
      }

      .message-content {
        max-width: 70%;
        padding: 8px 12px;

        .message-text {
          margin-bottom: 4px;
        }

        .message-meta {
          font-size: 12px;
          opacity: 0.7;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }
  }

  .fixed-bottom-right {
    position: fixed;
    bottom: 16px;
    right: 16px;
    z-index: 1000;
  }
}

.dark {
  .message {
    &--inbound {
      .message-content {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}
</style>
