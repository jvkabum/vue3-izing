<template>
  <div class="statistics-container">
    <!-- Header com Filtros -->
    <q-card class="filter-card q-mb-md">
      <q-card-section>
        <div class="row items-center justify-between q-col-gutter-md">
          <div class="col-12 col-sm-auto">
            <div class="text-h6">Estatísticas</div>
          </div>
          <div class="col-12 col-sm-auto">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-auto">
                <q-input
                  v-model="dateRange.from"
                  type="date"
                  label="De"
                  outlined
                  dense
                  @update:model-value="handleDateChange"
                />
              </div>
              <div class="col-12 col-sm-auto">
                <q-input
                  v-model="dateRange.to"
                  type="date"
                  label="Até"
                  outlined
                  dense
                  @update:model-value="handleDateChange"
                />
              </div>
              <div class="col-12 col-sm-auto">
                <q-btn
                  icon="refresh"
                  color="primary"
                  :loading="loading"
                  @click="refreshStatistics"
                >
                  <q-tooltip>Atualizar dados</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
    </div>

    <!-- Error State -->
    <q-banner v-else-if="error" class="bg-negative text-white q-mb-md">
      {{ error }}
      <template v-slot:action>
        <q-btn flat color="white" label="Tentar novamente" @click="refreshStatistics" />
      </template>
    </q-banner>

    <!-- Content -->
    <template v-else>
      <!-- Tickets Statistics -->
      <q-card class="stats-card">
        <q-card-section>
          <div class="text-subtitle1 q-mb-md">Métricas de Tickets</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6 col-md-3">
              <stat-card
                title="Total de Tickets"
                :value="ticketMetrics.totalTickets"
                icon="confirmation_number"
                color="primary"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <stat-card
                title="Taxa de Abertura"
                :value="`${ticketMetrics.openRate}%`"
                icon="inbox"
                color="orange"
                :trend="ticketMetrics.openRate > 50 ? 'up' : 'down'"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <stat-card
                title="Taxa de Resolução"
                :value="`${ticketMetrics.resolutionRate}%`"
                icon="check_circle"
                color="positive"
                :trend="ticketMetrics.resolutionRate > 80 ? 'up' : 'down'"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <stat-card
                title="Tempo Médio de Resposta"
                :value="ticketMetrics.avgResponseTime"
                icon="timer"
                color="info"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Messages Statistics -->
      <q-card class="stats-card q-mt-md">
        <q-card-section>
          <div class="text-subtitle1 q-mb-md">Métricas de Mensagens</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6 col-md-3">
              <stat-card
                title="Total de Mensagens"
                :value="messageMetrics.totalMessages"
                icon="message"
                color="primary"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <stat-card
                title="Taxa de Automação"
                :value="`${messageMetrics.automationRate}%`"
                icon="smart_toy"
                color="purple"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <stat-card
                title="Média por Ticket"
                :value="messageMetrics.avgMessagesPerTicket"
                icon="analytics"
                color="teal"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <stat-card
                title="Taxa de Resposta"
                :value="`${messageMetrics.responseRate}%`"
                icon="reply"
                color="deep-orange"
                :trend="messageMetrics.responseRate > 90 ? 'up' : 'down'"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Users Statistics -->
      <q-card class="stats-card q-mt-md">
        <q-card-section>
          <div class="text-subtitle1 q-mb-md">Métricas de Usuários</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6 col-md-4">
              <stat-card
                title="Total de Usuários"
                :value="userMetrics.totalUsers"
                icon="people"
                color="primary"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <stat-card
                title="Taxa de Atividade"
                :value="`${userMetrics.activeRate}%`"
                icon="person"
                color="green"
                :trend="userMetrics.activeRate > 70 ? 'up' : 'down'"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <stat-card
                title="Taxa Online"
                :value="`${userMetrics.onlineRate}%`"
                icon="online_prediction"
                color="light-blue"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useStatisticsData } from '../composables/useStatisticsData'
import StatCard from './statistics/StatCard.vue'

const {
  stats,
  loading,
  error,
  dateRange,
  ticketMetrics,
  messageMetrics,
  userMetrics,
  fetchStatistics,
  updateDateRange,
  refreshStatistics
} = useStatisticsData()

const handleDateChange = async () => {
  await updateDateRange(dateRange.value)
}

onMounted(() => {
  fetchStatistics()
})
</script>

<style lang="scss" scoped>
.statistics-container {
  .stats-card {
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  }

  .filter-card {
    background: linear-gradient(45deg, var(--q-primary) 0%, var(--q-secondary) 100%);
    color: white;
  }
}

// Dark mode support
.body--dark {
  .statistics-container {
    .stats-card:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    .filter-card {
      background: linear-gradient(45deg, 
        rgba(var(--q-primary), 0.8) 0%, 
        rgba(var(--q-secondary), 0.8) 100%
      );
    }
  }
}

// Responsive
@media (max-width: 599px) {
  .statistics-container {
    .stats-card {
      margin-bottom: 16px;

      &:hover {
        transform: none;
      }
    }
  }
}
</style>
