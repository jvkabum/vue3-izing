import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { formatDistance, parseJSON } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'
import { ObterContato } from '../../service/contatos'
import { useAtendimentoTicketStore } from '../../stores'
import { useRouter } from 'vue-router'

export function useTicket() {
  const $q = useQuasar()
  const router = useRouter()
  const ticketStore = useAtendimentoTicketStore()

  const borderColor = {
    open: 'primary',
    pending: 'negative',
    closed: 'positive'
  }

  const recalcularHora = ref(1)
  setInterval(() => {
    recalcularHora.value++
  }, 20000)

  const ticketFocado = computed(() => ticketStore.getTicketFocado)

  const dataInWords = (timestamp, updated) => {
    let data = parseJSON(updated)
    if (timestamp) {
      data = new Date(Number(timestamp))
    }
    return formatDistance(data, new Date(), { locale: pt })
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

  const abrirChatContato = async (ticket) => {
    // caso esteja em um tamanho mobile, fechar a drawer dos contatos
    if ($q.screen.lt.md && ticket.status !== 'pending') {
      window.dispatchEvent(new Event('infor-cabecalo-chat:acao-menu'))
    }
    
    if (!(ticket.status !== 'pending' && (ticket.id !== ticketFocado.value.id || router.currentRoute.value.name !== 'chat'))) return
    
    await ticketStore.abrirChatMensagens(ticket)
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

  return {
    borderColor,
    recalcularHora,
    ticketFocado,
    dataInWords,
    obterInformacoes,
    abrirChatContato,
    obterNomeFila
  }
}
