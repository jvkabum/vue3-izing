import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { 
  DeletarAutoResposta, 
  DeletarEtapaResposta, 
  ListarAutoResposta, 
  DeletarAcaoEtapa 
} from '../../service/autoResposta'
import { ListarFilas } from '../../service/filas'
import { ListarUsuarios } from '../../service/user'

/**
 * Composable para gerenciar fluxo de auto resposta
 * @returns {Object} Objeto contendo estados e métodos do fluxo
 */
export function useFluxoAutoResposta() {
  const $q = useQuasar()

  // Estado
  const autoRespostaSelecionado = ref({})
  const modalAutoResposta = ref(false)
  const etapaAutoRespostaEdicao = ref({})
  const modalEtapaAutoResposta = ref(false)
  const modalAcaoEtapa = ref(false)
  const acaoEtapaEdicao = ref({})
  const autoReply = ref({})
  const loading = ref(false)
  const filas = ref([])
  const usuarios = ref([])
  const listaAutoResposta = ref([])

  const pagination = ref({
    rowsPerPage: 40,
    rowsNumber: 0,
    lastIndex: 0
  })

  const params = ref({
    pageNumber: 1,
    searchParam: null,
    hasMore: true
  })

  /**
   * Tipos de auto resposta
   */
  const tipoAutoResposta = [
    { value: '0', label: 'Entrada (Criação do Ticket)' },
    { value: '1', label: 'Encerramento (Resolução Ticket)' }
  ]

  /**
   * Tipos de ação
   */
  const acaoEtapa = [
    { value: '0', label: 'Próxima Etapa' },
    { value: '1', label: 'Encaminhar para Fila' },
    { value: '2', label: 'Encaminhar para Usuário' }
  ]

  /**
   * Configuração das colunas
   */
  const columns = [
    { name: 'expand', label: '', field: 'expand', align: 'left' },
    { name: 'name', label: 'Nome', field: 'name', align: 'left' },
    {
      name: 'action',
      label: 'Tipo',
      field: 'action',
      align: 'left',
      format: (v) => tipoAutoResposta.find(a => a.value == v)?.label || ''
    },
    { 
      name: 'isActive', 
      label: 'Status', 
      field: 'isActive', 
      align: 'center', 
      format: (v) => v === true ? 'Ativo' : 'Inativo' 
    },
    { 
      name: 'celularTeste', 
      label: 'Celular Teste', 
      field: 'celularTeste', 
      align: 'center' 
    },
    { name: 'acoes', label: '', field: 'acoes', align: 'center' }
  ]

  const columnsEtapas = [
    { name: 'expand', label: '', field: 'expand', align: 'left' },
    { 
      name: 'id', 
      label: 'ID', 
      field: 'id', 
      align: 'center', 
      sortable: true, 
      sort: (a, b) => parseInt(a, 10) - parseInt(b, 10) 
    },
    { 
      name: 'reply', 
      label: 'Mensagem', 
      field: 'reply', 
      align: 'left', 
      classes: 'ellipsis', 
      style: 'max-width: 400px;' 
    },
    { 
      name: 'initialStep', 
      label: 'Etapa Inicial', 
      sortable: true, 
      field: 'initialStep', 
      align: 'left', 
      format: v => v ? 'Sim' : '' 
    },
    { name: 'acoes', label: '', field: 'acoes', align: 'center' }
  ]

  const columnsAcoes = [
    { name: 'words', label: 'Chave', field: 'words', align: 'left' },
    { 
      name: 'action', 
      label: 'Ação', 
      field: 'action', 
      align: 'left', 
      format: (v) => acaoEtapa.find(a => a.value == v)?.label 
    },
    {
      name: 'queueId',
      label: 'Fila Destino',
      field: 'queueId',
      align: 'center',
      format: (v) => v ? filas.value.find(f => f.id === v)?.queue : ''
    },
    { 
      name: 'userIdDestination', 
      label: 'Usuário Destino', 
      field: 'userIdDestination', 
      align: 'center', 
      format: (v) => v ? usuarios.value.find(u => u.id === v)?.name : '' 
    },
    { 
      name: 'nextStepId', 
      label: 'ID Etapa destino', 
      field: 'nextStepId', 
      align: 'center' 
    },
    { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' }
  ]

  /**
   * Lista todas as auto respostas
   */
  const listarAutoReply = async () => {
    try {
      const { data } = await ListarAutoResposta()
      listaAutoResposta.value = data.autoReply
    } catch (error) {
      console.error('Erro ao listar auto respostas:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar auto respostas',
        position: 'top'
      })
    }
  }

  /**
   * Lista todas as filas
   */
  const listarFilas = async () => {
    try {
      const { data } = await ListarFilas({ isActive: true })
      filas.value = data.filter(q => q.isActive)
    } catch (error) {
      console.error('Erro ao listar filas:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar filas',
        position: 'top'
      })
    }
  }

  /**
   * Lista todos os usuários
   */
  const listarUsuarios = async () => {
    try {
      const { data } = await ListarUsuarios(params.value)
      usuarios.value = data.users
    } catch (error) {
      console.error('Erro ao listar usuários:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar usuários',
        position: 'top'
      })
    }
  }

  // Outros métodos...

  return {
    // Estado
    autoRespostaSelecionado,
    modalAutoResposta,
    etapaAutoRespostaEdicao,
    modalEtapaAutoResposta,
    modalAcaoEtapa,
    acaoEtapaEdicao,
    autoReply,
    loading,
    filas,
    usuarios,
    listaAutoResposta,
    pagination,
    params,

    // Constantes
    tipoAutoResposta,
    acaoEtapa,
    columns,
    columnsEtapas,
    columnsAcoes,

    // Métodos
    listarAutoReply,
    listarFilas,
    listarUsuarios
  }
}
