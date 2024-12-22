<template>
  <div class="audit-log">
    <!-- Filtros -->
    <div class="row q-col-gutter-md q-mb-md">
      <!-- Período -->
      <div class="col-12 col-md-3">
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

      <!-- Usuário -->
      <div class="col-12 col-md-3">
        <q-select
          v-model="selectedUser"
          :options="userOptions"
          label="Usuário"
          outlined
          dense
          clearable
          emit-value
          map-options
          use-input
          @filter="filterUsers"
        />
      </div>

      <!-- Tipo de Evento -->
      <div class="col-12 col-md-3">
        <q-select
          v-model="selectedEventType"
          :options="eventTypeOptions"
          label="Tipo de Evento"
          outlined
          dense
          clearable
          emit-value
          map-options
        />
      </div>

      <!-- Severidade -->
      <div class="col-12 col-md-3">
        <q-select
          v-model="selectedSeverity"
          :options="severityOptions"
          label="Severidade"
          outlined
          dense
          clearable
          emit-value
          map-options
        />
      </div>
    </div>

    <!-- Tabela de Logs -->
    <q-table
      :rows="filteredLogs"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination.sync="pagination"
      :filter="filter"
      flat
      bordered
    >
      <!-- Slots personalizados -->
      <template v-slot:top-right>
        <q-input
          v-model="filter"
          placeholder="Buscar..."
          dense
          outlined
          class="q-mr-sm"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn-dropdown color="primary" label="Exportar">
          <q-list>
            <q-item clickable v-close-popup @click="exportLogs('csv')">
              <q-item-section avatar>
                <q-icon name="table_view" />
              </q-item-section>
              <q-item-section>CSV</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="exportLogs('json')">
              <q-item-section avatar>
                <q-icon name="code" />
              </q-item-section>
              <q-item-section>JSON</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </template>

      <template v-slot:body-cell-severity="props">
        <q-td :props="props">
          <q-chip
            :color="getSeverityColor(props.value)"
            text-color="white"
            dense
          >
            {{ getSeverityLabel(props.value) }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-details="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            dense
            color="primary"
            icon="visibility"
            @click="showEventDetails(props.row)"
          >
            <q-tooltip>Ver detalhes</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Dialog de Detalhes -->
    <q-dialog v-model="showDetailsDialog">
      <q-card style="min-width: 600px">
        <q-card-section class="row items-center">
          <div class="text-h6">Detalhes do Evento</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedEvent">
          <!-- Informações Básicas -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="text-caption text-grey">Timestamp</div>
              <div>{{ formatDateTime(selectedEvent.timestamp) }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="text-caption text-grey">Usuário</div>
              <div>{{ selectedEvent.user }}</div>
            </div>
            <div class="col-12">
              <div class="text-caption text-grey">Descrição</div>
              <div>{{ selectedEvent.description }}</div>
            </div>
          </div>

          <!-- Metadados -->
          <div class="q-mt-md">
            <div class="text-caption text-grey">Metadados</div>
            <pre class="metadata-content">{{ formatMetadata(selectedEvent.metadata) }}</pre>
          </div>

          <!-- Informações do Sistema -->
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-12 col-md-6">
              <div class="text-caption text-grey">IP</div>
              <div>{{ selectedEvent.ip }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="text-caption text-grey">User Agent</div>
              <div>{{ selectedEvent.userAgent }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { date } from 'quasar'
import { useAudit } from '../../composables/relatorios/useAudit'
import { useNotificationSystem } from '../../composables/sistema/useNotificationSystem'

// Composables
const {
  logs,
  loading,
  exportLogs: exportLogsData,
  loadLogs
} = useAudit()
const { notifySuccess, notifyError } = useNotificationSystem()

// Estado
const dateRange = ref({
  from: date.formatDate(date.subtractFromDate(new Date(), { days: 30 }), 'YYYY/MM/DD'),
  to: date.formatDate(new Date(), 'YYYY/MM/DD')
})
const selectedUser = ref(null)
const selectedEventType = ref(null)
const selectedSeverity = ref(null)
const filter = ref('')
const pagination = ref({
  sortBy: 'timestamp',
  descending: true,
  page: 1,
  rowsPerPage: 20
})
const showDetailsDialog = ref(false)
const selectedEvent = ref(null)

// Opções
const eventTypeOptions = [
  { label: 'Autenticação', value: 'auth' },
  { label: 'Sistema', value: 'system' },
  { label: 'Dados', value: 'data' },
  { label: 'Segurança', value: 'security' }
]

const severityOptions = [
  { label: 'Info', value: 'info' },
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' },
  { label: 'Critical', value: 'critical' }
]

const userOptions = ref([])

// Configuração da tabela
const columns = [
  {
    name: 'timestamp',
    required: true,
    label: 'Data/Hora',
    align: 'left',
    field: row => row.timestamp,
    format: val => formatDateTime(val),
    sortable: true
  },
  {
    name: 'user',
    label: 'Usuário',
    field: 'user',
    sortable: true
  },
  {
    name: 'eventType',
    label: 'Tipo',
    field: 'eventType',
    sortable: true
  },
  {
    name: 'severity',
    label: 'Severidade',
    field: 'severity',
    sortable: true
  },
  {
    name: 'description',
    label: 'Descrição',
    field: 'description',
    sortable: true
  },
  {
    name: 'ip',
    label: 'IP',
    field: 'ip',
    sortable: true
  },
  {
    name: 'details',
    label: 'Detalhes',
    field: 'details',
    align: 'center'
  }
]

// Computed
const filteredLogs = computed(() => {
  let filtered = [...logs.value]

  if (selectedUser.value) {
    filtered = filtered.filter(log => log.userId === selectedUser.value)
  }

  if (selectedEventType.value) {
    filtered = filtered.filter(log => log.eventType === selectedEventType.value)
  }

  if (selectedSeverity.value) {
    filtered = filtered.filter(log => log.severity === selectedSeverity.value)
  }

  return filtered
})

// Watch
watch([dateRange, selectedUser, selectedEventType, selectedSeverity], () => {
  loadLogs({
    dateRange: dateRange.value,
    userId: selectedUser.value,
    eventType: selectedEventType.value,
    severity: selectedSeverity.value
  })
}, { deep: true })

// Métodos
const formatDateTime = (timestamp) => {
  return date.formatDate(timestamp, 'DD/MM/YYYY HH:mm:ss')
}

const formatMetadata = (metadata) => {
  return JSON.stringify(metadata, null, 2)
}

const getSeverityColor = (severity) => {
  const colors = {
    info: 'info',
    warning: 'warning',
    error: 'negative',
    critical: 'deep-orange'
  }
  return colors[severity] || 'grey'
}

const getSeverityLabel = (severity) => {
  const labels = {
    info: 'Info',
    warning: 'Warning',
    error: 'Error',
    critical: 'Critical'
  }
  return labels[severity] || severity
}

const filterUsers = (val, update, abort) => {
  // Implementar busca de usuários
  update(() => {
    userOptions.value = [
      { label: 'João Silva', value: 1 },
      { label: 'Maria Santos', value: 2 }
    ]
  })
}

const showEventDetails = (event) => {
  selectedEvent.value = event
  showDetailsDialog.value = true
}

const exportLogs = async (format) => {
  try {
    await exportLogsData({
      format,
      dateRange: dateRange.value,
      userId: selectedUser.value,
      eventType: selectedEventType.value,
      severity: selectedSeverity.value
    })
    notifySuccess(`Logs exportados em formato ${format.toUpperCase()}`)
  } catch (err) {
    notifyError('Erro ao exportar logs')
  }
}
</script>

<style lang="scss" scoped>
.audit-log {
  .metadata-content {
    background: rgba(0, 0, 0, 0.03);
    padding: 8px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    overflow-x: auto;
    max-height: 300px;
    overflow-y: auto;
  }
}

.dark {
  .metadata-content {
    background: rgba(255, 255, 255, 0.05);
  }
}
</style>
