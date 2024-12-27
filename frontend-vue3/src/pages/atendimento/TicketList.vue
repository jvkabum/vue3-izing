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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useQuasar } from 'quasar'
import ItemTicket from './ItemTicket.vue'
import { ConsultarTickets } from '../../service/tickets'
import { socketIO } from '../../utils/socket'
import { useAtendimentoTicketStore } from '../../stores'

// Props
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

// Store
const ticketStore = useAtendimentoTicketStore()
const $q = useQuasar()

// Estado local
const socket = ref(null)
const loading = ref(false)
const countTickets = ref(0)
const hasMore = ref(true)
const pesquisaTickets = ref({
  pageNumber: 1,
  count: null
})

// Computed
const tickets = computed(() => ticketStore.getTickets)
const ticketFocado = computed(() => ticketStore.getTicketFocado)

// Métodos
const onScroll = (info) => {
  if (info.verticalPercentage <= 0.85) return
  onLoadMore()
}

const onLoadMore = async () => {
  if (tickets.value.length === 0 || !hasMore.value || loading.value) {
    return
  }
  try {
    loading.value = true
    pesquisaTickets.value.pageNumber++
    await consultarTickets()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const consultarTickets = async (paramsInit = {}) => {
  const params = {
    ...pesquisaTickets.value,
    status: props.status,
    searchParam: props.searchParam,
    showAll: props.showAll,
    withUnreadMessages: props.withUnreadMessages,
    isNotAssignedUser: props.isNotAssignedUser,
    includeNotQueueDefined: props.includeNotQueueDefined,
    queuesIds: props.queuesIds,
    ...paramsInit
  }

  if (params.pageNumber === 1) {
    ticketStore.resetTickets()
  }

  try {
    const { data } = await ConsultarTickets(params)
    countTickets.value = data.count
    ticketStore.loadTickets(data.tickets)
    hasMore.value = data.hasMore
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Ocorreu um erro ao consultar tickets',
      position: 'top'
    })
    console.error(err)
  }
}

const scrollToBottom = () => {
  setTimeout(() => {
    window.dispatchEvent(new Event('scrollToBottomMessageChat'))
  }, 200)
}

const ticketListSocket = () => {
  socket.value = socketIO()
  const usuario = JSON.parse(localStorage.getItem('usuario'))

  const shouldUpdateTicket = (ticket) =>
    (!ticket.userId || ticket.userId === usuario?.userId || props.showAll) &&
    (!ticket.queueId || props.queuesIds.indexOf(ticket.queueId) > -1)

  const notBelongsToUserQueues = (ticket) =>
    ticket.queueId && props.queuesIds.indexOf(ticket.queueId) === -1

  socket.value.on('connect', () => {
    if (props.status) {
      socket.value.emit(`tenant:${usuario.tenantId}:joinTickets`, props.status)
    } else {
      socket.value.emit(`tenant:${usuario.tenantId}:joinNotification`)
    }
  })

  socket.value.on(`tenant:${usuario.tenantId}:ticket`, (data) => {
    if (data.action === 'updateUnread') {
      ticketStore.resetUnread({ ticketId: data.ticketId })
    }

    if (data.action === 'update' && shouldUpdateTicket(data.ticket)) {
      ticketStore.updateTicket(data.ticket)
    }

    if (data.action === 'update' && notBelongsToUserQueues(data.ticket)) {
      ticketStore.deleteTicket(data.ticket.id)
    }

    if (data.action === 'delete') {
      ticketStore.deleteTicket(data.ticketId)
    }
  })

  socket.value.on(`tenant:${usuario.tenantId}:appMessage`, (data) => {
    if (data.action === 'create' && shouldUpdateTicket(data.ticket)) {
      if (ticketFocado.value.id !== data.ticket.id && props.status !== 'closed' && !data.message.fromMe && !data.ticket.chatFlowId) {
        window.dispatchEvent(new CustomEvent('handlerNotifications', { detail: data.message }))
      }
      ticketStore.updateTicket(data.ticket)
    }
  })
}

// Watchers
watch(() => ticketFocado.value.id, (newId) => {
  if (socket.value && newId) {
    socket.value.emit(`tenant:${ticketFocado.value.tenantId}:joinChatBox`, `${newId}`)
  }
}, { immediate: true })

watch(() => socket.value, (newSocket) => {
  if (newSocket && ticketFocado.value?.id) {
    newSocket.emit(`tenant:${ticketFocado.value.tenantId}:joinChatBox`, `${ticketFocado.value.id}`)
  }
}, { immediate: true })

const watchProps = ['status', 'showAll', 'withUnreadMessages', 'isNotAssignedUser', 'includeNotQueueDefined', 'queuesIds', 'searchParam']
watchProps.forEach(prop => {
  watch(() => props[prop], () => {
    if (prop !== 'searchParam') {
      if (socket.value) {
        socket.value.disconnect()
      }
      ticketListSocket()
    }
    consultarTickets({ pageNumber: 1 })
  })
})

// Lifecycle hooks
onMounted(() => {
  ticketListSocket()
})

onBeforeUnmount(() => {
  if (socket.value) {
    socket.value.disconnect()
  }
})
</script>

<style lang="scss" scoped>
</style>
