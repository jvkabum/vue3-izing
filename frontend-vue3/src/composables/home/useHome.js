import { ref, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'

/**
 * Composable para gerenciar página inicial
 * @returns {Object} Objeto contendo estados e métodos da página inicial
 */
export function useHome() {
  const userStore = useUserStore()

  // Estado
  const welcomeMessage = ref('Bem-vindo ao Izing Flow!')
  const userName = ref('')
  const loading = ref(true)

  /**
   * Carrega dados do usuário
   */
  const loadUserData = () => {
    try {
      const user = userStore.user
      if (user?.name) {
        userName.value = user.name
        welcomeMessage.value = `Bem-vindo ao Izing Flow, ${user.name}!`
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
    } finally {
      loading.value = false
    }
  }

  // Lifecycle
  onMounted(() => {
    loadUserData()
  })

  return {
    // Estado
    welcomeMessage,
    userName,
    loading,

    // Métodos
    loadUserData
  }
}
