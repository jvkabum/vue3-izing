import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { DeletarEtiqueta, ListarEtiquetas } from '../../service/etiquetas'

/**
 * Composable para gerenciar etiquetas
 * @returns {Object} Objeto contendo estados e métodos das etiquetas
 */
export function useEtiquetas() {
  const $q = useQuasar()

  // Estado
  const etiquetas = ref([])
  const etiquetaEdicao = ref({})
  const modalEtiqueta = ref(false)
  const loading = ref(false)
  const pagination = ref({
    rowsPerPage: 40,
    rowsNumber: 0,
    lastIndex: 0
  })

  /**
   * Configuração das colunas da tabela
   */
  const columns = [
    { 
      name: 'id', 
      label: '#', 
      field: 'id', 
      align: 'left' 
    },
    { 
      name: 'tag', 
      label: 'Etiqueta', 
      field: 'tag', 
      align: 'left' 
    },
    { 
      name: 'color', 
      label: 'Cor', 
      field: 'color', 
      align: 'center' 
    },
    { 
      name: 'isActive', 
      label: 'Ativo', 
      field: 'isActive', 
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
   * Lista todas as etiquetas
   */
  const listarEtiquetas = async () => {
    try {
      loading.value = true
      const { data } = await ListarEtiquetas()
      etiquetas.value = data
    } catch (error) {
      console.error('Erro ao listar etiquetas:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar etiquetas',
        position: 'top'
      })
    } finally {
      loading.value = false
    }
  }

  /**
   * Adiciona uma nova etiqueta
   */
  const etiquetaCriada = (etiqueta) => {
    etiquetas.value = [...etiquetas.value, etiqueta]
  }

  /**
   * Atualiza uma etiqueta existente
   */
  const etiquetaEditada = (etiqueta) => {
    const idx = etiquetas.value.findIndex(f => f.id === etiqueta.id)
    if (idx > -1) {
      etiquetas.value[idx] = etiqueta
    }
  }

  /**
   * Prepara etiqueta para edição
   */
  const editarEtiqueta = (etiqueta) => {
    etiquetaEdicao.value = { ...etiqueta }
    modalEtiqueta.value = true
  }

  /**
   * Deleta uma etiqueta
   */
  const deletarEtiqueta = async (etiqueta) => {
    try {
      await $q.dialog({
        title: 'Atenção!!',
        message: `Deseja realmente deletar a Etiqueta "${etiqueta.tag}"?`,
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
      await DeletarEtiqueta(etiqueta)
      
      etiquetas.value = etiquetas.value.filter(f => f.id !== etiqueta.id)
      
      $q.notify({
        type: 'positive',
        message: `Etiqueta ${etiqueta.tag} deletada!`,
        position: 'top',
        timeout: 2000
      })
    } catch (error) {
      if (error) { // Ignora erro de cancelamento do diálogo
        console.error('Erro ao deletar etiqueta:', error)
        $q.notify({
          type: 'negative',
          message: 'Erro ao deletar etiqueta',
          position: 'top'
        })
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Prepara nova etiqueta
   */
  const handleAddEtiqueta = () => {
    etiquetaEdicao.value = {}
    modalEtiqueta.value = true
  }

  return {
    // Estado
    etiquetas,
    etiquetaEdicao,
    modalEtiqueta,
    loading,
    pagination,
    columns,

    // Métodos
    listarEtiquetas,
    etiquetaCriada,
    etiquetaEditada,
    editarEtiqueta,
    deletarEtiqueta,
    handleAddEtiqueta
  }
}
