import { useQuasar } from 'quasar'

export function useApiNotification() {
  const $q = useQuasar()

  const notifySuccess = message => $q.notify({
    type: 'positive',
    message
  })

  const notifyError = message => $q.notify({
    type: 'negative',
    message
  })

  const notifyTokenCopied = () => notifySuccess('Token copiado!')
  const notifyTokenCopyError = () => notifyError('Erro ao copiar token')
  const notifyApiCreated = () => notifySuccess('API criada com sucesso!')
  const notifyApiUpdated = () => notifySuccess('API atualizada com sucesso!')
  const notifyApiDeleted = apiName => notifySuccess(`${apiName} deletada!`)
  const notifyApiError = () => notifyError('Erro ao salvar API')
  const notifyTokenUpdated = () => notifySuccess('Token atualizado!')
  const notifyTokenError = () => notifyError('Não foi possível atualizar o token')
  const notifyDeleteError = apiName => notifyError(`Não foi possível deletar ${apiName}`)

  return {
    notifySuccess,
    notifyError,
    notifyTokenCopied,
    notifyTokenCopyError,
    notifyApiCreated,
    notifyApiUpdated,
    notifyApiDeleted,
    notifyApiError,
    notifyTokenUpdated,
    notifyTokenError,
    notifyDeleteError
  }
}
