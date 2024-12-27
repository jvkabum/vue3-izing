import { ref, watch } from 'vue'
import { useSocket } from './useSocket'
import { api } from '@/services/api'

export function useQrCode() {
  const qrCode = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const status = ref('pending')

  const { socket } = useSocket()

  const generateQrCode = async (whatsappId) => {
    loading.value = true
    try {
      const { data } = await api.post(`/whatsapp/${whatsappId}/qrcode`)
      qrCode.value = data.qrcode
      status.value = 'generated'
      return data
    } catch (err) {
      error.value = err.message
      status.value = 'error'
      throw err
    } finally {
      loading.value = false
    }
  }

  const resetQrCode = () => {
    qrCode.value = null
    status.value = 'pending'
    error.value = null
  }

  // Socket listeners
  watch(() => socket.value, (socket) => {
    if (!socket) return

    socket.on('qrcode', (data) => {
      qrCode.value = data.qrcode
      status.value = 'generated'
    })

    socket.on('qrcode:success', () => {
      status.value = 'success'
      qrCode.value = null
    })

    socket.on('qrcode:error', (err) => {
      error.value = err.message
      status.value = 'error'
    })
  })

  return {
    qrCode,
    loading,
    error,
    status,
    generateQrCode,
    resetQrCode
  }
} 