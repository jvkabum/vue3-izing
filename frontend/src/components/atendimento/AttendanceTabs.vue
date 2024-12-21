<template>
  <div class="tab-container">
    <q-tabs v-model="selectedTab" class="tab-scroll">
      <q-tab
        v-for="tab in availableTabs"
        :key="tab.name"
        :name="tab.name"
        :label="tab.label"
      >
        <q-badge
          v-if="tab.count > 0"
          :color="tab.color"
          text-color="white"
        >
          {{ tab.count }}
        </q-badge>
      </q-tab>
    </q-tabs>

    <!-- Conteúdo das Tabs -->
    <div class="tab-content">
      <div v-if="selectedTab === 'open'">
        <ItemTicket
          v-for="ticket in openTickets"
          :key="ticket.id"
          :ticket="ticket"
          :filas="filas"
          @click="handleTicketClick(ticket)"
        />
      </div>

      <div v-if="selectedTab === 'pending'">
        <ItemTicket
          v-for="ticket in pendingTickets"
          :key="ticket.id"
          :ticket="ticket"
          :filas="filas"
          @click="handleTicketClick(ticket)"
        />
      </div>

      <div v-if="selectedTab === 'closed'">
        <ItemTicket
          v-for="ticket in closedTickets"
          :key="ticket.id"
          :ticket="ticket"
          :filas="filas"
          @click="handleTicketClick(ticket)"
        />
      </div>

      <div v-if="selectedTab === 'group'">
        <ItemTicket
          v-for="ticket in groupTickets"
          :key="ticket.id"
          :ticket="ticket"
          :filas="filas"
          @click="handleTicketClick(ticket)"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="row justify-center q-my-md">
        <q-spinner color="white" size="3em" :thickness="3" />
      </div>
      <div class="row col justify-center q-my-sm text-white">
        Carregando...
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useAtendimentoTabs } from '../../composables/atendimento/useAtendimentoTabs'
import ItemTicket from './ItemTicket.vue'

// Props e Emits
const props = defineProps({
  filas: {
    type: Array,
    default: () => []
  },
  tickets: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['ticket-click'])

// Composables
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

// Métodos
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

  .tab-scroll {
    white-space: nowrap;
    overflow-x: auto;
    font-size: 0.75rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);

    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    &::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 2px;
    }
  }

  .tab-content {
    flex: 1;
    overflow-y: auto;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
}

// Dark mode
:deep(.q-dark) {
  .tab-scroll {
    &::-webkit-scrollbar-track {
      background: #1d1d1d;
    }

    &::-webkit-scrollbar-thumb {
      background: #666;
    }
  }
}
</style>
