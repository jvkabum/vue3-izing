import { ref, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'src/stores'
import { io } from 'socket.io-client'

export function useSocket() {
  const $q = useQuasar()
  const store = useStore()
  const socket = ref(null)

  const connectSocket = () => {
    socket.value = io(process.env.VUE_APP_SOCKET_URL)

    socket.value.on('connect', () => {
      console.log('Socket conectado:', socket.value.id)
    })

    socket.value.on('disconnect', () => {
      console.log('Socket desconectado')
    })

    socket.value.on('error', (error) => {
      console.error('Erro no socket:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro de conexão com o servidor',
        caption: error.message
      })
    })
  }

  const disconnectSocket = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
  }

  onUnmounted(() => {
    disconnectSocket()
  })

  return {
    socket,
    connectSocket,
    disconnectSocket
  }
}
