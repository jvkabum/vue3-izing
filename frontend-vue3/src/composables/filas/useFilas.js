import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { DeletarFila, ListarFilas } from '../../service/filas'

/**
 * Composable para gerenciar filas
 * @returns {Object} Objeto contendo estados e métodos das filas
 */
export function useFilas() {
  const $q = useQuasar()

  // Estado
  const filas = ref([])
  const filaEdicao = ref({})
  const modalFila = ref(false)
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
      name: 'queue', 
      label: 'Fila', 
      field: 'queue', 
      align: 'left' 
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
   * Lista todas as filas
   */
  const listarFilas = async () => {
    try {
      loading.value = true
      const { data } = await ListarFilas()
      filas.value = data
    } catch (error) {
      console.error('Erro ao listar filas:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar filas',
        position: 'top'
      })
    } finally {
      loading.value = false
    }
  }

  /**
   * Adiciona uma nova fila
   */
  const filaCriada = (fila) => {
    filas.value = [...filas.value, fila]
  }

  /**
   * Atualiza uma fila existente
   */
  const filaEditada = (fila) => {
    const idx = filas.value.findIndex(f => f.id === fila.id)
    if (idx > -1) {
      filas.value[idx] = fila
    }
  }

  /**
   * Prepara fila para edição
   */
  const editarFila = (fila) => {
    filaEdicao.value = { ...fila }
    modalFila.value = true
  }

  /**
   * Deleta uma fila
   */
  const deletarFila = async (fila) => {
    try {
      await $q.dialog({
        title: 'Atenção!!',
        message: `Deseja realmente deletar a Fila "${fila.queue}"?`,
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
      await DeletarFila(fila)
      
      filas.value = filas.value.filter(f => f.id !== fila.id)
      
      $q.notify({
        type: 'positive',
        message: `Fila ${fila.queue} deletada!`,
        position: 'top',
        timeout: 2000
      })
    } catch (error) {
      if (error) { // Ignora erro de cancelamento do diálogo
        console.error('Erro ao deletar fila:', error)
        $q.notify({
          type: 'negative',
          message: 'Erro ao deletar fila',
          position: 'top'
        })
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Prepara nova fila
   */
  const handleAddFila = () => {
    filaEdicao.value = {}
    modalFila.value = true
  }

  return {
    // Estado
    filas,
    filaEdicao,
    modalFila,
    loading,
    pagination,
    columns,

    // Métodos
    listarFilas,
    filaCriada,
    filaEditada,
    editarFila,
    deletarFila,
    handleAddFila
  }
}
