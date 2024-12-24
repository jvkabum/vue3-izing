import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'

/**
 * Composable para gerenciar autenticação e navegação do router
 * @returns {Object} Objeto contendo estados e métodos de autenticação do router
 */
export function useRouterAuth() {
  const $q = useQuasar()
  const router = useRouter()
  const userStore = useUserStore()

  // Estado
  const whiteListName = ref(['login'])
  const isNavigating = ref(false)

  /**
   * Verifica se rota está na whitelist
   * @param {string} routeName - Nome da rota
   * @returns {boolean} Se rota está na whitelist
   */
  const isWhitelisted = (routeName) => {
    return whiteListName.value.includes(routeName)
  }

  /**
   * Verifica se usuário está autenticado
   * @returns {boolean} Se usuário está autenticado
   */
  const isAuthenticated = () => {
    try {
      const token = JSON.parse(localStorage.getItem('token'))
      return !!token
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      return false
    }
  }

  /**
   * Redireciona para login
   */
  const redirectToLogin = () => {
    $q.notify({ 
      type: 'warning',
      message: 'Necessário realizar login', 
      position: 'top',
      timeout: 2000
    })
    router.push({ name: 'login' })
  }

  /**
   * Guarda de navegação
   */
  const navigationGuard = async (to, from, next) => {
    // Evita múltiplas navegações simultâneas
    if (isNavigating.value) {
      next(false)
      return
    }

    try {
      isNavigating.value = true

      // Verifica autenticação
      if (!isAuthenticated()) {
        // Permite acesso a rotas da whitelist
        if (isWhitelisted(to.name)) {
          next()
          return
        }

        // Permite acesso a setup com token
        if (to.query.tokenSetup) {
          next()
          return
        }

        // Redireciona para login
        if (to.fullPath !== '/login') {
          redirectToLogin()
          return
        }
      }

      // Usuário autenticado
      next()
    } catch (error) {
      console.error('Erro no guard de navegação:', error)
      next(false)
    } finally {
      isNavigating.value = false
    }
  }

  /**
   * Handler pós navegação
   */
  const afterNavigation = () => {
    // Scroll para topo
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    })

    // Reseta estado de navegação
    isNavigating.value = false
  }

  return {
    // Estado
    whiteListName,
    isNavigating,

    // Métodos
    isWhitelisted,
    isAuthenticated,
    redirectToLogin,
    navigationGuard,
    afterNavigation
  }
}
