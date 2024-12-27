 <template>
  <div class="row q-pa-sm attendance-filters">
    <div class="q-ma-sm">
      <!-- Título do componente -->
      <div class="text-h6 q-mb-md">Filtros Avançados</div>

      <!-- Toggle de Admin - Visível apenas para administradores -->
      <q-toggle
        v-if="isAdmin"
        class="q-ml-lg admin-toggle"
        v-model="filterParams.showAll"
        label="(Admin) - Visualizar Todos"
        :class="{ 'q-mb-lg': filterParams.showAll }"
        @update:model-value="handleFilterChange"
      >
        <q-tooltip>
          Permite visualizar todos os tickets, independente das filas
        </q-tooltip>
      </q-toggle>

      <template v-if="!filterParams.showAll">
        <q-separator class="q-mb-md" />

        <!-- Seleção múltipla de filas com suporte a busca -->
        <q-select
          v-model="filterParams.queuesIds"
          :disable="filterParams.showAll"
          rounded
          dense
          outlined
          hide-bottom-space
          emit-value
          map-options
          multiple
          options-dense
          use-chips
          label="Filas"
          color="primary"
          :options="userQueues"
          :input-debounce="700"
          option-value="id"
          option-label="queue"
          @update:model-value="handleFilterChange"
          class="queue-select"
        >
          <!-- Slot para quando não houver opções -->
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                Nenhuma fila disponível
              </q-item-section>
            </q-item>
          </template>

          <!-- Slot para chips personalizados -->
          <template v-slot:selected-item="scope">
            <q-chip
              removable
              dense
              @remove="scope.removeAtIndex(scope.index)"
              :tabindex="scope.tabindex"
              color="primary"
              text-color="white"
            >
              {{ scope.opt.queue }}
            </q-chip>
          </template>
        </q-select>

        <!-- Lista de status com checkboxes -->
        <q-list dense class="q-my-md status-list">
          <!-- Status: Abertos -->
          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-checkbox
                v-model="filterParams.status"
                val="open"
                color="primary"
                keep-color
                @update:model-value="handleFilterChange"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>Abertos</q-item-label>
              <q-item-label caption>Tickets em atendimento</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Status: Pendentes -->
          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-checkbox
                v-model="filterParams.status"
                val="pending"
                color="negative"
                keep-color
                @update:model-value="handleFilterChange"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>Pendentes</q-item-label>
              <q-item-label caption>Tickets aguardando atendimento</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Status: Resolvidos -->
          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-checkbox
                v-model="filterParams.status"
                val="closed"
                color="positive"
                keep-color
                @update:model-value="handleFilterChange"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>Resolvidos</q-item-label>
              <q-item-label caption>Tickets finalizados</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-separator class="q-mb-md" />

        <!-- Filtros adicionais com tooltips -->
        <div class="additional-filters">
          <q-toggle
            v-model="filterParams.withUnreadMessages"
            label="Somente Tickets com mensagens não lidas"
            @update:model-value="handleFilterChange"
          >
            <q-tooltip>
              Exibe apenas tickets que possuem mensagens não lidas
            </q-tooltip>
          </q-toggle>

          <q-toggle
            v-model="filterParams.isNotAssignedUser"
            label="Somente Tickets não atribuídos"
            @update:model-value="handleFilterChange"
          >
            <q-tooltip>
              Exibe apenas tickets que não foram atribuídos a nenhum atendente
            </q-tooltip>
          </q-toggle>
        </div>

        <q-separator class="q-my-md" spaced />
      </template>

      <!-- Botões de ação -->
      <div class="row justify-between q-mt-md">
        <q-btn
          color="primary"
          label="Resetar"
          push
          rounded
          @click="resetFilters"
          icon="refresh"
        >
          <q-tooltip>
            Restaura os filtros para configuração padrão
          </q-tooltip>
        </q-btn>
        <q-btn
          color="negative"
          label="Fechar"
          push
          rounded
          v-close-popup
          icon="close"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAtendimentoFilters } from '../../composables/atendimento/useAtendimentoFilters'

/**
 * Define os eventos que o componente pode emitir
 */
const emit = defineEmits(['filter'])

/**
 * Composable que gerencia a lógica dos filtros
 */
const { 
  filterParams, 
  userQueues, 
  resetFilters: resetFilterParams 
} = useAtendimentoFilters()

/**
 * Computed que verifica se o usuário é administrador
 */
const isAdmin = computed(() => 
  localStorage.getItem('profile') === 'admin'
)

/**
 * Manipula mudanças nos filtros e emite evento
 */
const handleFilterChange = () => {
  emit('filter')
}

/**
 * Reseta os filtros para valores padrão
 */
const resetFilters = () => {
  resetFilterParams()
  handleFilterChange()
}
</script>

<style lang="scss" scoped>
.attendance-filters {
  min-width: 350px;
  max-width: 350px;

  // Estilização do select de filas
  .queue-select {
    width: 300px;
    max-width: 300px;

    :deep(.q-field__control) {
      padding: 0 8px;
    }

    :deep(.q-chip) {
      margin: 2px;
    }
  }

  // Estilização da lista de status
  .status-list {
    .q-item {
      min-height: 40px;
      border-radius: 4px;
      transition: background-color 0.3s;

      &:hover {
        background-color: rgba(0,0,0,0.03);
      }
    }
  }

  // Estilização dos filtros adicionais
  .additional-filters {
    .q-toggle {
      margin: 12px 0;
      
      :deep(.q-toggle__inner) {
        min-width: 45px;
      }

      :deep(.q-toggle__label) {
        font-size: 0.9em;
        color: $grey-8;
      }
    }
  }

  // Estilização do toggle de admin
  .admin-toggle {
    :deep(.q-toggle__inner) {
      min-width: 45px;
    }

    :deep(.q-toggle__label) {
      color: $primary;
      font-weight: 500;
    }
  }
}
</style>
