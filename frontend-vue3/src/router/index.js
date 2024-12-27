import { createRouter, createWebHashHistory } from 'vue-router'
import { useRouterAuth } from '../composables/router/useRouterAuth'
import routes from './routes'

/**
 * Configuração do Router
 */
const router = createRouter({
  // Histórico
  history: createWebHashHistory(process.env.VUE_ROUTER_BASE),
  
  // Comportamento de scroll
  scrollBehavior: () => ({ 
    left: 0, 
    top: 0,
    behavior: 'smooth'
  }),

  // Rotas
  routes,

  // Configurações adicionais
  strict: process.env.NODE_ENV !== 'production',
  sensitive: true,
  
  // Fallback para hash mode
  fallback: true
})

// Composables
const { navigationGuard, afterNavigation } = useRouterAuth()

// Guards
router.beforeEach(navigationGuard)
router.afterEach(afterNavigation)

// Tratamento de erros
router.onError((error) => {
  console.error('Erro de navegação:', error)
  
  // Redireciona para página de erro em caso de falha no carregamento
  if (error.type === 2 /* Navigation failure */) {
    router.push('/error')
  }
})

// Configurações de desenvolvimento
if (process.env.NODE_ENV === 'development') {
  // Log de navegação
  router.beforeEach((to, from) => {
    console.log(`Navegando de ${from.fullPath} para ${to.fullPath}`)
  })
}

export default router
