import { ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'

export function useCache() {
  const memoryCache = ref(new Map())
  const persistentCache = useStorage('app-cache', {})
  const error = ref(null)

  // Cache em memória com TTL
  const setMemoryCache = (key, value, ttl = 5 * 60 * 1000) => { // 5 min default
    try {
      memoryCache.value.set(key, {
        value,
        timestamp: Date.now(),
        ttl
      })
      return true
    } catch (err) {
      error.value = err.message
      return false
    }
  }

  const getMemoryCache = (key) => {
    try {
      const item = memoryCache.value.get(key)
      if (!item) return null

      if (Date.now() - item.timestamp > item.ttl) {
        memoryCache.value.delete(key)
        return null
      }

      return item.value
    } catch (err) {
      error.value = err.message
      return null
    }
  }

  // Cache persistente
  const setPersistentCache = (key, value) => {
    try {
      persistentCache.value[key] = {
        value,
        timestamp: Date.now()
      }
      return true
    } catch (err) {
      error.value = err.message
      return false
    }
  }

  const getPersistentCache = (key) => {
    try {
      const item = persistentCache.value[key]
      return item?.value || null
    } catch (err) {
      error.value = err.message
      return null
    }
  }

  // Cache com fallback para API
  const getCacheWithFallback = async (key, fetchFn, options = {}) => {
    const { ttl = 5 * 60 * 1000, persistent = false } = options
    
    try {
      // Tenta memória primeiro
      const memoryData = getMemoryCache(key)
      if (memoryData) return memoryData

      // Tenta persistente depois
      if (persistent) {
        const persistentData = getPersistentCache(key)
        if (persistentData) return persistentData
      }

      // Fallback para API
      const data = await fetchFn()
      
      // Salva nos caches
      setMemoryCache(key, data, ttl)
      if (persistent) {
        setPersistentCache(key, data)
      }

      return data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Limpa caches expirados periodicamente
  const clearExpiredCache = () => {
    const now = Date.now()
    
    // Limpa memória
    for (const [key, item] of memoryCache.value.entries()) {
      if (now - item.timestamp > item.ttl) {
        memoryCache.value.delete(key)
      }
    }
  }

  // Executa limpeza a cada 5 minutos
  setInterval(clearExpiredCache, 5 * 60 * 1000)

  return {
    setMemoryCache,
    getMemoryCache,
    setPersistentCache,
    getPersistentCache,
    getCacheWithFallback,
    clearExpiredCache,
    error
  }
} 