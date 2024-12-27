import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { ConsultarTickets, ConsultarLogsTicket, DeletarMensagem } from '../service/tickets'
import { ListarFilas } from '../service/filas'
import { ListarWhatsapps } from '../service/sessoesWhatsapp'
import { ListarEtiquetas } from '../service/etiquetas'
import { ListarMensagensRapidas } from '../service/mensagensRapidas'
import { EditarEtiquetasContato, EditarCarteiraContato } from '../service/contatos'
import { ListarUsuarios } from '../service/user'

export function useAtendimentoState() {
  const store = useStore()
  const $q = useQuasar()
  const router = useRouter()

  // Estado
  const loading = ref(false)
  const selectedTab = ref('open')
  const drawerTickets = ref(true)
  const drawerContact = ref(true)
  const toolbarSearch = ref(true)
  const modalNovoTicket = ref(false)
  const modalContato = ref(false)
  const modalUsuario = ref(false)
  const exibirModalLogs = ref(false)
  const selectedContactId = ref(null)
  const filas = ref([])
  const etiquetas = ref([])
  const usuarios = ref([])
  const mensagensRapidas = ref([])
  const logsTicket = ref([])

  // Pesquisa e Filtros
  const pesquisaTickets = ref({
    searchParam: '',
    pageNumber: 1,
    status: ['open', 'pending', 'closed'],
    showAll: false,
    count: null,
    queuesIds: [],
    withUnreadMessages: false,
    isNotAssignedUser: false,
    includeNotQueueDefined: true
  })

  // Computed
  const tickets = computed(() => store.getters.tickets)
  const ticketFocado = computed(() => store.getters.ticketFocado)
  const hasMore = computed(() => store.getters.hasMore)
  const whatsapps = computed(() => store.getters.whatsapps)

  const openTickets = computed(() => 
    tickets.value.filter(ticket => ticket.status === 'open' && !ticket.isGroup)
  )

  const pendingTickets = computed(() => 
    tickets.value.filter(ticket => ticket.status === 'pending' && !ticket.isGroup)
  )

  const closedTickets = computed(() => 
    tickets.value.filter(ticket => ticket.status === 'closed' && !ticket.isGroup)
  )

  const groupTickets = computed(() => 
    tickets.value.filter(ticket => ticket.isGroup)
  )

  // Métodos
  const consultarTickets = async (paramsInit = {}) => {
    try {
      loading.value = true
      const params = { ...pesquisaTickets.value, ...paramsInit }
      const { data } = await ConsultarTickets(params)
      
      store.commit('LOAD_TICKETS', data.tickets)
      store.commit('SET_HAS_MORE', data.hasMore)
      
      return data
    } catch (err) {
      console.error('Erro ao consultar tickets:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const buscarTicketFiltro = async () => {
    store.commit('RESET_TICKETS')
    pesquisaTickets.value.pageNumber = 1
    localStorage.setItem('filtrosAtendimento', JSON.stringify(pesquisaTickets.value))
    await consultarTickets(pesquisaTickets.value)
  }

  const carregarDados = async () => {
    try {
      loading.value = true
      
      const [
        filasData,
        etiquetasData,
        whatsappsData,
        usuariosData,
        mensagensData
      ] = await Promise.all([
        ListarFilas(),
        ListarEtiquetas(true),
        ListarWhatsapps(),
        ListarUsuarios(),
        ListarMensagensRapidas()
      ])

      filas.value = filasData.data
      etiquetas.value = etiquetasData.data
      store.commit('LOAD_WHATSAPPS', whatsappsData.data)
      usuarios.value = usuariosData.data.users
      mensagensRapidas.value = mensagensData.data

      localStorage.setItem('filasCadastradas', JSON.stringify(filasData.data || []))
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const tagSelecionada = async (tags) => {
    const { data } = await EditarEtiquetasContato(ticketFocado.value.contact.id, [...tags])
    store.commit('UPDATE_TICKET_FOCADO_CONTACT', data)
  }

  const carteiraDefinida = async (wallets) => {
    const { data } = await EditarCarteiraContato(ticketFocado.value.contact.id, [...wallets])
    store.commit('UPDATE_TICKET_FOCADO_CONTACT', data)
  }

  const abrirModalLogs = async () => {
    const { data } = await ConsultarLogsTicket({ ticketId: ticketFocado.value.id })
    logsTicket.value = data
    exibirModalLogs.value = true
  }

  const deletarMensagem = async (mensagem) => {
    try {
      loading.value = true
      await DeletarMensagem(mensagem)
      mensagem.isDeleted = true
    } catch (err) {
      console.error('Erro ao deletar mensagem:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // Estado
    loading,
    selectedTab,
    drawerTickets,
    drawerContact,
    toolbarSearch,
    modalNovoTicket,
    modalContato,
    modalUsuario,
    exibirModalLogs,
    selectedContactId,
    filas,
    etiquetas,
    usuarios,
    mensagensRapidas,
    logsTicket,
    pesquisaTickets,

    // Computed
    tickets,
    ticketFocado,
    hasMore,
    whatsapps,
    openTickets,
    pendingTickets,
    closedTickets,
    groupTickets,

    // Métodos
    consultarTickets,
    buscarTicketFiltro,
    carregarDados,
    tagSelecionada,
    carteiraDefinida,
    abrirModalLogs,
    deletarMensagem
  }
}
