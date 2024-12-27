import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'src/stores'
import { ListarCanais, AtualizarCanal, DeletarCanal } from 'src/service/channels'

export function useChannel() {
  const $q = useQuasar()
  const store = useStore()
  const loading = ref(false)

  const canais = ref([])
  const canalSelecionado = ref(null)
  const modalQrCode = ref(false)

  const canaisAtivos = computed(() => {
    return canais.value.filter(channel => channel.status === 'CONNECTED')
  })

  const carregarCanais = async () => {
    loading.value = true
    try {
      const { data } = await ListarCanais()
      canais.value = data
      store.commit('SET_CHANNELS', data)
    } catch (error) {
      console.error('Erro ao carregar canais:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar canais',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const atualizarCanal = async (canal) => {
    loading.value = true
    try {
      const { data } = await AtualizarCanal(canal.id, canal)
      
      const index = canais.value.findIndex(c => c.id === canal.id)
      if (index !== -1) {
        canais.value[index] = data
      }

      store.commit('UPDATE_CHANNEL', data)

      $q.notify({
        type: 'positive',
        message: 'Canal atualizado com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
    } catch (error) {
      console.error('Erro ao atualizar canal:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao atualizar canal',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const deletarCanal = async (canalId) => {
    try {
      await $q.dialog({
        title: 'Confirmar exclusão',
        message: 'Tem certeza que deseja excluir este canal?',
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          push: true
        },
        persistent: true
      })

      loading.value = true
      await DeletarCanal(canalId)
      
      canais.value = canais.value.filter(c => c.id !== canalId)
      store.commit('DELETE_CHANNEL', canalId)

      $q.notify({
        type: 'positive',
        message: 'Canal excluído com sucesso',
        progress: true,
        actions: [{ icon: 'close', round: true, color: 'white' }]
      })
    } catch (error) {
      if (error === false) return // Dialog cancelled
      
      console.error('Erro ao deletar canal:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao deletar canal',
        caption: error.message
      })
    } finally {
      loading.value = false
    }
  }

  const abrirQrCode = (canal) => {
    canalSelecionado.value = canal
    modalQrCode.value = true
  }

  const fecharQrCode = () => {
    canalSelecionado.value = null
    modalQrCode.value = false
  }

  const getChannelIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'whatsapp':
        return 'mdi-whatsapp'
      case 'instagram':
        return 'mdi-instagram'
      case 'facebook':
        return 'mdi-facebook'
      case 'telegram':
        return 'mdi-telegram'
      default:
        return 'mdi-chat'
    }
  }

  const getChannelColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'whatsapp':
        return 'green'
      case 'instagram':
        return 'purple'
      case 'facebook':
        return 'blue'
      case 'telegram':
        return 'light-blue'
      default:
        return 'grey'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONNECTED':
        return 'positive'
      case 'DISCONNECTED':
        return 'negative'
      case 'PENDING':
        return 'warning'
      default:
        return 'grey'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'CONNECTED':
        return 'Conectado'
      case 'DISCONNECTED':
        return 'Desconectado'
      case 'PENDING':
        return 'Pendente'
      default:
        return 'Desconhecido'
    }
  }

  return {
    loading,
    canais,
    canaisAtivos,
    canalSelecionado,
    modalQrCode,
    carregarCanais,
    atualizarCanal,
    deletarCanal,
    abrirQrCode,
    fecharQrCode,
    getChannelIcon,
    getChannelColor,
    getStatusColor,
    getStatusLabel
  }
}
