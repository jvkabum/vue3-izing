import { ref } from 'vue'
import { api } from '@/services/api'
import { format } from 'date-fns'

export function useContactExport() {
  const loading = ref(false)
  const error = ref(null)
  const progress = ref(0)

  const exportContacts = async (filters = {}, format = 'csv') => {
    loading.value = true
    progress.value = 0

    try {
      const { data } = await api.get(`/contacts/export/${format}`, {
        params: filters,
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          progress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      })

      const fileName = `contatos_${format(new Date(), 'dd-MM-yyyy')}.${format}`
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      return true
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
      progress.value = 0
    }
  }

  const exportSelectedContacts = async (contactIds, format = 'csv') => {
    loading.value = true
    try {
      const { data } = await api.post(`/contacts/export/${format}`, {
        contactIds
      }, {
        responseType: 'blob'
      })

      const fileName = `contatos_selecionados_${format(new Date(), 'dd-MM-yyyy')}.${format}`
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()

      return true
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    progress,
    exportContacts,
    exportSelectedContacts
  }
} 