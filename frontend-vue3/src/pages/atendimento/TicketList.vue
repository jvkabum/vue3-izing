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
import { watch, onMounted, onBeforeUnmount } from 'vue'
import ItemTicket from './ItemTicket.vue'
import { useTicketList } from '../../composables/atendimento/useTicketList'
import { defineProps } from 'vue'

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

// Composables
const {
  loading,
  getTickets: tickets,
  onScroll,
  consultarTickets,
  setupTicketListSocket,
  disconnectSocket
} = useTicketList()

// Watchers
watch(() => props.status, () => {
  disconnectSocket()
  setupTicketListSocket(props.status, props.showAll, props.queuesIds)
  consultarTickets({
    status: props.status,
    searchParam: props.searchParam,
    showAll: props.showAll,
    withUnreadMessages: props.withUnreadMessages,
    isNotAssignedUser: props.isNotAssignedUser,
    includeNotQueueDefined: props.includeNotQueueDefined,
    queuesIds: props.queuesIds,
    pageNumber: 1
  }, props.status)
})

const watchProps = ['showAll', 'withUnreadMessages', 'isNotAssignedUser', 'includeNotQueueDefined', 'queuesIds', 'searchParam']
watchProps.forEach(prop => {
  watch(() => props[prop], () => {
    if (prop !== 'searchParam') {
      disconnectSocket()
      setupTicketListSocket(props.status, props.showAll, props.queuesIds)
    }
    consultarTickets({
      status: props.status,
      searchParam: props.searchParam,
      showAll: props.showAll,
      withUnreadMessages: props.withUnreadMessages,
      isNotAssignedUser: props.isNotAssignedUser,
      includeNotQueueDefined: props.includeNotQueueDefined,
      queuesIds: props.queuesIds,
      pageNumber: 1
    }, props.status)
  })
})

// Lifecycle hooks
onMounted(() => {
  setupTicketListSocket(props.status, props.showAll, props.queuesIds)
  consultarTickets({
    status: props.status,
    searchParam: props.searchParam,
    showAll: props.showAll,
    withUnreadMessages: props.withUnreadMessages,
    isNotAssignedUser: props.isNotAssignedUser,
    includeNotQueueDefined: props.includeNotQueueDefined,
    queuesIds: props.queuesIds,
    pageNumber: 1
  }, props.status)
})

onBeforeUnmount(() => {
  disconnectSocket()
})
</script>

<style lang="scss" scoped>
</style>
