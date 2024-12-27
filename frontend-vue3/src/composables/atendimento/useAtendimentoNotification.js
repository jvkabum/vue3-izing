import { useQuasar } from 'quasar'

export function useAtendimentoNotification() {
  const $q = useQuasar()

  const notifySuccess = msg => $q.notify({
    type: 'positive',
    message: msg,
    position: 'top',
    progress: true,
    actions: [{
      icon: 'close',
      round: true,
      color: 'white'
    }]
  })

  const notifyError = (msg, caption) => $q.notify({
    type: 'negative',
    message: msg,
    caption,
    position: 'top'
  })

  const notifyWarning = msg => $q.notify({
    type: 'warning',
    message: msg,
    position: 'top'
  })

  const notifyTransferSuccess = () => notifySuccess('Ticket transferido com sucesso')

  const notifyTransferError = () => notifyError('Erro ao transferir ticket')

  const notifyQueueListError = () => notifyError('Erro ao listar filas')

  const notifyQueueRequired = () => notifyWarning('Selecione uma fila')

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyTransferSuccess,
    notifyTransferError,
    notifyQueueListError,
    notifyQueueRequired
  }
}
