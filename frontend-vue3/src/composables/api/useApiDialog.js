import { useQuasar } from 'quasar'

export function useApiDialog() {
  const $q = useQuasar()

  const confirmarGerarToken = apiName => $q.dialog({
    title: 'Atenção!!',
    message: `Deseja realmente gerar novo token para "${apiName}"? Lembre que as integrações que utilizam atual irão parar de funcionar até que atualize o token onde for necessário.`,
    cancel: { label: 'Não', color: 'primary', push: true },
    ok: { label: 'Sim', color: 'negative', push: true },
    persistent: true
  })

  const confirmarDeletar = apiName => $q.dialog({
    title: 'Atenção!!',
    message: `Deseja realmente deletar "${apiName}"?`,
    cancel: { label: 'Não', color: 'primary', push: true },
    ok: { label: 'Sim', color: 'negative', push: true },
    persistent: true
  })

  return {
    confirmarGerarToken,
    confirmarDeletar
  }
}
