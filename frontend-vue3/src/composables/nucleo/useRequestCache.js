import { useCache } from './useCache'
import { useLogger } from './useLogger'

export function useRequestCache() {
  const cache = useCache()
  const logger = useLogger()

  const cacheKey = (url, params = {}) => {
    return `${url}:${JSON.stringify(params)}`
  }

  const request = async (key, fetchFn, options = {}) => {
    const {
      ttl = 5 * 60 * 1000, // 5 minutos
      forceRefresh = false,
      onSuccess = null,
      onError = null
    } = options

    try {
      // Verifica cache se não forçar refresh
      if (!forceRefresh) {
        const cachedData = cache.getMemoryCache(key)
        if (cachedData) {
          logger.debug(`Cache hit: ${key}`)
          return cachedData
        }
      }

      // Busca dados
      logger.debug(`Cache miss: ${key}`)
      const data = await fetchFn()
      
      // Salva no cache
      cache.setMemoryCache(key, data, ttl)
      
      // Callback de sucesso
      if (onSuccess) onSuccess(data)
      
      return data
    } catch (err) {
      // Callback de erro
      if (onError) onError(err)
      throw err
    }
  }

  return {
    cacheKey,
    request
  }
} 