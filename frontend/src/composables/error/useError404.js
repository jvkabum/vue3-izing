import { useRouter } from 'vue-router'

/**
 * Composable para gerenciar página de erro 404
 * @returns {Object} Objeto contendo métodos de navegação
 */
export function useError404() {
  const router = useRouter()

  /**
   * Volta para a página anterior
   */
  const goBack = () => {
    router.go(-1)
  }

  /**
   * Vai para a página inicial
   */
  const goHome = () => {
    router.push('/')
  }

  return {
    goBack,
    goHome
  }
}
