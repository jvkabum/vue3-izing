import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { ListarMensagensRapidas, DeletarMensagemRapida } from '../../service/mensagensRapidas'

/**
 * Composable para gerenciar mensagens rápidas
 * @returns {Object} Objeto contendo estados e métodos das mensagens rápidas
 */
export function useMensagensRapidas() {
  const $q = useQuasar()

  // Estado
  const loading = ref(false)
  const mensagensRapidas = ref([])
  const modalMensagemRapida = ref(false)
  const mensagemRapidaEmEdicao = ref({})

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
      name: 'key', 
      label: 'Chave', 
      field: 'key', 
      align: 'left' 
    },
    { 
      name: 'message', 
      label: 'Mensagem', 
      field: 'message', 
      align: 'left', 
      classes: 'ellipsis', 
      style: 'max-width: 400px;' 
    },
    { 
      name: 'acoes', 
      label: 'Ações', 
      field: 'acoes', 
      align: 'center' 
    }
  ]

  /**
   * Lista todas as mensagens rápidas
   */
  const listarMensagensRapidas = async () => {
    try {
      loading.value = true
      const { data } = await ListarMensagensRapidas()
      mensagensRapidas.value = data
    } catch (error) {
      console.error('Erro ao listar mensagens:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar mensagens',
        position: 'top'
      })
    } finally {
      loading.value = false
    }
  }

  /**
   * Adiciona uma nova mensagem
   */
  const mensagemCriada = (mensagem) => {
    mensagensRapidas.value.unshift(mensagem)
  }

  /**
   * Atualiza uma mensagem existente
   */
  const mensagemEditada = (mensagem) => {
    const idx = mensagensRapidas.value.findIndex(m => m.id === mensagem.id)
    if (idx > -1) {
      mensagensRapidas.value[idx] = mensagem
    }
  }

  /**
   * Prepara mensagem para edição
   */
  const editarMensagem = (mensagem) => {
    mensagemRapidaEmEdicao.value = { ...mensagem }
    modalMensagemRapida.value = true
  }

  /**
   * Deleta uma mensagem
   */
  const deletarMensagem = async (mensagem) => {
    try {
      await $q.dialog({
        title: 'Atenção!!',
        message: `Deseja realmente deletar a mensagem de chave "${mensagem.key}"?`,
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
      await DeletarMensagemRapida(mensagem)
      
      mensagensRapidas.value = mensagensRapidas.value.filter(m => m.id !== mensagem.id)
      
      $q.notify({
        type: 'positive',
        message: 'Mensagem deletada com sucesso!',
        position: 'top',
        timeout: 2000
      })
    } catch (error) {
      if (error) { // Ignora erro de cancelamento do diálogo
        console.error('Erro ao deletar mensagem:', error)
        $q.notify({
          type: 'negative',
          message: 'Erro ao deletar mensagem',
          position: 'top'
        })
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Prepara nova mensagem
   */
  const handleAddMensagem = () => {
    mensagemRapidaEmEdicao.value = {}
    modalMensagemRapida.value = true
  }

  return {
    // Estado
    loading,
    mensagensRapidas,
    modalMensagemRapida,
    mensagemRapidaEmEdicao,
    pagination,
    columns,

    // Métodos
    listarMensagensRapidas,
    mensagemCriada,
    mensagemEditada,
    editarMensagem,
    deletarMensagem,
    handleAddMensagem
  }
}
