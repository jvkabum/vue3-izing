import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { ListarChatFlow } from '../../service/chatFlow'
import { ListarConfiguracoes, AlterarConfiguracao } from '../../service/configuracoes'

/**
 * Composable para gerenciar configurações do sistema
 * @returns {Object} Objeto contendo estados e métodos das configurações
 */
export function useConfiguracoes() {
  const $q = useQuasar()

  // Estado
  const configuracoes = ref([])
  const listaChatFlow = ref([])
  const NotViewAssignedTickets = ref(null)
  const NotViewTicketsChatBot = ref(null)
  const DirectTicketsToWallets = ref(null)
  const botTicketActive = ref(null)
  const ignoreGroupMsg = ref(null)
  const rejectCalls = ref(null)
  const callRejectMessage = ref('')
  const daysToClose = ref(3)

  /**
   * Lista todas as configurações
   */
  const listarConfiguracoes = async () => {
    try {
      const { data } = await ListarConfiguracoes()
      configuracoes.value = data
      configuracoes.value.forEach(el => {
        let value = el.value
        if (el.key === 'botTicketActive' && el.value) {
          value = +el.value
        }
        if (ref(el.key)) {
          ref(el.key).value = value
        }
      })
    } catch (error) {
      console.error('Erro ao listar configurações:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar configurações',
        position: 'top'
      })
    }
  }

  /**
   * Lista todos os fluxos de chat
   */
  const listarChatFlow = async () => {
    try {
      const { data } = await ListarChatFlow()
      listaChatFlow.value = data.chatFlow
    } catch (error) {
      console.error('Erro ao listar chat flows:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar fluxos de chat',
        position: 'top'
      })
    }
  }

  /**
   * Atualiza uma configuração
   * @param {string} key - Chave da configuração
   * @param {any} value - Valor da configuração
   */
  const atualizarConfiguracao = async (key, value = null) => {
    try {
      const params = {
        key,
        value: value !== null ? value : ref(key).value
      }

      await AlterarConfiguracao(params)
      
      $q.notify({
        type: 'positive',
        message: 'Configuração alterada com sucesso!',
        position: 'top',
        timeout: 2000,
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
    } catch (error) {
      console.error('Erro ao alterar configuração:', error)
      
      const message = error?.response?.data?.message || 'Ocorreu um erro ao tentar alterar a configuração'
      
      $q.notify({
        type: 'negative',
        message: `Erro ao alterar configuração: ${message}`,
        position: 'top',
        timeout: 5000,
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
    }
  }

  return {
    // Estado
    configuracoes,
    listaChatFlow,
    NotViewAssignedTickets,
    NotViewTicketsChatBot,
    DirectTicketsToWallets,
    botTicketActive,
    ignoreGroupMsg,
    rejectCalls,
    callRejectMessage,
    daysToClose,

    // Métodos
    listarConfiguracoes,
    listarChatFlow,
    atualizarConfiguracao
  }
}
