import { ref, onMounted } from 'vue'
import { formatDistance, parseJSON } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'
import { api } from 'src/boot/axios'
import { useStore } from 'src/stores'
import { useQuasar } from 'quasar'

export function useTicket() {
  const store = useStore()
  const $q = useQuasar()

  const loading = ref(false)
  const tickets = ref([])
  const tagsDoTicket = ref([])
  const walletsDoTicket = ref([])
  const isTicketModalOpen = ref(false)
  const currentTicket = ref({})
  const recalcularHora = ref(1)

  const statusAbreviado = {
    open: 'A',
    pending: 'P',
    closed: 'R'
  }

  const status = {
    open: 'Aberto',
    pending: 'Pendente',
    closed: 'Resolvido'
  }

  const color = {
    open: 'primary',
    pending: 'negative',
    closed: 'positive'
  }

  const borderColor = {
    open: 'primary',
    pending: 'negative',
    closed: 'positive'
  }

  const closeModal = () => {
    isTicketModalOpen.value = false
  }

  const obterNomeFila = (ticket, filas) => {
    try {
      const fila = filas.find(f => f.id === ticket.queueId)
      if (fila) {
        return fila.queue
      }
      return ''
    } catch (error) {
      return ''
    }
  }

  const obterInformacoes = async (ticket, tipo) => {
    try {
      const { data } = await api.get(`/contacts/${ticket.contactId}`)
      if (data) {
        if (tipo === 'tags') {
          const tags = data.tags
          return tags.map(tag => ({ tag: tag.tag, color: tag.color }))
        } else if (tipo === 'carteiras') {
          const wallets = data.wallets
          return wallets.map(wallet => ({ wallet: wallet.name }))
        }
      }
      return []
    } catch (error) {
      console.error(`Erro ao obter ${tipo}:`, error)
      return []
    }
  }

  const dataInWords = (timestamp, updated) => {
    let data = parseJSON(updated)
    if (timestamp) {
      data = new Date(Number(timestamp))
    }
    return formatDistance(data, new Date(), { locale: pt })
  }

  const buscarTickets = async (params = {}) => {
    try {
      loading.value = true
      const { data } = await api.get('/tickets', { params })
      tickets.value = data.tickets
      return data
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: 'Erro ao buscar tickets',
        position: 'top'
      })
    } finally {
      loading.value = false
    }
  }

  const atualizarStatusTicket = async (ticketId, status) => {
    try {
      loading.value = true
      const { data } = await api.put(`/tickets/${ticketId}`, { status })
      $q.notify({
        type: 'positive',
        message: 'Status do ticket atualizado com sucesso',
        position: 'top'
      })
      return data
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: 'Erro ao atualizar status do ticket',
        position: 'top'
      })
    } finally {
      loading.value = false
    }
  }

  const abrirChatContato = (ticket) => {
    // caso esteja em um tamanho mobile, fechar a drawer dos contatos
    if ($q.screen.lt.md && ticket.status !== 'pending') {
      window.dispatchEvent(new CustomEvent('infor-cabecalo-chat:acao-menu'))
    }
    if (!(ticket.status !== 'pending' && (ticket.id !== store.getters.ticketFocado.id || window.$route.name !== 'chat'))) return
    store.commit('SET_HAS_MORE', true)
    store.dispatch('AbrirChatMensagens', ticket)
  }

  const setupTicketSubscription = async (ticket) => {
    tagsDoTicket.value = await obterInformacoes(ticket, 'tags')
    walletsDoTicket.value = await obterInformacoes(ticket, 'carteiras')
    
    store.subscribe(async (mutation, state) => {
      if (mutation.type === 'UPDATE_CONTACT' && mutation.payload.id === ticket.contactId) {
        tagsDoTicket.value = await obterInformacoes(ticket, 'tags')
        walletsDoTicket.value = await obterInformacoes(ticket, 'carteiras')
      }
    })

    setInterval(() => {
      recalcularHora.value++
    }, 20000)
  }

  return {
    loading,
    tickets,
    tagsDoTicket,
    walletsDoTicket,
    isTicketModalOpen,
    currentTicket,
    recalcularHora,
    statusAbreviado,
    status,
    color,
    borderColor,
    closeModal,
    obterNomeFila,
    obterInformacoes,
    dataInWords,
    buscarTickets,
    atualizarStatusTicket,
    abrirChatContato,
    setupTicketSubscription
  }
}
