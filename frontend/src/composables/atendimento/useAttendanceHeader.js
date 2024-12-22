import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAtendimentoFilters } from './useAtendimentoFilters'

/**
 * Composable para gerenciar a lógica do header de atendimento
 * @param {Function} emit - Função para emitir eventos
 * @returns {Object} Objeto contendo estados e métodos do header
 */
export function useAttendanceHeader(emit) {
  const $q = useQuasar()
  const router = useRouter()
  const { filterParams } = useAtendimentoFilters()

  // Estado do usuário
  const username = ref(localStorage.getItem('username'))

  /**
   * Computed para o parâmetro de busca
   * Mantém sincronia com os filtros
   */
  const searchParam = computed({
    get: () => filterParams.value.searchParam,
    set: (value) => {
      filterParams.value.searchParam = value
    }
  })

  /**
   * Verifica se existem filtros ativos
   */
  const hasActiveFilters = computed(() => {
    const { showAll, queuesIds, withUnreadMessages, isNotAssignedUser } = filterParams.value
    return showAll || 
           queuesIds.length > 0 || 
           withUnreadMessages || 
           isNotAssignedUser
  })

  /**
   * Manipula a ação de busca
   */
  const handleSearch = () => {
    emit('search')
  }

  /**
   * Manipula o logout do usuário
   */
  const handleLogout = () => {
    emit('logout')
  }

  /**
   * Abre o perfil do usuário
   */
  const openUserProfile = () => {
    emit('openProfile')
  }

  /**
   * Navega para o dashboard
   */
  const goToDashboard = () => {
    router.push({ name: 'home-dashboard' })
  }

  /**
   * Abre a lista de contatos
   * Em telas menores, abre modal de novo ticket
   */
  const openContacts = () => {
    if ($q.screen.lt.md) {
      emit('openNewTicketModal')
    } else {
      router.push({ name: 'chat-contatos' })
    }
  }

  return {
    username,
    searchParam,
    hasActiveFilters,
    handleSearch,
    handleLogout,
    openUserProfile,
    goToDashboard,
    openContacts
  }
}
