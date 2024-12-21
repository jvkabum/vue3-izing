<template>
  <div class="statistics-container">
    <q-card>
      <q-card-section>
        <div class="text-h6">Estatísticas</div>
        <q-separator />
        <div class="q-gutter-md">
          <div class="row">
            <div class="col">
              <q-card>
                <q-card-section>
                  <div class="text-h6">Total de Tickets</div>
                  <div class="text-h5">{{ stats.tickets.total }}</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col">
              <q-card>
                <q-card-section>
                  <div class="text-h6">Tickets Abertos</div>
                  <div class="text-h5">{{ stats.tickets.open }}</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col">
              <q-card>
                <q-card-section>
                  <div class="text-h6">Tickets Pendentes</div>
                  <div class="text-h5">{{ stats.tickets.pending }}</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col">
              <q-card>
                <q-card-section>
                  <div class="text-h6">Tickets Fechados</div>
                  <div class="text-h5">{{ stats.tickets.closed }}</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6">Métricas de Mensagens</div>
        <q-separator />
        <div class="row">
          <div class="col">
            <q-card>
              <q-card-section>
                <div class="text-h6">Total de Mensagens</div>
                <div class="text-h5">{{ stats.messages.total }}</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col">
            <q-card>
              <q-card-section>
                <div class="text-h6">Mensagens Enviadas</div>
                <div class="text-h5">{{ stats.messages.sent }}</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col">
            <q-card>
              <q-card-section>
                <div class="text-h6">Mensagens Recebidas</div>
                <div class="text-h5">{{ stats.messages.received }}</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col">
            <q-card>
              <q-card-section>
                <div class="text-h6">Mensagens Automatizadas</div>
                <div class="text-h5">{{ stats.messages.automated }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6">Métricas de Usuários</div>
        <q-separator />
        <div class="row">
          <div class="col">
            <q-card>
              <q-card-section>
                <div class="text-h6">Total de Usuários</div>
                <div class="text-h5">{{ stats.users.total }}</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col">
            <q-card>
              <q-card-section>
                <div class="text-h6">Usuários Ativos</div>
                <div class="text-h5">{{ stats.users.active }}</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col">
            <q-card>
              <q-card-section>
                <div class="text-h6">Usuários Online</div>
                <div class="text-h5">{{ stats.users.online }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStatistics } from '../composables/useStatistics'

const { loadStatistics, loading, error, metrics } = useStatistics()

// Estado
const stats = ref({
  tickets: {},
  messages: {},
  users: {}
})

// Métodos
const fetchStatistics = async () => {
  try {
    await loadStatistics()
    stats.value = metrics.value
  } catch (err) {
    console.error('Erro ao carregar estatísticas:', err)
  }
}

// Lifecycle
onMounted(() => {
  fetchStatistics()
})
</script>

<style lang="scss" scoped>
.statistics-container {
  padding: 16px;

  .q-card {
    margin-bottom: 16px;
  }
}
</style>
