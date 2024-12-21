import { ref, computed } from 'vue'
import { api } from '@/services/api'

export function useSubscription() {
  const subscription = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isActive = computed(() => subscription.value?.status === 'active')
  const isTrialing = computed(() => subscription.value?.status === 'trialing')
  const isCanceled = computed(() => subscription.value?.status === 'canceled')

  const fetchSubscription = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/subscription')
      subscription.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSubscription = async (planId) => {
    loading.value = true
    try {
      const { data } = await api.put('/subscription', { planId })
      subscription.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const cancelSubscription = async () => {
    loading.value = true
    try {
      const { data } = await api.post('/subscription/cancel')
      subscription.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    subscription,
    loading,
    error,
    isActive,
    isTrialing,
    isCanceled,
    fetchSubscription,
    updateSubscription,
    cancelSubscription
  }
} 