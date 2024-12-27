import { ref } from 'vue'
import { api } from '@/services/api'

export function useInvoices() {
  const invoices = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchInvoices = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/invoices')
      invoices.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const downloadInvoice = async (invoiceId) => {
    loading.value = true
    try {
      const { data } = await api.get(`/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `fatura_${invoiceId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    downloadInvoice
  }
} 