import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'vuex'
import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'
import { 
  DeletarWhatsapp, 
  DeleteWhatsappSession, 
  StartWhatsappSession, 
  ListarWhatsapps, 
  RequestNewQrCode,
  UpdateWhatsapp 
} from '../../service/sessoesWhatsapp'
import { ListarChatFlow } from '../../service/chatFlow'

/**
 * Composable para gerenciar sessões WhatsApp
 * @returns {Object} Objeto contendo estados e métodos das sessões
 */
export function useSessaoWhatsapp() {
  const $q = useQuasar()
  const store = useStore()

  // Estado
  const loading = ref(false)
  const isAdmin = ref(false)
  const abrirModalQR = ref(false)
  const modalWhatsapp = ref(false)
  const whatsappSelecionado = ref({})
  const listaChatFlow = ref([])
  const whatsAppId = ref(null)
  const canais = ref([])

  // Computed
  const whatsapps = computed(() => store.getters.whatsapps)
  const dadosWhatsappSelecionado = computed(() => {
    const { id } = whatsappSelecionado.value
    return whatsapps.value.find(w => w.id === id)
  })

  /**
   * Configuração das colunas da tabela
   */
  const columns = [
    {
      name: 'name',
      label: 'Nome',
      field: 'name',
      align: 'left'
    },
    {
      name: 'status',
      label: 'Status',
      field: 'status',
      align: 'center'
    },
    {
      name: 'session',
      label: 'Sessão',
      field: 'status',
      align: 'center'
    },
    {
      name: 'number',
      label: 'Número',
      field: 'number',
      align: 'center'
    },
    {
      name: 'updatedAt',
      label: 'Última Atualização',
      field: 'updatedAt',
      align: 'center',
      format: d => formatarData(d, 'dd/MM/yyyy HH:mm')
    },
    {
      name: 'isDefault',
      label: 'Padrão',
      field: 'isDefault',
      align: 'center'
    },
    {
      name: 'acoes',
      label: 'Ações',
      field: 'acoes',
      align: 'center'
    }
  ]

  /**
   * Formata data no formato especificado
   */
  const formatarData = (data, formato) => {
    return format(parseISO(data), formato, { locale: pt })
  }

  /**
   * Lista todos os canais
   */
  const listarWhatsapps = async () => {
    try {
      loading.value = true
      const { data } = await ListarWhatsapps()
      store.commit('LOAD_WHATSAPPS', data)
    } catch (error) {
      console.error('Erro ao listar canais:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar canais',
        position: 'top'
      })
    } finally {
      loading.value = false
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
      console.error('Erro ao listar fluxos:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar fluxos',
        position: 'top'
      })
    }
  }

  /**
   * Abre modal de QR Code
   */
  const handleOpenQrModal = (channel) => {
    whatsappSelecionado.value = channel
    abrirModalQR.value = true
  }

  /**
   * Abre modal de WhatsApp
   */
  const handleOpenModalWhatsapp = (whatsapp) => {
    whatsappSelecionado.value = whatsapp
    modalWhatsapp.value = true
  }

  /**
   * Desconecta sessão WhatsApp
   */
  const handleDisconectWhatsSession = async (whatsAppId) => {
    try {
      await $q.dialog({
        title: 'Atenção!!',
        message: 'Deseja realmente desconectar?',
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          push: true
        },
        persistent: true
      })

      loading.value = true
      await DeleteWhatsappSession(whatsAppId)
      
      const whatsapp = whatsapps.value.find(w => w.id === whatsAppId)
      store.commit('UPDATE_WHATSAPPS', {
        ...whatsapp,
        status: 'DISCONNECTED'
      })
    } catch (error) {
      if (error) { // Ignora erro de cancelamento do diálogo
        console.error('Erro ao desconectar:', error)
        $q.notify({
          type: 'negative',
          message: 'Erro ao desconectar',
          position: 'top'
        })
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Inicia sessão WhatsApp
   */
  const handleStartWhatsAppSession = async (whatsAppId) => {
    try {
      await StartWhatsappSession(whatsAppId)
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao iniciar sessão',
        position: 'top'
      })
    }
  }

  /**
   * Solicita novo QR Code
   */
  const handleRequestNewQrCode = async (channel) => {
    if (channel.type === 'telegram' && !channel.tokenTelegram) {
      $q.notify({
        type: 'negative',
        message: 'Necessário informar o token para Telegram',
        position: 'top'
      })
      return
    }

    try {
      loading.value = true
      await RequestNewQrCode({ id: channel.id, isQrcode: true })
      
      setTimeout(() => {
        handleOpenQrModal(channel)
      }, 2000)
    } catch (error) {
      console.error('Erro ao solicitar QR Code:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao solicitar QR Code',
        position: 'top'
      })
    } finally {
      loading.value = false
    }
  }

  /**
   * Deleta WhatsApp
   */
  const deleteWhatsapp = async (whatsapp) => {
    try {
      await $q.dialog({
        title: 'Atenção!!',
        message: 'Não é uma boa ideia apagar se já tiver gerado atendimentos para esse whatsapp.',
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          push: true
        },
        persistent: true
      })

      loading.value = true
      await DeletarWhatsapp(whatsapp.id)
      store.commit('DELETE_WHATSAPPS', whatsapp.id)
    } catch (error) {
      if (error) { // Ignora erro de cancelamento do diálogo
        console.error('Erro ao deletar:', error)
        $q.notify({
          type: 'negative',
          message: 'Erro ao deletar',
          position: 'top'
        })
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Salva WhatsApp
   */
  const handleSaveWhatsApp = async (whatsapp) => {
    try {
      await UpdateWhatsapp(whatsapp.id, whatsapp)
      
      $q.notify({
        type: 'positive',
        message: `WhatsApp ${whatsapp.id ? 'editado' : 'criado'} com sucesso!`,
        position: 'top',
        timeout: 2000
      })
    } catch (error) {
      console.error('Erro ao salvar:', error)
      $q.notify({
        type: 'negative',
        message: 'O nome da conexão não pode existir na plataforma, é um identificador único.',
        position: 'top'
      })
    }
  }

  /**
   * Inicializa dados
   */
  const initialize = () => {
    isAdmin.value = localStorage.getItem('profile')
    listarWhatsapps()
    listarChatFlow()
  }

  return {
    // Estado
    loading,
    isAdmin,
    abrirModalQR,
    modalWhatsapp,
    whatsappSelecionado,
    listaChatFlow,
    whatsAppId,
    canais,
    columns,
    whatsapps,
    dadosWhatsappSelecionado,

    // Métodos
    formatarData,
    listarWhatsapps,
    listarChatFlow,
    handleOpenQrModal,
    handleOpenModalWhatsapp,
    handleDisconectWhatsSession,
    handleStartWhatsAppSession,
    handleRequestNewQrCode,
    deleteWhatsapp,
    handleSaveWhatsApp,
    initialize
  }
}
