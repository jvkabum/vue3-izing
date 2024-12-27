import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { 
  MostrarHorariosAtendiemento, 
  AtualizarHorariosAtendiemento, 
  AtualizarMensagemHorariosAtendiemento 
} from '../../service/empresas'

/**
 * Composable para gerenciar horário de atendimento
 * @returns {Object} Objeto contendo estados e métodos do horário de atendimento
 */
export function useHorarioAtendimento() {
  const $q = useQuasar()

  // Estado
  const messageBusinessHours = ref(null)
  const inputEnvioMensagem = ref(null)

  // Tipos de horário
  const optType = [
    { value: 'O', label: 'Aberto' },
    { value: 'C', label: 'Fechado' },
    { value: 'H', label: 'Horário' }
  ]

  // Variáveis disponíveis
  const variaveis = [
    { label: 'Nome', value: '{{name}}' },
    { label: 'Saudação', value: '{{greeting}}' }
  ]

  // Horários padrão
  const businessHours = ref([
    { day: 0, label: 'Domingo', type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
    { day: 1, label: 'Segunda-Feira', type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
    { day: 2, label: 'Terça-Feira', type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
    { day: 3, label: 'Quarta-Feira', type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
    { day: 4, label: 'Quinta-Feira', type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
    { day: 5, label: 'Sexta-Feira', type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' },
    { day: 6, label: 'Sábado', type: 'O', hr1: '08:00', hr2: '12:00', hr3: '14:00', hr4: '18:00' }
  ])

  /**
   * Lista horários de atendimento
   */
  const listarHorariosAtendimento = async () => {
    try {
      const { data } = await MostrarHorariosAtendiemento()
      businessHours.value = data.businessHours
      messageBusinessHours.value = data.messageBusinessHours
    } catch (error) {
      console.error('Erro ao listar horários:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar horários',
        position: 'top'
      })
    }
  }

  /**
   * Salva horários de atendimento
   */
  const salvarHorariosAtendimento = async () => {
    try {
      const { data } = await AtualizarHorariosAtendiemento(businessHours.value)
      businessHours.value = data.businessHours

      $q.notify({
        type: 'positive',
        message: 'Horários salvos com sucesso!',
        position: 'top'
      })
    } catch (error) {
      console.error('Erro ao salvar horários:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao salvar horários',
        position: 'top'
      })
    }
  }

  /**
   * Salva mensagem de ausência
   */
  const salvarMensagemAusencia = async () => {
    try {
      const { data } = await AtualizarMensagemHorariosAtendiemento({
        messageBusinessHours: messageBusinessHours.value
      })
      messageBusinessHours.value = data.messageBusinessHours

      $q.notify({
        type: 'positive',
        message: 'Mensagem salva com sucesso!',
        position: 'top'
      })
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao salvar mensagem',
        position: 'top'
      })
    }
  }

  /**
   * Insere variável na mensagem
   */
  const onInsertSelectVariable = (variable) => {
    if (!variable || !inputEnvioMensagem.value) return

    const tArea = inputEnvioMensagem.value
    const startPos = tArea.selectionStart
    const endPos = tArea.selectionEnd
    const tmpStr = tArea.value

    messageBusinessHours.value = tmpStr.substring(0, startPos) + 
                                variable + 
                                tmpStr.substring(endPos, tmpStr.length)

    // Move cursor
    setTimeout(() => {
      tArea.selectionStart = tArea.selectionEnd = startPos + variable.length
    }, 10)
  }

  /**
   * Insere emoji na mensagem
   */
  const onInsertSelectEmoji = (emoji) => {
    if (!emoji.data || !inputEnvioMensagem.value) return

    const tArea = inputEnvioMensagem.value
    const startPos = tArea.selectionStart
    const endPos = tArea.selectionEnd
    const tmpStr = tArea.value

    messageBusinessHours.value = tmpStr.substring(0, startPos) + 
                                emoji.data + 
                                tmpStr.substring(endPos, tmpStr.length)

    // Move cursor
    setTimeout(() => {
      tArea.selectionStart = tArea.selectionEnd = startPos + emoji.data.length
    }, 10)
  }

  return {
    // Estado
    messageBusinessHours,
    inputEnvioMensagem,
    businessHours,
    optType,
    variaveis,

    // Métodos
    listarHorariosAtendimento,
    salvarHorariosAtendimento,
    salvarMensagemAusencia,
    onInsertSelectVariable,
    onInsertSelectEmoji
  }
}
