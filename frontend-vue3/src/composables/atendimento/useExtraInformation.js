import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Composable para gerenciar informações extras
 * @param {Function} emit - Função para emitir eventos
 * @returns {Object} Objeto contendo estados e métodos das informações extras
 */
export function useExtraInformation(emit) {
  const $q = useQuasar()

  // Estado
  const showAddDialog = ref(false)
  const newInfo = ref({
    label: '',
    value: ''
  })

  /**
   * Formata uma data para exibição
   * @param {string|Date} date - Data a ser formatada
   * @returns {string} Data formatada
   */
  const formatDate = (date) => {
    try {
      return format(new Date(date), 'dd/MM/yyyy HH:mm', { 
        locale: ptBR 
      })
    } catch (error) {
      console.error('Erro ao formatar data:', error)
      return date
    }
  }

  /**
   * Adiciona uma nova informação
   */
  const handleAdd = () => {
    if (!newInfo.value.value) {
      $q.notify({
        type: 'warning',
        message: 'Valor é obrigatório',
        position: 'top'
      })
      return
    }

    emit('add', { 
      ...newInfo.value,
      createdAt: new Date().toISOString()
    })
    
    // Reset form
    resetForm()
    showAddDialog.value = false

    $q.notify({
      type: 'positive',
      message: 'Informação adicionada com sucesso',
      position: 'top'
    })
  }

  /**
   * Remove uma informação
   * @param {Object} info - Informação a ser removida
   * @param {number} index - Índice da informação
   */
  const handleDelete = (info, index) => {
    $q.dialog({
      title: 'Confirmar Exclusão',
      message: 'Deseja remover esta informação?',
      cancel: {
        label: 'Cancelar',
        flat: true,
        color: 'grey-7'
      },
      ok: {
        label: 'Remover',
        flat: true,
        color: 'negative'
      },
      persistent: true
    }).onOk(() => {
      emit('delete', { info, index })
      
      $q.notify({
        type: 'positive',
        message: 'Informação removida com sucesso',
        position: 'top'
      })
    })
  }

  /**
   * Reseta o formulário
   */
  const resetForm = () => {
    newInfo.value = {
      label: '',
      value: ''
    }
  }

  /**
   * Valida o formulário
   * @returns {boolean} Se o formulário é válido
   */
  const isFormValid = computed(() => {
    return !!newInfo.value.value?.trim()
  })

  return {
    // Estado
    showAddDialog,
    newInfo,
    isFormValid,
    
    // Métodos
    formatDate,
    handleAdd,
    handleDelete,
    resetForm
  }
}
