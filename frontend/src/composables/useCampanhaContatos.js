import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { format, parseISO, sub } from 'date-fns'
import { estadoPorDdd, estadosBR } from '../utils/constants'
import { 
  AdicionarContatosCampanha, 
  DeletarTodosContatosCampanha, 
  ListarContatosCampanha, 
  DeletarContatoCampanha 
} from '../service/campanhas'
import { RelatorioContatos } from '../service/estatisticas'
import { ListarEtiquetas } from '../service/etiquetas'
import { ListarUsuarios } from '../service/user'

export function useCampanhaContatos(campanhaId) {
  const $q = useQuasar()

  // Estado
  const loading = ref(false)
  const contatosCampanha = ref([])
  const contatosAdd = ref([])
  const selected = ref([])
  const etiquetas = ref([])
  const usuarios = ref([])
  const modalAddContatosCampanha = ref(false)

  // Pesquisa
  const pesquisa = ref({
    startDate: format(sub(new Date(), { days: 30 }), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    ddds: [],
    tags: [],
    wallets: [],
    searchParam: ''
  })

  // ACK Status
  const ACK = {
    '-1': 'Error',
    0: 'Envio Pendente',
    1: 'Entrega Pendente',
    2: 'Recebida',
    3: 'Lida',
    4: 'Reproduzido'
  }

  // Métodos
  const formatDate = (date, dateMask = 'dd/MM/yyyy') => {
    return format(parseISO(date), dateMask)
  }

  const definirEstadoNumero = (numero) => {
    const ddd = numero.substring(2, 4)
    return estadosBR.find(e => e.sigla === estadoPorDdd[ddd])?.nome || ''
  }

  const listarAddContatos = async () => {
    try {
      const { data } = await RelatorioContatos(pesquisa.value)
      if (pesquisa.value.tags.length > 0) {
        contatosAdd.value = data.contacts.filter(contact =>
          pesquisa.value.tags.every(tag => 
            contact.tags.map(contactTag => contactTag.id).includes(tag)
          )
        )
      } else {
        contatosAdd.value = data.contacts
      }
    } catch (err) {
      console.error(err)
      $q.notify({
        type: 'negative',
        message: 'Erro ao listar contatos'
      })
    }
  }

  const listarEtiquetas = async () => {
    try {
      const { data } = await ListarEtiquetas(true)
      etiquetas.value = data
    } catch (err) {
      console.error(err)
    }
  }

  const listarContatosCampanha = async () => {
    try {
      loading.value = true
      const { data } = await ListarContatosCampanha(campanhaId)
      contatosCampanha.value = data
    } catch (err) {
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const addContatosCampanha = async () => {
    if (selected.value.length > 300) {
      $q.notify({
        type: 'negative',
        message: 'O número máximo de contatos é 300'
      })
      return
    }

    try {
      await AdicionarContatosCampanha(selected.value, campanhaId)
      await listarContatosCampanha()
      modalAddContatosCampanha.value = false
      $q.notify({
        type: 'positive',
        message: 'Contatos adicionados'
      })
    } catch (err) {
      console.error(err)
      $q.notify({
        type: 'negative',
        message: 'Erro ao adicionar contatos'
      })
    }
  }

  const deletarContatoCampanha = async (contato) => {
    try {
      await DeletarContatoCampanha(campanhaId, contato.id)
      await listarContatosCampanha()
      $q.notify({
        type: 'positive',
        message: 'Contato excluído desta campanha'
      })
    } catch (err) {
      console.error(err)
      $q.notify({
        type: 'negative',
        message: 'Erro ao excluir contato'
      })
    }
  }

  const deletarTodosContatosCampanha = () => {
    $q.dialog({
      title: 'Atenção!! Deseja realmente retirar todos os contatos desta campanha?',
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
    }).onOk(async () => {
      try {
        await DeletarTodosContatosCampanha(campanhaId)
        contatosCampanha.value = []
        $q.notify({
          type: 'positive',
          message: 'Contatos excluídos da campanha'
        })
      } catch (err) {
        console.error(err)
        $q.notify({
          type: 'negative',
          message: 'Erro ao excluir contatos'
        })
      }
    })
  }

  const listarUsuarios = async () => {
    try {
      const { data } = await ListarUsuarios()
      usuarios.value = data.users
    } catch (err) {
      console.error(err)
      $q.notify({
        type: 'negative',
        message: 'Erro ao listar usuários'
      })
    }
  }

  // Inicialização
  const initialize = async () => {
    await Promise.all([
      listarEtiquetas(),
      listarUsuarios(),
      listarContatosCampanha()
    ])
  }

  return {
    // Estado
    loading,
    contatosCampanha,
    contatosAdd,
    selected,
    etiquetas,
    usuarios,
    modalAddContatosCampanha,
    pesquisa,
    ACK,

    // Métodos
    formatDate,
    definirEstadoNumero,
    listarAddContatos,
    listarContatosCampanha,
    addContatosCampanha,
    deletarContatoCampanha,
    deletarTodosContatosCampanha,
    initialize
  }
}
