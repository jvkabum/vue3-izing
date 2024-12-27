import { ref, onBeforeMount, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useUserStore } from '../../stores/user'

/**
 * Composable para gerenciar o App
 * @returns {Object} Objeto contendo estados e métodos do App
 */
export function useApp() {
  const $q = useQuasar()
  const userStore = useUserStore()

  // Estado
  const idleSecondsCounter = ref(0)
  const idleTimeout = ref(5) // seconds
  const idleCheckInterval = ref(null)

  /**
   * Configura tema escuro baseado nas preferências do usuário
   */
  const setupDarkMode = () => {
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario'))
      if (usuario?.configs?.isDark) {
        $q.dark.set(usuario.configs.isDark)
      }
    } catch (error) {
      console.error('Erro ao configurar tema:', error)
    }
  }

  /**
   * Verifica tempo de inatividade
   */
  const checkIdleTime = () => {
    idleSecondsCounter.value++
    if (idleSecondsCounter.value >= idleTimeout.value) {
      handleIdleTimeout()
    }
  }

  /**
   * Reseta contador de inatividade
   */
  const resetIdleCounter = () => {
    idleSecondsCounter.value = 0
  }

  /**
   * Manipula timeout de inatividade
   */
  const handleIdleTimeout = () => {
    // Aqui você pode implementar a lógica desejada
    // Por exemplo: logout, mostrar alerta, etc.
    console.log('Tempo de inatividade expirado!')
  }

  /**
   * Inicia monitoramento de inatividade
   */
  const startIdleMonitoring = () => {
    // Eventos para resetar contador
    document.addEventListener('click', resetIdleCounter)
    document.addEventListener('mousemove', resetIdleCounter)
    document.addEventListener('keypress', resetIdleCounter)

    // Intervalo de checagem
    idleCheckInterval.value = window.setInterval(checkIdleTime, 1000)
  }

  /**
   * Para monitoramento de inatividade
   */
  const stopIdleMonitoring = () => {
    // Remove eventos
    document.removeEventListener('click', resetIdleCounter)
    document.removeEventListener('mousemove', resetIdleCounter)
    document.removeEventListener('keypress', resetIdleCounter)

    // Limpa intervalo
    if (idleCheckInterval.value) {
      clearInterval(idleCheckInterval.value)
    }
  }

  // Lifecycle
  onBeforeMount(() => {
    setupDarkMode()
  })

  onMounted(() => {
    // Descomentado para referência, mas mantido inativo
    // startIdleMonitoring()
  })

  onUnmounted(() => {
    stopIdleMonitoring()
  })

  return {
    // Estado
    idleSecondsCounter,
    idleTimeout,

    // Métodos
    setupDarkMode,
    startIdleMonitoring,
    stopIdleMonitoring,
    resetIdleCounter,
    checkIdleTime
  }
}
