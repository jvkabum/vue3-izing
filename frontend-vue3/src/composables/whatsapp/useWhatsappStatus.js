import { ref, computed, watch } from 'vue'
import { useWhatsappStore } from '../stores/whatsapp'

export function useWhatsappStatus() {
  const store = useWhatsappStore()
  const idWbotVisible = ref(0)
  const isProblemConnect = ref(false)
  const showNotification = ref(false)

  const whatsapps = computed(() => store.whatsapps)

  const whatsappsInvalid = computed(() => 
    whatsapps.value.filter(w => w.status !== 'CONNECTED')
  )

  const isBtnSlider = computed(() => 
    whatsappsInvalid.value.length > 1
  )

  const statusConfig = {
    CONNECTED: {
      icon: 'mdi-wifi-check',
      color: 'positive',
      needsAttention: false
    },
    PAIRING: {
      icon: 'mdi-cellphone-link',
      color: 'warning',
      needsAttention: true
    },
    TIMEOUT: {
      icon: 'mdi-clock-alert',
      color: 'negative',
      needsAttention: true
    },
    DISCONNECTED: {
      icon: 'mdi-wifi-off',
      color: 'negative',
      needsAttention: true
    },
    QRCODE: {
      icon: 'mdi-qrcode-scan',
      color: 'warning',
      needsAttention: true
    },
    DESTROYED: {
      icon: 'mdi-delete-alert',
      color: 'negative',
      needsAttention: true
    },
    CONFLICT: {
      icon: 'mdi-alert-circle',
      color: 'negative',
      needsAttention: true
    }
  }

  const isInvalidConnect = (wbot) => {
    const statusAlert = [
      'PAIRING',
      'TIMEOUT',
      'DISCONNECTED',
      'QRCODE',
      'DESTROYED',
      'CONFLICT'
    ]
    return statusAlert.includes(wbot.status)
  }

  const getStatusInfo = (status) => {
    return statusConfig[status] || {
      icon: 'mdi-help-circle',
      color: 'grey',
      needsAttention: false
    }
  }

  const handleStatusChange = (wbot) => {
    const statusInfo = getStatusInfo(wbot.status)
    if (statusInfo.needsAttention) {
      showNotification.value = true
    }
  }

  watch(whatsapps, () => {
    const problem = whatsapps.value.some(w => w.status !== 'CONNECTED')
    setTimeout(() => {
      isProblemConnect.value = problem
    }, 3000)
  }, { deep: true, immediate: true })

  const nextWhatsapp = () => {
    const invalidWhatsapps = whatsappsInvalid.value
    const currentIndex = invalidWhatsapps.findIndex(w => w.id === idWbotVisible.value)
    const nextIndex = (currentIndex + 1) % invalidWhatsapps.length
    idWbotVisible.value = invalidWhatsapps[nextIndex].id
  }

  const previousWhatsapp = () => {
    const invalidWhatsapps = whatsappsInvalid.value
    const currentIndex = invalidWhatsapps.findIndex(w => w.id === idWbotVisible.value)
    const previousIndex = currentIndex === 0 ? invalidWhatsapps.length - 1 : currentIndex - 1
    idWbotVisible.value = invalidWhatsapps[previousIndex].id
  }

  return {
    idWbotVisible,
    isProblemConnect,
    showNotification,
    whatsapps,
    whatsappsInvalid,
    isBtnSlider,
    isInvalidConnect,
    getStatusInfo,
    handleStatusChange,
    nextWhatsapp,
    previousWhatsapp
  }
}
