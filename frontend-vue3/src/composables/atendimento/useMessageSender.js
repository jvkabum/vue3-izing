import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { EnviarMensagemTexto } from 'src/service/tickets'

export function useMessageSender() {
  const $q = useQuasar()
  const loading = ref(false)

  async function sendTextMessage(ticketId, message, options = {}) {
    loading.value = true
    try {
      await EnviarMensagemTexto(ticketId, message)
      return true
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao enviar mensagem',
        caption: error.message
      })
      return false
    } finally {
      loading.value = false
    }
  }

  async function sendMediaMessage(ticketId, file, options = {}) {
    loading.value = true
    try {
      const formData = new FormData()
      formData.append('medias', file, file.name)
      formData.append('body', file.name)
      formData.append('fromMe', 'true')

      if (options.scheduleDate) {
        formData.append('scheduleDate', options.scheduleDate)
      }

      await EnviarMensagemTexto(ticketId, formData)
      return true
    } catch (error) {
      console.error('Erro ao enviar mídia:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao enviar mídia',
        caption: error.message
      })
      return false
    } finally {
      loading.value = false
    }
  }

  async function sendAudioMessage(ticketId, audioBlob, filename, options = {}) {
    loading.value = true
    try {
      const formData = new FormData()
      formData.append('medias', audioBlob, filename)
      formData.append('body', filename)
      formData.append('fromMe', 'true')

      if (options.scheduleDate) {
        formData.append('scheduleDate', options.scheduleDate)
      }

      await EnviarMensagemTexto(ticketId, formData)
      return true
    } catch (error) {
      console.error('Erro ao enviar áudio:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao enviar áudio',
        caption: error.message
      })
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    sendTextMessage,
    sendMediaMessage,
    sendAudioMessage
  }
}
