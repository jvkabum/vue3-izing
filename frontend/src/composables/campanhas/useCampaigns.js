import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { format, parseISO, startOfDay } from 'date-fns'
import { 
  ListarCampanhas, 
  DeletarCampanha, 
  CancelarCampanha, 
  IniciarCampanha 
} from '../service/campanhas'

export function useCampanhas() {
  const $q = useQuasar()
  const router = useRouter()

  // Estado
  const loading = ref(false)
  const campanhas = ref([])
  const campanhaEdicao = ref({})
  const modalCampanha = ref(false)

  // Status das campanhas
  const status = {
    pending: 'Pendente',
    scheduled: 'Programada',
    processing: 'Processando',
    canceled: 'Cancelada',
    finished: 'Finalizada'
  }

  // Colunas da tabela
  const columns = [
    { name: 'id', label: '#', field: 'id', align: 'left' },
    { name: 'name', label: 'Campanha', field: 'name', align: 'left' },
    { 
      name: 'start', 
      label: 'Início', 
      field: 'start', 
      align: 'center', 
      format: (v) => format(parseISO(v), 'dd/MM/yyyy HH:mm') 
    },
    {
      name: 'status',
      label: 'Status',
      field: 'status',
      align: 'center',
      format: (v) => status[v] || ''
    },
    { name: 'contactsCount', label: 'Qtd. Contatos', field: 'contactsCount', align: 'center' },
    { name: 'pendentesEnvio', label: 'À Enviar', field: 'pendentesEnvio', align: 'center' },
    { name: 'pendentesEntrega', label: 'À Entregar', field: 'pendentesEntrega', align: 'center' },
    { name: 'recebidas', label: 'Recebidas', field: 'recebidas', align: 'center' },
    { name: 'lidas', label: 'Lidas', field: 'lidas', align: 'center' },
    { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' }
  ]

  // Paginação
  const pagination = ref({
    rowsPerPage: 40,
    rowsNumber: 0,
    lastIndex: 0
  })

  // Métodos
  const listarCampanhas = async () => {
    try {
      loading.value = true
      const { data } = await ListarCampanhas()
      campanhas.value = data
    } catch (err) {
      console.error(err)
      $q.notify({
        type: 'negative',
        message: 'Erro ao listar campanhas'
      })
    } finally {
      loading.value = false
    }
  }

  const isValidDate = (v) => {
    return startOfDay(new Date(parseISO(v))).getTime() >= startOfDay(new Date()).getTime()
  }

  const editarCampanha = (campanha) => {
    if (campanha.status !== 'pending' && campanha.status !== 'canceled') {
      $q.notify({
        type: 'negative',
        message: 'Só é permitido editar campanhas que estejam pendentes ou canceladas.'
      })
      return
    }

    campanhaEdicao.value = {
      ...campanha,
      start: campanha.start,
      end: campanha.start
    }
    modalCampanha.value = true
  }

  const deletarCampanha = (campanha) => {
    if (campanha.status !== 'pending' && campanha.status !== 'canceled' && campanha.contactsCount) {
      $q.notify({
        type: 'negative',
        message: 'Só é permitido deletar campanhas que estejam pendentes ou canceladas e não possuam contatos vinculados.'
      })
      return
    }

    $q.dialog({
      title: 'Atenção!!',
      message: `Deseja realmente deletar a Campanha "${campanha.tag}"?`,
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
        loading.value = true
        await DeletarCampanha(campanha)
        campanhas.value = campanhas.value.filter(f => f.id !== campanha.id)
        $q.notify({
          type: 'positive',
          message: `Campanha ${campanha.tag} deletada!`
        })
      } catch (err) {
        console.error(err)
        $q.notify({
          type: 'negative',
          message: 'Erro ao deletar campanha'
        })
      } finally {
        loading.value = false
      }
    })
  }

  const contatosCampanha = (campanha) => {
    router.push({
      name: 'contatos-campanha',
      params: {
        campanhaId: campanha.id,
        campanha
      }
    })
  }

  const cancelarCampanha = (campanha) => {
    $q.dialog({
      title: 'Atenção!!',
      message: `Deseja realmente cancelar a Campanha "${campanha.name}"?`,
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
        await CancelarCampanha(campanha.id)
        await listarCampanhas()
        $q.notify({
          type: 'positive',
          message: 'Campanha cancelada.'
        })
      } catch (err) {
        console.error(err)
        $q.notify({
          type: 'negative',
          message: 'Não foi possível cancelar a campanha.'
        })
      }
    })
  }

  const iniciarCampanha = async (campanha) => {
    if (!isValidDate(campanha.start)) {
      $q.notify({
        type: 'negative',
        message: 'Não é possível programar campanha com data menor que a atual'
      })
      return
    }

    if (campanha.contactsCount === 0) {
      $q.notify({
        type: 'negative',
        message: 'Necessário ter contatos vinculados para programar a campanha.'
      })
      return
    }

    if (campanha.status !== 'pending' && campanha.status !== 'canceled') {
      $q.notify({
        type: 'negative',
        message: 'Só é permitido programar campanhas que estejam pendentes ou canceladas.'
      })
      return
    }

    try {
      await IniciarCampanha(campanha.id)
      await listarCampanhas()
      $q.notify({
        type: 'positive',
        message: 'Campanha iniciada.'
      })
    } catch (err) {
      console.error(err)
      $q.notify({
        type: 'negative',
        message: 'Não foi possível iniciar a campanha.'
      })
    }
  }

  return {
    // Estado
    loading,
    campanhas,
    campanhaEdicao,
    modalCampanha,
    columns,
    pagination,
    status,

    // Métodos
    listarCampanhas,
    editarCampanha,
    deletarCampanha,
    contatosCampanha,
    cancelarCampanha,
    iniciarCampanha
  }
}
