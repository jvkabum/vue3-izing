import { useQuasar } from 'quasar'
import { ref, computed } from 'vue'
import { useSocket } from './useSocket'

export function useNotification() {
  // Composables
  const $q = useQuasar()
  const { socket } = useSocket()

  // Estado
  const notifications = ref([])
  const pendingNotifications = ref([])
  const soundEnabled = ref(localStorage.getItem('notificationSound') !== 'disabled')
  const desktopEnabled = ref(Notification.permission === 'granted')

  // Audio
  const notificationSound = new Audio('/notification.mp3')
  notificationSound.volume = 0.5

  // Computed
  const unreadCount = computed(() => 
    notifications.value.filter(n => !n.read).length
  )

  const pendingCount = computed(() => 
    pendingNotifications.value.length
  )

  const totalCount = computed(() => 
    unreadCount.value + pendingCount.value
  )

  // Métodos
  const notify = ({ 
    message, 
    type = 'info',
    position = 'top',
    timeout = 5000,
    actions = [],
    ...opts 
  }) => {
    return $q.notify({
      message,
      type,
      position,
      timeout,
      actions: [
        ...actions,
        { icon: 'close', color: 'white', round: true }
      ],
      ...opts
    })
  }

  const notifySuccess = (message, opts = {}) => {
    return notify({
      message,
      type: 'positive',
      ...opts
    })
  }

  const notifyError = (message, error = null, opts = {}) => {
    console.error('Erro:', error)
    
    return notify({
      message: message || 'Ocorreu um erro inesperado',
      type: 'negative',
      timeout: 0,
      ...opts
    })
  }

  const notifyWarning = (message, opts = {}) => {
    return notify({
      message,
      type: 'warning',
      ...opts
    })
  }

  const notifyInfo = (message, opts = {}) => {
    return notify({
      message,
      type: 'info',
      ...opts
    })
  }

  const showDesktopNotification = ({
    title,
    body,
    icon = '/logo.png',
    tag,
    onClick = null
  }) => {
    if (!desktopEnabled.value) return false

    try {
      const notification = new Notification(title, {
        body,
        icon,
        tag,
        renotify: true
      })

      if (onClick) {
        notification.onclick = onClick
      }

      return true
    } catch (err) {
      console.error('Erro ao mostrar notificação desktop:', err)
      return false
    }
  }

  const playSound = () => {
    if (!soundEnabled.value) return

    try {
      notificationSound.currentTime = 0
      notificationSound.play()
    } catch (err) {
      console.error('Erro ao tocar som:', err)
    }
  }

  const toggleSound = () => {
    soundEnabled.value = !soundEnabled.value
    localStorage.setItem('notificationSound', 
      soundEnabled.value ? 'enabled' : 'disabled'
    )
  }

  const requestDesktopPermission = async () => {
    if (!('Notification' in window)) {
      notifyWarning('Seu navegador não suporta notificações desktop')
      return false
    }

    if (Notification.permission === 'granted') {
      desktopEnabled.value = true
      return true
    }

    if (Notification.permission === 'denied') {
      notifyWarning('Permissão de notificações negada. Verifique as configurações do navegador.')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      desktopEnabled.value = permission === 'granted'
      return desktopEnabled.value
    } catch (err) {
      console.error('Erro ao solicitar permissão:', err)
      return false
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
        await api.put(`/notifications/${notificationId}/read`)
      }
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all')
      notifications.value.forEach(n => n.read = true)
    } catch (err) {
      console.error('Erro ao marcar todas notificações como lidas:', err)
    }
  }

  const removeNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`)
      notifications.value = notifications.value.filter(n => n.id !== notificationId)
    } catch (err) {
      console.error('Erro ao remover notificação:', err)
    }
  }

  // Socket handlers
  const handleNewNotification = (data) => {
    notifications.value.unshift(data)
    
    if (soundEnabled.value) {
      playSound()
    }

    if (desktopEnabled.value && !document.hasFocus()) {
      showDesktopNotification({
        title: data.title,
        body: data.message,
        tag: data.id,
        onClick: () => {
          window.focus()
          if (data.link) {
            router.push(data.link)
          }
        }
      })
    }
  }

  const handleNotificationUpdate = (data) => {
    const index = notifications.value.findIndex(n => n.id === data.id)
    if (index !== -1) {
      notifications.value[index] = data
    }
  }

  const handleNotificationDelete = (notificationId) => {
    notifications.value = notifications.value.filter(n => n.id !== notificationId)
  }

  // Socket listeners
  const setupSocketListeners = () => {
    socket.value?.on('notification', handleNewNotification)
    socket.value?.on('notificationUpdate', handleNotificationUpdate)
    socket.value?.on('notificationDelete', handleNotificationDelete)
  }

  const removeSocketListeners = () => {
    socket.value?.off('notification', handleNewNotification)
    socket.value?.off('notificationUpdate', handleNotificationUpdate)
    socket.value?.off('notificationDelete', handleNotificationDelete)
  }

  // Lifecycle
  onMounted(() => {
    setupSocketListeners()
    requestDesktopPermission()
  })

  onUnmounted(() => {
    removeSocketListeners()
  })

  return {
    // Estado
    notifications,
    pendingNotifications,
    soundEnabled,
    desktopEnabled,

    // Computed
    unreadCount,
    pendingCount,
    totalCount,

    // Métodos
    notify,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    showDesktopNotification,
    playSound,
    toggleSound,
    requestDesktopPermission,
    markAsRead,
    markAllAsRead,
    removeNotification
  }
}
