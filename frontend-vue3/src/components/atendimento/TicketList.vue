<template>
  <div>
    <q-scroll-area
      ref="scrollAreaTickets"
      style="height: calc(100vh - 300px)"
      @scroll="onScroll"
    >
      <ItemTicket
        v-for="(ticket, key) in tickets"
        :key="key"
        :ticket="ticket"
        :filas="filas"
      />
      <div v-if="loading">
        <div class="row justify-center q-my-md">
          <q-spinner
            color="white"
            size="3em"
            :thickness="3"
          />
        </div>
        <div class="row col justify-center q-my-sm text-white">
          Carregando...
        </div>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup>
import { computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useTicketList } from 'src/composables/atendimento/useTicketList'
import ItemTicket from './ItemTicket.vue'

const props = defineProps({
  filas: {
    type: Array,
    default: () => []
  },
  status: {
    type: String,
    default: 'open'
  },
  searchParam: {
    type: String,
    default: ''
  },
  showAll: {
    type: Boolean,
    default: false
  },
  withUnreadMessages: {
    type: Boolean,
    default: false
  },
  isNotAssignedUser: {
    type: Boolean,
    default: false
  },
  includeNotQueueDefined: {
    type: Boolean,
    default: true
  },
  queuesIds: {
    type: Array,
    default: () => []
  }
})

const {
  loading,
  getTickets,
  onScroll,
  consultarTickets,
  setupTicketListSocket,
  disconnectSocket
} = useTicketList()

const tickets = computed(() => getTickets.value(props.status))

const registerPropWatchers = () => {
  const propNames = [
    'status',
    'showAll',
    'withUnreadMessages',
    'isNotAssignedUser',
    'includeNotQueueDefined',
    'queuesIds',
    'searchParam'
  ]

  propNames.forEach(propName => {
    watch(() => props[propName], () => {
      if (propName !== 'searchParam') {
        disconnectSocket()
        setupTicketListSocket(props.status, props.showAll, props.queuesIds)
      }
      
      const params = {
        status: props.status,
        searchParam: props.searchParam,
        showAll: props.showAll,
        withUnreadMessages: props.withUnreadMessages,
        isNotAssignedUser: props.isNotAssignedUser,
        includeNotQueueDefined: props.includeNotQueueDefined,
        queuesIds: props.queuesIds,
        pageNumber: 1
      }
      
      consultarTickets(params, props.status)
    })
  })
}

onMounted(() => {
  setupTicketListSocket(props.status, props.showAll, props.queuesIds)
  registerPropWatchers()
})

onBeforeUnmount(() => {
  disconnectSocket()
})
</script>
