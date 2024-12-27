<template>
  <div class="dashboard q-pa-sm">
    <!-- Cabeçalho -->
    <q-card class="q-my-md">
      <q-card-section class="row justify-between items-center">
        <!-- Título -->
        <div class="col-xs-12 col-md-3 text-h4 text-bold text-center text-md-left">
          Painel de Controle
        </div>

        <!-- Filtros -->
        <div class="col-xs-12 col-md-9 row justify-end q-gutter-sm">
          <!-- Data Inicial -->
          <q-datetime-picker
            v-model="params.startDate"
            class="date-picker"
            dense
            outlined
            label="Data Inicial"
            mode="date"
            color="primary"
            format24h
          />

          <!-- Data Final -->
          <q-datetime-picker
            v-model="params.endDate"
            class="date-picker"
            dense
            outlined
            label="Data Final"
            mode="date"
            color="primary"
            format24h
          />

          <!-- Botão Atualizar -->
          <q-btn
            color="primary"
            icon="refresh"
            label="Atualizar"
            @click="getDashData"
          >
            <q-tooltip>Atualizar dados</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>

    <!-- Cards de Métricas -->
    <q-card class="q-my-md q-pa-sm">
      <q-card-section>
        <div class="row q-col-gutter-md justify-center">
          <!-- Total Atendimentos -->
          <div class="col-xs-12 col-sm-6 col-md-4 col-lg-2">
            <metric-card
              title="Total Atendimentos"
              :value="ticketsAndTimes.qtd_total_atendimentos"
              icon="verified"
              color="positive"
            />
          </div>

          <!-- Demanda Ativa -->
          <div class="col-xs-12 col-sm-6 col-md-4 col-lg-2">
            <metric-card
              title="Demanda Ativa"
              :value="ticketsAndTimes.qtd_demanda_ativa"
              icon="mdi-comment-processing-outline"
              color="warning"
            />
          </div>

          <!-- Demanda Receptiva -->
          <div class="col-xs-12 col-sm-6 col-md-4 col-lg-2">
            <metric-card
              title="Demanda Receptiva"
              :value="ticketsAndTimes.qtd_demanda_receptiva"
              icon="mdi-arrow-left-bold"
              color="info"
            />
          </div>

          <!-- Novos Contatos -->
          <div class="col-xs-12 col-sm-6 col-md-4 col-lg-2">
            <metric-card
              title="Novos Contatos"
              :value="ticketsAndTimes.new_contacts"
              icon="mdi-contacts-outline"
              color="info"
            />
          </div>

          <!-- TMA -->
          <div class="col-xs-12 col-sm-6 col-md-4 col-lg-2">
            <metric-card
              title="Tempo Médio de Atendimento"
              :value="tmaFormatted"
              icon="mdi-clock-outline"
              color="orange"
              subtitle="TMA"
            />
          </div>

          <!-- TME -->
          <div class="col-xs-12 col-sm-6 col-md-4 col-lg-2">
            <metric-card
              title="Tempo Médio 1ª Resposta"
              :value="tmeFormatted"
              icon="mdi-timer-sand"
              color="pink"
              subtitle="TME"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Gráficos -->
    <div class="row q-col-gutter-md">
      <!-- Atendimentos por Canal -->
      <div class="col-xs-12 col-sm-6">
        <q-card>
          <q-card-section>
            <apex-chart
              ref="chartTicketsChannels"
              type="pie"
              height="300"
              :options="chartOptions.channels"
              :series="chartData.channels.series"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Atendimentos por Fila -->
      <div class="col-xs-12 col-sm-6">
        <q-card>
          <q-card-section>
            <apex-chart
              ref="chartTicketsQueue"
              type="pie"
              height="300"
              :options="chartOptions.queues"
              :series="chartData.queues.series"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Evolução por Canal -->
    <q-card class="q-my-md">
      <q-card-section>
        <apex-chart
          ref="chartEvolutionChannels"
          type="bar"
          height="300"
          :options="chartOptions.evolution"
          :series="chartData.evolution.series"
        />
      </q-card-section>
    </q-card>

    <!-- Evolução por Período -->
    <q-card class="q-my-md">
      <q-card-section>
        <apex-chart
          ref="chartEvolutionPeriod"
          type="line"
          height="300"
          :options="chartOptions.period"
          :series="chartData.period.series"
        />
      </q-card-section>
    </q-card>

    <!-- Tabela de Performance -->
    <q-card class="q-my-md">
      <q-card-section>
        <q-table
          title="Performance por Usuário"
          :data="ticketsPerUsersDetail"
          :columns="userColumns"
          :pagination="paginationTableUser"
          row-key="email"
          flat
          bordered
        >
          <!-- Coluna Nome -->
          <template #body-cell-name="props">
            <q-td :props="props">
              <div class="text-bold">{{ props.row.name || 'Não informado' }}</div>
              <div class="text-caption">{{ props.row.email }}</div>
            </q-td>
          </template>

          <!-- Colunas de Tempo -->
          <template #body-cell-tma="props">
            <q-td :props="props">
              {{ formatDuration(props.value) }}
            </q-td>
          </template>

          <template #body-cell-tme="props">
            <q-td :props="props">
              {{ formatDuration(props.value) }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { formatDuration } from 'date-fns'
import ApexChart from 'vue-apexcharts'
import { useDashboard } from '../../composables/dashboard/useDashboard'
import MetricCard from './components/MetricCard.vue'

const $q = useQuasar()

// Composables
const {
  params,
  filas,
  configWidth,
  ticketsAndTimes,
  ticketsPerUsersDetail,
  paginationTableUser,
  tmaFormatted,
  tmeFormatted,
  chartConfig,
  setConfigWidth,
  listarFilas,
  getDashData
} = useDashboard()

// Colunas da tabela de usuários
const userColumns = [
  {
    name: 'name',
    label: 'Usuário',
    field: 'name',
    align: 'left',
    style: 'width: 300px'
  },
  {
    name: 'qtd_pendentes',
    label: 'Pendentes',
    field: 'qtd_pendentes',
    align: 'center'
  },
  {
    name: 'qtd_em_atendimento',
    label: 'Em Atendimento',
    field: 'qtd_em_atendimento',
    align: 'center'
  },
  {
    name: 'qtd_resolvidos',
    label: 'Resolvidos',
    field: 'qtd_resolvidos',
    align: 'center'
  },
  {
    name: 'qtd_por_usuario',
    label: 'Total',
    field: 'qtd_por_usuario',
    align: 'center'
  },
  {
    name: 'tme',
    label: 'TME',
    field: 'tme',
    align: 'center'
  },
  {
    name: 'tma',
    label: 'TMA',
    field: 'tma',
    align: 'center'
  }
]

// Configurações dos gráficos
const chartOptions = ref({
  channels: {
    ...chartConfig,
    title: { text: 'Atendimentos por Canal' }
  },
  queues: {
    ...chartConfig,
    title: { text: 'Atendimentos por Fila' }
  },
  evolution: {
    ...chartConfig,
    title: { text: 'Evolução por Canal' }
  },
  period: {
    ...chartConfig,
    title: { text: 'Evolução por Período' }
  }
})

// Dados dos gráficos
const chartData = ref({
  channels: { series: [] },
  queues: { series: [] },
  evolution: { series: [] },
  period: { series: [] }
})

// Watchers
watch(() => $q.dark.isActive, () => {
  // Atualiza tema dos gráficos
  const theme = {
    mode: $q.dark.isActive ? 'dark' : 'light',
    palette: 'palette1'
  }
  Object.keys(chartOptions.value).forEach(key => {
    chartOptions.value[key].theme = theme
  })
})

watch(() => $q.screen.width, () => {
  setConfigWidth()
})

// Lifecycle
onMounted(() => {
  listarFilas()
  getDashData()
})
</script>

<style lang="scss" scoped>
.dashboard {
  // Datepickers
  .date-picker {
    width: 200px;
    
    :deep(.q-field__control) {
      padding: 0 8px;
    }
  }

  // Cards
  .q-card {
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  }

  // Gráficos
  :deep(.apexcharts-theme-dark) {
    .apexcharts-svg {
      background: transparent !important;
    }
  }
}

// Tema escuro
:deep(.body--dark) {
  .dashboard {
    .q-card:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
  }
}
</style>
