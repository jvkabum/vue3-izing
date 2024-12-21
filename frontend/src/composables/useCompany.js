import { ref } from 'vue'
import { api } from '@/services/api'

export function useCompany() {
  const company = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchCompany = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/company')
      company.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateCompany = async (companyData) => {
    loading.value = true
    try {
      const { data } = await api.put('/company', companyData)
      company.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePlan = async (planId) => {
    loading.value = true
    try {
      const { data } = await api.put('/company/plan', { planId })
      company.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    company,
    loading,
    error,
    fetchCompany,
    updateCompany,
    updatePlan
  }
} 