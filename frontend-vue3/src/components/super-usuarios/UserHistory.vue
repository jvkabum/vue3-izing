<template>
  <div class="user-history">
    <!-- Filtros -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="dateRange"
          label="Período"
          outlined
          dense
          readonly
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  v-model="dateRange"
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
      <div class="col-12 col-md-4">
        <q-select
          v-model="selectedAction"
          :options="actionOptions"
          label="Ação"
          outlined
          dense
          clearable
          emit-value
          map-options
        />
      </div>
      <div class="col-12 col-md-4">
        <q-select
          v-model="selectedModule"
          :options="moduleOptions"
          label="Módulo"
          outlined
          dense
          clearable
          emit-value
          map-options
        />
      </div>
    </div>

    <!-- Timeline -->
    <q-timeline color="primary">
      <q-timeline-entry
        v-for="event in filteredEvents"
        :key="event.id"
        :title="event.title"
        :subtitle="formatDateTime(event.timestamp)"
        :icon="getEventIcon(event.action)"
        :color="getEventColor(event.action)"
      >
        <!-- Detalhes do Evento -->
        <div class="event-details">
          <div class="text-body1">{{ event.description }}</div>
          
          <!-- Módulo -->
          <div class="q-mt-sm">
            <q-chip
              :color="getModuleColor(event.module)"
              text-color="white"
              size="sm"
            >
              {{ getModuleLabel(event.module) }}
            </q-chip>
          </div>

          <!-- Metadados -->
          <q-expansion-item
            v-if="event.metadata"
            dense-toggle
            label="Detalhes"
            header-class="text-primary"
          >
            <q-card>
              <q-card-section>
                <pre class="metadata-content">{{ formatMetadata(event.metadata) }}</pre>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- IP e Dispositivo -->
          <div class="text-caption text-grey q-mt-sm">
            <q-icon name="computer" size="xs" />
            <span class="q-ml-xs">{{ event.device }}</span>
            <q-separator vertical inset class="q-mx-sm" />
            <q-icon name="public" size="xs" />
            <span class="q-ml-xs">{{ event.ip }}</span>
          </div>
        </div>
      </q-timeline-entry>

      <!-- Loading State -->
      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner color="primary" size="2em" />
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredEvents.length === 0" class="text-center q-pa-md text-grey">
        Nenhum evento encontrado
      </div>

      <!-- Load More -->
      <div v-if="hasMoreEvents" class="text-center q-mt-md">
        <q-btn
          flat
          color="primary"
          label="Carregar Mais"
          :loading="loadingMore"
          @click="loadMoreEvents"
        />
      </div>
    </q-timeline>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { date } from 'quasar'
import { useUserHistory } from '../../composables/usuarios/useUserHistory'

const props = defineProps({
  userId: {
    type: [Number, String],
    required: true
  }
})

// Composables
const {
  events,
  loading,
  loadingMore,
  hasMoreEvents,
  loadEvents,
  loadMoreEvents: loadMore
} = useUserHistory()

// Estado
const dateRange = ref({
  from: date.formatDate(date.subtractFromDate(new Date(), { days: 30 }), 'YYYY/MM/DD'),
  to: date.formatDate(new Date(), 'YYYY/MM/DD')
})
const selectedAction = ref(null)
const selectedModule = ref(null)

// Opções
const actionOptions = [
  { label: 'Login', value: 'login' },
  { label: 'Logout', value: 'logout' },
  { label: 'Criar', value: 'create' },
  { label: 'Atualizar', value: 'update' },
  { label: 'Excluir', value: 'delete' },
  { label: 'Exportar', value: 'export' }
]

const moduleOptions = [
  { label: 'Usuários', value: 'users' },
  { label: 'Empresas', value: 'companies' },
  { label: 'Filas', value: 'queues' },
  { label: 'Relatórios', value: 'reports' },
  { label: 'Configurações', value: 'settings' }
]

// Computed
const filteredEvents = computed(() => {
  let filtered = [...events.value]

  if (selectedAction.value) {
    filtered = filtered.filter(event => event.action === selectedAction.value)
  }

  if (selectedModule.value) {
    filtered = filtered.filter(event => event.module === selectedModule.value)
  }

  return filtered
})

// Watch
watch([dateRange, selectedAction, selectedModule], () => {
  loadEvents({
    userId: props.userId,
    dateRange: dateRange.value,
    action: selectedAction.value,
    module: selectedModule.value
  })
}, { deep: true })

// Métodos
const formatDateTime = (timestamp) => {
  return date.formatDate(timestamp, 'DD/MM/YYYY HH:mm:ss')
}

const getEventIcon = (action) => {
  const icons = {
    login: 'login',
    logout: 'logout',
    create: 'add_circle',
    update: 'edit',
    delete: 'delete',
    export: 'download'
  }
  return icons[action] || 'event'
}

const getEventColor = (action) => {
  const colors = {
    login: 'positive',
    logout: 'grey',
    create: 'primary',
    update: 'warning',
    delete: 'negative',
    export: 'info'
  }
  return colors[action] || 'grey'
}

const getModuleColor = (module) => {
  const colors = {
    users: 'purple',
    companies: 'deep-purple',
    queues: 'indigo',
    reports: 'blue',
    settings: 'teal'
  }
  return colors[module] || 'grey'
}

const getModuleLabel = (module) => {
  const labels = {
    users: 'Usuários',
    companies: 'Empresas',
    queues: 'Filas',
    reports: 'Relatórios',
    settings: 'Configurações'
  }
  return labels[module] || module
}

const formatMetadata = (metadata) => {
  return JSON.stringify(metadata, null, 2)
}

const loadMoreEvents = async () => {
  await loadMore({
    userId: props.userId,
    dateRange: dateRange.value,
    action: selectedAction.value,
    module: selectedModule.value
  })
}

// Lifecycle
onMounted(() => {
  loadEvents({
    userId: props.userId,
    dateRange: dateRange.value,
    action: selectedAction.value,
    module: selectedModule.value
  })
})
</script>

<style lang="scss" scoped>
.user-history {
  .event-details {
    .metadata-content {
      background: rgba(0, 0, 0, 0.03);
      padding: 8px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      overflow-x: auto;
    }
  }
}

.dark {
  .event-details {
    .metadata-content {
      background: rgba(255, 255, 255, 0.05);
    }
  }
}
</style>
