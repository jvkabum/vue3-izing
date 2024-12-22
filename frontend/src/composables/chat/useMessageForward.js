import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

/**
 * Composable para gerenciar encaminhamento de mensagens
 * @returns {Object} Objeto contendo estados e métodos do encaminhamento
 */
export function useMessageForward() {
  const $q = useQuasar()
  const selectRef = ref(null)

  // Constantes
  const MAX_MESSAGES = 10

  /**
   * Valida a quantidade de mensagens selecionadas
   * @param {Array} messages - Mensagens selecionadas
   * @returns {boolean} Se a quantidade é válida
   */
  const validateMessageCount = (messages) => {
    if (!Array.isArray(messages)) return false
    if (messages.length > MAX_MESSAGES) {
      $q.notify({
        type: 'negative',
        message: `Máximo de ${MAX_MESSAGES} mensagens permitido`,
        position: 'top'
      })
      return false
    }
    return true
  }

  /**
   * Formata o texto de contagem
   * @param {number} count - Quantidade de mensagens
   * @returns {string} Texto formatado
   */
  const getCountText = (count) => {
    return `${count} de ${MAX_MESSAGES} ${count === 1 ? 'mensagem' : 'mensagens'}`
  }

  /**
   * Filtra contatos baseado na busca
   * @param {string} val - Texto de busca
   * @param {Function} update - Função de atualização
   * @param {Function} abort - Função para abortar
   */
  const filterContacts = async (val, update, abort) => {
    if (val.length < 2) {
      abort()
      return
    }

    update(() => {
      const needle = val.toLowerCase()
      return contacts.value.filter(v => 
        v.name?.toLowerCase().indexOf(needle) > -1 ||
        v.number?.toLowerCase().indexOf(needle) > -1
      )
    })
  }

  /**
   * Valida o contato selecionado
   * @param {Object} contact - Contato selecionado
   * @returns {boolean} Se o contato é válido
   */
  const validateContact = (contact) => {
    if (!contact?.id) {
      $q.notify({
        type: 'warning',
        message: 'Selecione um contato para encaminhar',
        position: 'top'
      })
      return false
    }
    return true
  }

  /**
   * Foca no campo de seleção
   */
  const focusSelect = () => {
    selectRef.value?.focus()
  }

  return {
    selectRef,
    MAX_MESSAGES,
    validateMessageCount,
    getCountText,
    filterContacts,
    validateContact,
    focusSelect
  }
}
