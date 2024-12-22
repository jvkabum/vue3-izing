<template>
  <div class="tab-container">
    <!-- Tabs de navegação -->
    <q-tabs 
      v-model="selectedTab" 
      class="tab-scroll"
      active-color="primary"
      indicator-color="primary"
      align="left"
      narrow-indicator
    >
      <q-tab
        v-for="tab in availableTabs"
        :key="tab.name"
        :name="tab.name"
        :label="tab.label"
        :ripple="false"
      >
        <!-- Badge com contador -->
        <q-badge
          v-if="tab.count > 0"
          :color="tab.color"
          floating
          transparent
          text-color="white"
          rounded
        >
          {{ tab.count }}
        </q-badge>
      </q-tab>
    </q-tabs>

    <!-- Conteúdo das Tabs -->
    <q-tab-panels 
      v-model="selectedTab" 
      animated
      swipeable
      class="tab-content bg-transparent"
      transition-prev="slide-right"
      transition-next="slide-left"
    >
      <!-- Painel de Tickets Abertos -->
      <q-tab-panel name="open" class="q-pa-none">
        <q-scroll-area style="height: calc(100vh - 200px)">
          <transition-group
            name="list"
            appear
            enter-active-class="animated fadeIn"
            leave-active-class="animated fadeOut"
          >
            <ItemTicket
              v-for="ticket in openTickets"
              :key="ticket.id"
              :ticket="ticket"
              :filas="filas"
              @click="handleTicketClick(ticket)"
            />
          </transition-group>
        </q-scroll-area>
      </q-tab-panel>

      <!-- Painel de Tickets Pendentes -->
      <q-tab-panel name="pending" class="q-pa-none">
        <q-scroll-area style="height: calc(100vh - 200px)">
          <transition-group
            name="list"
            appear
            enter-active-class="animated fadeIn"
            leave-active-class="animated fadeOut"
          >
            <ItemTicket
              v-for="ticket in pendingTickets"
              :key="ticket.id"
              :ticket="ticket"
              :filas="filas"
              @click="handleTicketClick(ticket)"
            />
          </transition-group>
        </q-scroll-area>
      </q-tab-panel>

      <!-- Painel de Tickets Resolvidos -->
      <q-tab-panel name="closed" class="q-pa-none">
        <q-scroll-area style="height: calc(100vh - 200px)">
          <transition-group
            name="list"
            appear
            enter-active-class="animated fadeIn"
            leave-active-class="animated fadeOut"
          >
            <ItemTicket
              v-for="ticket in closedTickets"
              :key="ticket.id"
              :ticket="ticket"
              :filas="filas"
              @click="handleTicketClick(ticket)"
            />
          </transition-group>
        </q-scroll-area>
      </q-tab-panel>

      <!-- Painel de Tickets de Grupo -->
      <q-tab-panel name="group" class="q-pa-none">
        <q-scroll-area style="height: calc(100vh - 200px)">
          <transition-group
            name="list"
            appear
            enter-active-class="animated fadeIn"
            leave-active-class="animated fadeOut"
          >
            <ItemTicket
              v-for="ticket in groupTickets"
              :key="ticket.id"
              :ticket="ticket"
              :filas="filas"
              @click="handleTicketClick(ticket)"
            />
          </transition-group>
        </q-scroll-area>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Loading -->
    <q-inner-loading :showing="loading" color="primary">
      <q-spinner-dots size="40px" />
      <div class="text-subtitle1 q-mt-sm">
        Carregando tickets...
      </div>
    </q-inner-loading>
  </div>
</template>

<script setup>
/**
 * Componente de tabs para visualização de tickets
 * @component
 * @description Exibe tickets organizados em abas por status
 */

import { onMounted, watch } from 'vue'
import { useAtendimentoTabs } from '../../composables/atendimento/useAtendimentoTabs'
import ItemTicket from './ItemTicket.vue'

/**
 * Props do componente
 */
const props = defineProps({
  /** Lista de filas disponíveis */
  filas: {
    type: Array,
    default: () => []
  },
  /** Lista de tickets */
  tickets: {
    type: Array,
    default: () => []
  }
})

/**
 * Eventos que o componente pode emitir
 */
const emit = defineEmits(['ticket-click'])

/**
 * Composable com a lógica das tabs
 */
const {
  selectedTab,
  loading,
  availableTabs,
  openTickets,
  pendingTickets,
  closedTickets,
  groupTickets,
  selectFirstAvailableTab,
  updateTickets,
  setLoading
} = useAtendimentoTabs()

/**
 * Manipula clique em um ticket
 */
const handleTicketClick = (ticket) => {
  emit('ticket-click', ticket)
}

// Watchers
watch(() => props.tickets, (newTickets) => {
  updateTickets(newTickets)
}, { immediate: true })

// Lifecycle
onMounted(() => {
  selectFirstAvailableTab()
})
</script>

<style lang="scss" scoped>
.tab-container {
  display: flex;
  flex-direction: column;
  height: 100%;

  // Barra de tabs com scroll
  .tab-scroll {
    white-space: nowrap;
    overflow-x: auto;
    font-size: 0.875rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    background: $grey-1;

    // Estilização da scrollbar
    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-track {
      background: $grey-2;
    }

    &::-webkit-scrollbar-thumb {
      background: $grey-6;
      border-radius: 2px;
    }

    // Hover na scrollbar
    &:hover {
      &::-webkit-scrollbar-thumb {
        background: $grey-8;
      }
    }

    // Estilo das tabs
    :deep(.q-tab) {
      min-width: 100px;
      padding: 0 16px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(0, 0, 0, 0.05);
      }

      &--active {
        font-weight: 500;
      }
    }
  }

  // Conteúdo das tabs
  .tab-content {
    flex: 1;
    overflow: hidden;

    // Animações de transição
    .q-tab-panel {
      padding: 0;
      transition: transform 0.3s ease;
    }
  }

  // Tema escuro
  :deep(.body--dark) {
    .tab-scroll {
      background: $dark;
      border-color: rgba(255, 255, 255, 0.12);

      &::-webkit-scrollbar-track {
        background: $grey-9;
      }

      &::-webkit-scrollbar-thumb {
        background: $grey-7;
      }

      &:hover {
        &::-webkit-scrollbar-thumb {
          background: $grey-5;
        }
      }

      .q-tab:hover {
        background: rgba(255, 255, 255, 0.07);
      }
    }
  }
}

// Animações
.animated {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(10px);
  }
}
</style>
