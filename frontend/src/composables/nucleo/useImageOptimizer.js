import { ref } from 'vue'
import imageCompression from 'browser-image-compression'

export function useImageOptimizer() {
  const loading = ref(false)
  const error = ref(null)

  const optimizeImage = async (file, options = {}) => {
    const {
      maxSizeMB = 1,
      maxWidthOrHeight = 1920,
      useWebWorker = true
    } = options

    loading.value = true
    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB,
        maxWidthOrHeight,
        useWebWorker
      })

      return compressedFile
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createThumbnail = async (file, size = 200) => {
    loading.value = true
    try {
      return await optimizeImage(file, {
        maxSizeMB: 0.1,
        maxWidthOrHeight: size
      })
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
    optimizeImage,
    createThumbnail
  }
} 