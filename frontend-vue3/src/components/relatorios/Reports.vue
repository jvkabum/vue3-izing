<template>
  <div class="reports">
    <!-- Cabeçalho -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Relatórios</div>
      <div class="row q-gutter-sm">
        <q-btn
          color="primary"
          icon="add"
          label="Novo Relatório"
          @click="openReportDialog()"
        />
        <q-btn-dropdown color="secondary" label="Exportar">
          <q-list>
            <q-item clickable v-close-popup @click="exportReport('pdf')">
              <q-item-section avatar>
                <q-icon name="picture_as_pdf" />
              </q-item-section>
              <q-item-section>PDF</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="exportReport('excel')">
              <q-item-section avatar>
                <q-icon name="table_view" />
              </q-item-section>
              <q-item-section>Excel</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <!-- Filtros -->
    <div class="row q-col-gutter-md q-mb-md">
      <!-- Período -->
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

      <!-- Tipo de Relatório -->
      <div class="col-12 col-md-4">
        <q-select
          v-model="selectedReportType"
          :options="reportTypeOptions"
          label="Tipo de Relatório"
          outlined
          dense
          emit-value
          map-options
        />
      </div>

      <!-- Filtros Adicionais -->
      <div class="col-12 col-md-4">
        <q-btn-dropdown
          outline
          color="primary"
          label="Filtros Adicionais"
          class="full-width"
        >
          <q-list style="min-width: 300px">
            <!-- Atendentes -->
            <q-item>
              <q-item-section>
                <q-select
                  v-model="filters.agents"
                  :options="agentOptions"
                  label="Atendentes"
                  multiple
                  use-chips
                  outlined
                  dense
                  options-dense
                  class="full-width"
                />
              </q-item-section>
            </q-item>

            <!-- Filas -->
            <q-item>
              <q-item-section>
                <q-select
                  v-model="filters.queues"
                  :options="queueOptions"
                  label="Filas"
                  multiple
                  use-chips
                  outlined
                  dense
                  options-dense
                  class="full-width"
                />
              </q-item-section>
            </q-item>

            <!-- Tags -->
            <q-item>
              <q-item-section>
                <q-select
                  v-model="filters.tags"
                  :options="tagOptions"
                  label="Tags"
                  multiple
                  use-chips
                  outlined
                  dense
                  options-dense
                  class="full-width"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <!-- Métricas Principais -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="metric in mainMetrics" :key="metric.id" class="col-12 col-md-3">
        <q-card class="metric-card">
          <q-card-section>
            <div class="text-subtitle2 text-grey">{{ metric.label }}</div>
            <div class="text-h4 q-mt-sm">{{ metric.value }}</div>
            <div class="row items-center q-mt-sm">
              <q-icon
                :name="metric.trend > 0 ? 'trending_up' : 'trending_down'"
                :color="metric.trend > 0 ? 'positive' : 'negative'"
                size="sm"
              />
              <span
                class="q-ml-sm"
                :class="metric.trend > 0 ? 'text-positive' : 'text-negative'"
              >
                {{ Math.abs(metric.trend) }}% em relação ao período anterior
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- Gráfico Principal -->
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="text-subtitle1">{{ selectedReportType.label }}</div>
            <apexchart
              type="line"
              height="350"
              :options="chartOptions"
              :series="chartSeries"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Gráficos Secundários -->
      <div class="col-12 col-md-4">
        <q-card class="full-height">
          <q-card-section>
            <div class="text-subtitle1">Distribuição</div>
            <apexchart
              type="donut"
              height="350"
              :options="pieChartOptions"
              :series="pieChartSeries"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabela Detalhada -->
    <q-card>
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">Detalhamento</div>
        <q-table
          :rows="detailedData"
          :columns="tableColumns"
          row-key="id"
          :pagination.sync="pagination"
          :loading="loading"
        >
          <!-- Slots personalizados para colunas específicas -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="getStatusColor(props.value)"
                text-color="white"
                dense
              >
                {{ props.value }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="visibility"
                @click="viewDetails(props.row)"
              >
                <q-tooltip>Ver detalhes</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialogs -->
    <report-dialog
      v-model="showReportDialog"
      :report="selectedReport"
      @save="saveReport"
    />

    <!-- Dialog de Detalhes -->
    <q-dialog v-model="showDetailsDialog" maximized>
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">Detalhes do Atendimento</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <report-details :data="selectedDetails" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { date } from 'quasar'
import { useReports } from '../../composables/relatorios/useReports'
import { useNotificationSystem } from '../../composables/sistema/useNotificationSystem'
import ReportDialog from './ReportDialog.vue'
import ReportDetails from './ReportDetails.vue'

// Composables
const {
  reports,
  metrics,
  loading,
  error,
  saveReport: saveReportData,
  exportReport: exportReportData,
  loadReports
} = useReports()
const { notifySuccess, notifyError } = useNotificationSystem()

// Estado
const dateRange = ref({
  from: date.formatDate(date.subtractFromDate(new Date(), { days: 30 }), 'YYYY/MM/DD'),
  to: date.formatDate(new Date(), 'YYYY/MM/DD')
})
const selectedReportType = ref(null)
const filters = ref({
  agents: [],
  queues: [],
  tags: []
})
const showReportDialog = ref(false)
const showDetailsDialog = ref(false)
const selectedReport = ref(null)
const selectedDetails = ref(null)
const pagination = ref({
  sortBy: 'date',
  descending: true,
  page: 1,
  rowsPerPage: 10
})

// Opções
const reportTypeOptions = [
  { label: 'Atendimentos', value: 'tickets' },
  { label: 'Tempo Médio', value: 'avgTime' },
  { label: 'Satisfação', value: 'satisfaction' },
  { label: 'Volume por Canal', value: 'channels' }
]

const agentOptions = [
  { label: 'João Silva', value: 1 },
  { label: 'Maria Santos', value: 2 },
  { label: 'Pedro Souza', value: 3 }
]

const queueOptions = [
  { label: 'Suporte', value: 1 },
  { label: 'Vendas', value: 2 },
  { label: 'Financeiro', value: 3 }
]

const tagOptions = [
  { label: 'Urgente', value: 'urgent' },
  { label: 'VIP', value: 'vip' },
  { label: 'Bug', value: 'bug' }
]

// Dados
const mainMetrics = computed(() => [
  {
    id: 1,
    label: 'Total de Atendimentos',
    value: '1,234',
    trend: 12
  },
  {
    id: 2,
    label: 'Tempo Médio de Resposta',
    value: '5min',
    trend: -8
  },
  {
    id: 3,
    label: 'Taxa de Resolução',
    value: '94%',
    trend: 3
  },
  {
    id: 4,
    label: 'Satisfação do Cliente',
    value: '4.8',
    trend: 5
  }
])

const chartOptions = {
  chart: {
    type: 'line',
    toolbar: {
      show: true
    }
  },
  stroke: {
    curve: 'smooth'
  },
  xaxis: {
    type: 'datetime'
  },
  yaxis: {
    title: {
      text: 'Quantidade'
    }
  }
}

const chartSeries = [
  {
    name: 'Atendimentos',
    data: [
      [1651363200000, 30],
      [1651449600000, 45],
      [1651536000000, 38],
      [1651622400000, 42]
    ]
  }
]

const pieChartOptions = {
  labels: ['WhatsApp', 'Facebook', 'Instagram', 'Outros'],
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        width: 200
      },
      legend: {
        position: 'bottom'
      }
    }
  }]
}

