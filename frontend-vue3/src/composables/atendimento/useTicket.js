import { ref, onMounted } from 'vue'
import { formatDistance, parseJSON } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'
import { ObterContato } from 'src/service/contatos'
import { useStore } from 'src/stores'
import { useQuasar } from 'quasar'

export function useTicket() {
  const store = useStore()
  const $q = useQuasar()

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
      const contato = await ObterContato(ticket.contactId)
      if (contato) {
        if (tipo === 'tags') {
          const tags = contato.data.tags
          return tags.map(tag => ({ tag: tag.tag, color: tag.color }))
        } else if (tipo === 'carteiras') {
          const wallets = contato.data.wallets
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
    abrirChatContato,
    setupTicketSubscription
  }
}
