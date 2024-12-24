import { ref } from 'vue'
import { api } from '@/services/api'

export function useContactImport() {
  const loading = ref(false)
  const error = ref(null)
  const progress = ref(0)
  const importResult = ref(null)

  const importContacts = async (file, options = {}) => {
    loading.value = true
    progress.value = 0
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('options', JSON.stringify(options))

      const { data } = await api.post('/contacts/import', formData, {
        onUploadProgress: (progressEvent) => {
          progress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      })

      importResult.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const validateFile = (file) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Formato de arquivo inválido. Use CSV.')
    }
    return true
  }

  return {
    loading,
    error,
    progress,
    importResult,
    importContacts,
    validateFile
  }
} 