const pieChartSeries = [44, 55, 13, 43]

const tableColumns = [
  {
    name: 'date',
    required: true,
    label: 'Data',
    align: 'left',
    field: row => row.date,
    format: val => date.formatDate(val, 'DD/MM/YYYY HH:mm'),
    sortable: true
  },
  {
    name: 'protocol',
    label: 'Protocolo',
    field: 'protocol',
    sortable: true
  },
  {
    name: 'customer',
    label: 'Cliente',
    field: 'customer',
    sortable: true
  },
  {
    name: 'agent',
    label: 'Atendente',
    field: 'agent',
    sortable: true
  },
  {
    name: 'queue',
    label: 'Fila',
    field: 'queue',
    sortable: true
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    sortable: true
  },
  {
    name: 'duration',
    label: 'Duração',
    field: 'duration',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Ações',
    field: 'actions',
    align: 'right'
  }
]

const detailedData = ref([
  {
    id: 1,
    date: new Date(),
    protocol: 'ATD-001234',
    customer: 'João Silva',
    agent: 'Maria Santos',
    queue: 'Suporte',
    status: 'Concluído',
    duration: '15min'
  }
  // ... mais dados
])

// Métodos
const saveReport = async (reportData) => {
  try {
    await saveReportData(reportData)
    showReportDialog.value = false
    notifySuccess('Relatório salvo com sucesso')
  } catch (err) {
    notifyError('Erro ao salvar relatório')
  }
}

const exportReport = async (format) => {
  try {
    await exportReportData({
      format,
      dateRange: dateRange.value,
      reportType: selectedReportType.value,
      filters: filters.value
    })
    notifySuccess(`Relatório exportado em ${format.toUpperCase()}`)
  } catch (err) {
    notifyError('Erro ao exportar relatório')
  }
}

const viewDetails = (row) => {
  selectedDetails.value = row
  showDetailsDialog.value = true
}

const getStatusColor = (status) => {
  const colors = {
    'Concluído': 'positive',
    'Em Andamento': 'warning',
    'Pendente': 'negative'
  }
  return colors[status] || 'grey'
}

// Lifecycle
onMounted(async () => {
  try {
    await loadReports()
  } catch (err) {
    notifyError('Erro ao carregar relatórios')
  }
})
</script>

<style lang="scss" scoped>
.reports {
  padding: 20px;

  .metric-card {
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-2px);
    }
  }
}

.dark {
  .metric-card {
    background: $dark;
  }
}
</style>
