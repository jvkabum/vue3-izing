import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAtendimentoTicketStore } from '../../stores'

/**
 * Composable para gerenciar o drawer de atendimento
 * @returns {Object} Objeto contendo estados e métodos do drawer
 */
export function useAttendanceDrawer() {
  const $q = useQuasar()
  const router = useRouter()
  const ticketStore = useAtendimentoTicketStore()

  // Estado
  const drawerTickets = ref(true)
  const toolbarSearch = ref(true)
  const showNewTicketModal = ref(false)
  const showUserModal = ref(false)
  const scrollAreaTickets = ref(null)

  /**
   * Largura do drawer baseada no tamanho da tela
   */
  const drawerWidth = computed(() => 
    $q.screen.lt.sm ? '100%' : '370'
  )

  /**
   * Abre o chat de um ticket
   * @param {Object} ticket - Ticket a ser aberto
   */
  const openChat = async (ticket) => {
    try {
      await ticketStore.abrirChatMensagens(ticket)
      
      // Fecha drawer em telas pequenas
      if ($q.screen.lt.md) {
        drawerTickets.value = false
      }
    } catch (error) {
      console.error('Erro ao abrir chat:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao abrir chat',
        position: 'top'
      })
    }
  }

  /**
   * Alterna o modo escuro
   * @param {boolean} value - Novo estado do modo escuro
   */
  const toggleDarkMode = (value) => {
    $q.dark.set(value)
    
    // Salva preferência no localStorage
    localStorage.setItem('darkMode', value)
  }

  /**
   * Abre modal de novo ticket
   */
  const openNewTicketModal = () => {
    showNewTicketModal.value = true
  }

  /**
   * Abre modal de perfil do usuário
   */
  const openUserProfile = () => {
    showUserModal.value = true
  }

  /**
   * Realiza logout do usuário
   */
  const handleLogout = () => {
    // Limpa dados do usuário
    localStorage.clear()
    sessionStorage.clear()

    // Redireciona para login
    router.push({ name: 'login' })
  }

  /**
   * Manipula scroll da lista de tickets
   * @param {Object} info - Informações do scroll
   */
  const handleScroll = (info) => {
    // Implementar lógica de scroll infinito se necessário
    console.log('Scroll:', info)
  }

  return {
    // Estado
    drawerTickets,
    drawerWidth,
    toolbarSearch,
    showNewTicketModal,
    showUserModal,
    scrollAreaTickets,

    // Métodos
    openChat,
    toggleDarkMode,
    openNewTicketModal,
    openUserProfile,
    handleLogout,
    handleScroll
  }
}
