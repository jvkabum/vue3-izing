import { ref, computed } from 'vue'
import { api } from '../services/api'
import { useSocket } from './useSocket'
import { useNotification } from './useNotification'

export function useNotifications() {
  // Estado
  const notifications = ref([])
  const pendingNotifications = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Composables
  const { socket } = useSocket()
  const { notify } = useNotification()

  // Computed
  const unreadCount = computed(() => 
    notifications.value.filter(n => !n.read).length
  )

  const pendingCount = computed(() => 
    pendingNotifications.value.length
  )

  // Métodos
  const fetchNotifications = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/notifications')
      notifications.value = data
      return data
    } catch (err) {
      error.value = err.message
      notify({
        type: 'negative',
        message: 'Erro ao buscar notificações',
        position: 'top'
      })
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
      notify({
        type: 'negative',
        message: 'Erro ao buscar notificações pendentes',
        position: 'top'
      })
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
      notify({
        type: 'negative',
        message: 'Erro ao marcar notificação como lida',
        position: 'top'
      })
      throw err
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all')
      notifications.value.forEach(n => n.read = true)
    } catch (err) {
      error.value = err.message
      notify({
        type: 'negative',
        message: 'Erro ao marcar todas notificações como lidas',
        position: 'top'
      })
      throw err
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`)
      notifications.value = notifications.value.filter(n => n.id !== notificationId)
    } catch (err) {
      error.value = err.message
      notify({
        type: 'negative',
        message: 'Erro ao excluir notificação',
        position: 'top'
      })
      throw err
    }
  }

  const updateNotifications = (newNotifications) => {
    notifications.value = newNotifications
  }

  const updatePendingNotifications = (newPendingNotifications) => {
    pendingNotifications.value = newPendingNotifications
  }

  // Socket listeners
  socket.value?.on('notification', (data) => {
    notifications.value.unshift(data)
  })

  socket.value?.on('pendingNotification', (data) => {
    pendingNotifications.value.unshift(data)
  })

  return {
    // Estado
    notifications,
    pendingNotifications,
    loading,
    error,

    // Computed
    unreadCount,
    pendingCount,

    // Métodos
    fetchNotifications,
    fetchPendingNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateNotifications,
    updatePendingNotifications
  }
}
