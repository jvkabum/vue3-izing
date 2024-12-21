import { useQuasar } from 'quasar'

export function useCache() {
  const $q = useQuasar()

  const limparCache = () => {
    if (window.caches) {
      caches.keys().then(names => {
        for (const name of names) caches.delete(name)
      })
    }
    localStorage.clear()
    sessionStorage.clear()
    $q.notify('Cache do navegador limpo.')
  }

  return {
    limparCache
  }
}
