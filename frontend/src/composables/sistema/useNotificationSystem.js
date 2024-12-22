import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useSocket } from '../integracoes/useSocket'
import { useSound } from '../audio/useSound'
import { api } from '../../service/request'

export function useNotificationSystem() {
  // Composables
  const $q = useQuasar()
  const { socket } = useSocket()
  const { playNotificationSound } = useSound()

  // Estado
  const notifications = ref([])
  const pendingNotifications = ref([])
  const loading = ref(false)
  const error = ref(null)
  const permissao = ref(Notification.permission)
  const notificacoesAtivas = ref(Notification.permission === 'granted')
  const soundEnabled = ref(localStorage.getItem('notificationSound') !== 'disabled')
  
  // Configurações
  const configuracoes = ref({
    som: soundEnabled.value,
    desktop: notificacoesAtivas.value,
    posicao: 'top-right',
    duracao: 5000,
    maxNotificacoes: 5
  })

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

  // Métodos de Notificação UI
  const notify = ({ 
    message, 
    type = 'info',
    position = 'top',
    timeout = configuracoes.value.duracao,
    actions = [],
    sound = configuracoes.value.som,
    ...opts 
  }) => {
    // Toca som se habilitado
    if (sound && soundEnabled.value) {
      playNotificationSound()
    }

    // Notificação Quasar
    $q.notify({
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

    // Notificação Desktop
    if (configuracoes.value.desktop && notificacoesAtivas.value && !document.hasFocus()) {
      showDesktopNotification({
        title: type.charAt(0).toUpperCase() + type.slice(1),
        body: message
      })
    }
  }

  // Helpers de Notificação
  const notifySuccess = (message, opts = {}) => notify({ message, type: 'positive', ...opts })
  const notifyError = (message, error = null, opts = {}) => {
    console.error('Erro:', error)
    notify({ message: message || 'Ocorreu um erro inesperado', type: 'negative', timeout: 0, ...opts })
  }
  const notifyWarning = (message, opts = {}) => notify({ message, type: 'warning', ...opts })
  const notifyInfo = (message, opts = {}) => notify({ message, type: 'info', ...opts })

  // Métodos de Notificação Desktop
  const showDesktopNotification = ({
    title,
    body,
    icon = '/logo.png',
    tag,
    onClick = null
  }) => {
    if (!notificacoesAtivas.value) return false

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

  // Métodos de Permissão
  const solicitarPermissao = async () => {
    if (!('Notification' in window)) {
      permissao.value = 'unsupported'
      return false
    }

    try {
      const result = await Notification.requestPermission()
      permissao.value = result
      notificacoesAtivas.value = result === 'granted'
      configuracoes.value.desktop = notificacoesAtivas.value
      return result === 'granted'
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error)
      return false
    }
  }

  // Métodos de API
  const fetchNotifications = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/notifications')
      notifications.value = data
      return data
    } catch (err) {
      error.value = err.message
      notifyError('Erro ao buscar notificações')
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPendingNotifications = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/notifications/pending')
      pendingNotifications.value = data
      return data
    } catch (err) {
      error.value = err.message
      notifyError('Erro ao buscar notificações pendentes')
      throw err
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`)
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
      }
    } catch (err) {
      error.value = err.message
      notifyError('Erro ao marcar notificação como lida')
      throw err
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all')
      notifications.value.forEach(n => n.read = true)
    } catch (err) {
      error.value = err.message
      notifyError('Erro ao marcar todas notificações como lidas')
      throw err
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`)
      notifications.value = notifications.value.filter(n => n.id !== notificationId)
    } catch (err) {
      error.value = err.message
      notifyError('Erro ao excluir notificação')
      throw err
    }
  }

  // Métodos de Configuração
  const toggleSound = () => {
    soundEnabled.value = !soundEnabled.value
    configuracoes.value.som = soundEnabled.value
    localStorage.setItem('notificationSound', soundEnabled.value ? 'enabled' : 'disabled')
  }

  const atualizarConfiguracoes = (novasConfiguracoes) => {
    configuracoes.value = {
      ...configuracoes.value,
      ...novasConfiguracoes
    }
    localStorage.setItem('notificacoes-config', JSON.stringify(configuracoes.value))
  }

  // Socket handlers
  const handleNewNotification = (data) => {
    notifications.value.unshift(data)
    
    if (soundEnabled.value) {
      playNotificationSound()
    }

    if (notificacoesAtivas.value && !document.hasFocus()) {
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
    solicitarPermissao()

    // Carrega configurações salvas
    const configSalvas = localStorage.getItem('notificacoes-config')
    if (configSalvas) {
      configuracoes.value = JSON.parse(configSalvas)
    }
  })

  onUnmounted(() => {
    removeSocketListeners()
    // Salva configurações
    localStorage.setItem('notificacoes-config', JSON.stringify(configuracoes.value))
  })

  return {
    // Estado
    notifications,
    pendingNotifications,
    loading,
    error,
    permissao,
    notificacoesAtivas,
    soundEnabled,
    configuracoes,

    // Computed
    unreadCount,
    pendingCount,
    totalCount,

    // Métodos de Notificação
    notify,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    showDesktopNotification,

    // Métodos de API
    fetchNotifications,
    fetchPendingNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,

    // Métodos de Configuração
    toggleSound,
    solicitarPermissao,
    atualizarConfiguracoes
  }
}
