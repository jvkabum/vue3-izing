import { ref } from 'vue'
import { api } from '@/services/api'

export function useUpload() {
  const files = ref([])
  const loading = ref(false)
  const error = ref(null)
  const progress = ref(0)

  const maxFileSize = 15 * 1024 * 1024 // 15MB
  const maxTotalSize = 30 * 1024 * 1024 // 30MB
  const allowedTypes = [
    'image/*',
    'video/*',
    'audio/*',
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.txt',
    '.zip',
    '.rar'
  ]

  const validateFile = (file) => {
    if (file.size > maxFileSize) {
      throw new Error(`Arquivo ${file.name} excede o tamanho máximo de 15MB`)
    }

    const isValidType = allowedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''))
      }
      return file.name.toLowerCase().endsWith(type)
    })

    if (!isValidType) {
      throw new Error(`Tipo de arquivo não permitido: ${file.name}`)
    }

    return true
  }

  const validateTotalSize = (newFiles) => {
    const totalSize = [...files.value, ...newFiles].reduce((sum, file) => sum + file.size, 0)
    if (totalSize > maxTotalSize) {
      throw new Error('Tamanho total dos arquivos excede 30MB')
    }
    return true
  }

  const uploadFiles = async (endpoint, additionalData = {}) => {
    if (!files.value.length) return []

    loading.value = true
    progress.value = 0
    
    try {
      const formData = new FormData()
      
      files.value.forEach(file => {
        formData.append('files', file)
      })

      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })

      const { data } = await api.post(endpoint, formData, {
        onUploadProgress: (progressEvent) => {
          progress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      })

      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
      progress.value = 0
    }
  }

  const addFiles = async (newFiles) => {
    error.value = null
    
    try {
      // Valida cada arquivo
      newFiles.forEach(validateFile)
      
      // Valida tamanho total
      validateTotalSize(newFiles)

      // Adiciona arquivos
      files.value = [...files.value, ...newFiles]
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const removeFile = (index) => {
    files.value.splice(index, 1)
  }

  const clearFiles = () => {
    files.value = []
    error.value = null
    progress.value = 0
  }

  return {
    files,
    loading,
    error,
    progress,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    validateFile,
    validateTotalSize
  }
} 