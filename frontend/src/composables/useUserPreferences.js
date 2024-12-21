import { ref, watch } from 'vue'
import { api } from '@/services/api'

export function useUserPreferences() {
  const preferences = ref(JSON.parse(localStorage.getItem('userPreferences') || '{}'))
  const loading = ref(false)
  const error = ref(null)

  // Salva preferências no localStorage quando mudam
  watch(preferences, (newPrefs) => {
    localStorage.setItem('userPreferences', JSON.stringify(newPrefs))
  }, { deep: true })

  const fetchPreferences = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/users/preferences')
      preferences.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePreferences = async (prefsData) => {
    loading.value = true
    try {
      const { data } = await api.put('/users/preferences', prefsData)
      preferences.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const resetPreferences = async () => {
    loading.value = true
    try {
      const { data } = await api.post('/users/preferences/reset')
      preferences.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getPreference = (key, defaultValue = null) => {
    return preferences.value[key] ?? defaultValue
  }

  const setPreference = async (key, value) => {
    const newPrefs = {
      ...preferences.value,
      [key]: value
    }
    return await updatePreferences(newPrefs)
  }

  return {
    preferences,
    loading,
    error,
    fetchPreferences,
    updatePreferences,
    resetPreferences,
    getPreference,
    setPreference
  }
} 