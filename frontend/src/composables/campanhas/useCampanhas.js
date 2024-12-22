import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useCampanhasStore } from '../../stores'

/**
 * Composable para gerenciar campanhas
 * @returns {Object} Objeto contendo estados e métodos das campanhas
 */
export function useCampanhas() {
  const $q = useQuasar()
  const campanhasStore = useCampanhasStore()

  // Estado
  const loading = ref(false)
  const campanhas = ref([])
  const campanhaEdicao = ref({})
  const modalCampanha = ref(false)

  /**
   * Configuração das colunas da tabela
   */
  const columns = [
    {
      name: 'name',
      required: true,
      label: 'Nome',
      align: 'left',
      field: row => row.name,
      sortable: true
    },
    {
      name: 'color',
      align: 'center',
      label: 'Cor',
      field: 'color'
    },
    {
      name: 'status',
      align: 'center',
      label: 'Status',
      field: 'status'
    },
    {
      name: 'isActive',
      align: 'center',
      label: 'Ativo',
      field: 'isActive'
    },
    {
      name: 'acoes',
      align: 'center',
      label: 'Ações',
      field: 'acoes'
    }
  ]

  /**
   * Configuração da paginação
   */
  const pagination = {
    rowsPerPage: 0
  }

  /**
   * Lista todas as campanhas
   */
  const listarCampanhas = async () => {
    try {
      loading.value = true
      campanhas.value = await campanhasStore.listarCampanhas()
    } catch (error) {
      console.error('Erro ao listar campanhas:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar campanhas',
        position: 'top'
      })
    } finally {
      loading.value = false
    }
  }

  /**
   * Edita uma campanha
   * @param {Object} campanha - Campanha a ser editada
   */
  const editarCampanha = (campanha) => {
    campanhaEdicao.value = { ...campanha }
    modalCampanha.value = true
  }

  /**
   * Deleta uma campanha
   * @param {Object} campanha - Campanha a ser deletada
   */
  const deletarCampanha = async (campanha) => {
    try {
      await $q.dialog({
        title: 'Confirmar',
        message: 'Deseja realmente excluir esta campanha?',
        cancel: true,
        persistent: true
      })

      loading.value = true
      await campanhasStore.deletarCampanha(campanha.id)
      
      $q.notify({
        type: 'positive',
        message: 'Campanha excluída com sucesso',
        position: 'top'
      })

      await listarCampanhas()
    } catch (error) {
      if (error) { // Ignora erro de cancelamento do diálogo
        console.error('Erro ao deletar campanha:', error)
        $q.notify({
          type: 'negative',
          message: 'Erro ao excluir campanha',
          position: 'top'
        })
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Abre lista de contatos da campanha
   * @param {Object} campanha - Campanha selecionada
   */
  const contatosCampanha = (campanha) => {
    // Implementar navegação para lista de contatos
  }

  /**
   * Cancela uma campanha
   * @param {Object} campanha - Campanha a ser cancelada
   */
  const cancelarCampanha = async (campanha) => {
    try {
      await $q.dialog({
        title: 'Confirmar',
        message: 'Deseja realmente cancelar esta campanha?',
        cancel: true,
        persistent: true
      })

      loading.value = true
      await campanhasStore.cancelarCampanha(campanha.id)
      
      $q.notify({
        type: 'positive',
        message: 'Campanha cancelada com sucesso',
        position: 'top'
      })

      await listarCampanhas()
    } catch (error) {
      if (error) {
        console.error('Erro ao cancelar campanha:', error)
        $q.notify({
          type: 'negative',
          message: 'Erro ao cancelar campanha',
          position: 'top'
        })
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Inicia uma campanha
   * @param {Object} campanha - Campanha a ser iniciada
   */
  const iniciarCampanha = async (campanha) => {
    try {
      loading.value = true
      await campanhasStore.iniciarCampanha(campanha.id)
      
      $q.notify({
        type: 'positive',
        message: 'Campanha iniciada com sucesso',
        position: 'top'
      })

      await listarCampanhas()
    } catch (error) {
      console.error('Erro ao iniciar campanha:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao iniciar campanha',
        position: 'top'
      })
    } finally {
      loading.value = false
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

    // Métodos
    listarCampanhas,
    editarCampanha,
    deletarCampanha,
    contatosCampanha,
    cancelarCampanha,
    iniciarCampanha
  }
}
