import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useSound } from '@/composables/audio/useSound'

export function useNotification() {
  const $q = useQuasar()
  const { playNotificationSound } = useSound()

  // Estado
  const permissao = ref(null)
  const notificacoesAtivas = ref(false)
  const notificacoes = ref([])
  const configuracoes = ref({
    som: true,
    desktop: true,
    posicao: 'top-right',
    duracao: 5000,
    maxNotificacoes: 5
  })

  // Métodos
  const notify = ({ 
    message, 
    type = 'info', 
    position = 'top',
    timeout = 5000,
    actions = [],
    sound = true 
  }) => {
    // Toca som de notificação se habilitado
    if (sound && configuracoes.value.som) {
      playNotificationSound()
    }

    // Exibe notificação do Quasar
    $q.notify({
      message,
      type,
      position,
      timeout,
      actions: [
        ...actions,
        { label: 'Fechar', color: 'white', handler: () => {} }
      ]
    })

    // Exibe notificação desktop se habilitado
    if (configuracoes.value.desktop && permissao.value === 'granted') {
      new Notification('Izing', {
        body: message,
        icon: '/favicon.ico'
      })
    }

    // Adiciona ao histórico de notificações
    notificacoes.value.unshift({
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    })

    // Mantém apenas as últimas N notificações
    if (notificacoes.value.length > configuracoes.value.maxNotificacoes) {
      notificacoes.value = notificacoes.value.slice(0, configuracoes.value.maxNotificacoes)
    }
  }

  const solicitarPermissao = async () => {
    if (!('Notification' in window)) {
      permissao.value = 'unsupported'
      return false
    }

    if (Notification.permission === 'granted') {
      permissao.value = 'granted'
      return true
    }

    try {
      const result = await Notification.requestPermission()
      permissao.value = result
      return result === 'granted'
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error)
      return false
    }
  }

  const ativarNotificacoes = async () => {
    if (await solicitarPermissao()) {
      notificacoesAtivas.value = true
      return true
    }
    return false
  }

  const desativarNotificacoes = () => {
    notificacoesAtivas.value = false
  }

  const limparNotificacoes = () => {
    notificacoes.value = []
  }

  const atualizarConfiguracoes = (novasConfiguracoes) => {
    configuracoes.value = {
      ...configuracoes.value,
      ...novasConfiguracoes
    }
  }

  // Lifecycle hooks
  onMounted(async () => {
    // Verifica permissão atual
    if ('Notification' in window) {
      permissao.value = Notification.permission
      notificacoesAtivas.value = Notification.permission === 'granted'
    }

    // Carrega configurações salvas
    const configSalvas = localStorage.getItem('notificacoes-config')
    if (configSalvas) {
      configuracoes.value = JSON.parse(configSalvas)
    }
  })

  onUnmounted(() => {
    // Salva configurações
    localStorage.setItem('notificacoes-config', JSON.stringify(configuracoes.value))
  })

  return {
    // Estado
    permissao,
    notificacoesAtivas,
    notificacoes,
    configuracoes,

    // Métodos
    notify,
    solicitarPermissao,
    ativarNotificacoes,
    desativarNotificacoes,
    limparNotificacoes,
    atualizarConfiguracoes
  }
}
