import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'vuex'
import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'
import { AdminListarChannels, AdminListarEmpresas } from '../../service/channels'

/**
 * Composable para gerenciar sessões super
 * @returns {Object} Objeto contendo estados e métodos das sessões
 */
export function useSessaoSuper() {
  const $q = useQuasar()
  const store = useStore()

  // Estado
  const loading = ref(false)
  const empresas = ref([])
  const isAdmin = ref(false)
  const whatsappSelecionado = ref({})
  const whatsAppId = ref(null)
  const objStatus = ref({
    qrcode: ''
  })

  // Computed
  const whatsapps = computed(() => store.getters.whatsapps)

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
  const listarChannels = async () => {
    try {
      loading.value = true
      const { data } = await AdminListarChannels()
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
   * Lista todas as empresas
   */
  const listarEmpresas = async () => {
    try {
      loading.value = true
      const { data } = await AdminListarEmpresas()
      empresas.value = data
    } catch (error) {
      console.error('Erro ao listar empresas:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar empresas',
        position: 'top'
      })
    } finally {
      loading.value = false
    }
  }

  /**
   * Inicializa dados
   */
  const initialize = () => {
    isAdmin.value = localStorage.getItem('profile')
    listarChannels()
    listarEmpresas()
  }

  return {
    // Estado
    loading,
    empresas,
    isAdmin,
    whatsappSelecionado,
    whatsAppId,
    objStatus,
    columns,
    whatsapps,

    // Métodos
    formatarData,
    listarChannels,
    listarEmpresas,
    initialize
  }
}
