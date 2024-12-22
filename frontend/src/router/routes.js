/**
 * Definição das rotas da aplicação
 */

// Layouts
import MainLayout from '../layouts/MainLayout.vue'

/**
 * Rotas principais
 */
const mainRoutes = {
  path: '/',
  component: MainLayout,
  redirect: { name: 'home' },
  children: [
    {
      path: '',
      name: 'home',
      component: () => import('../pages/dashboard/Index.vue'),
      meta: { title: 'Dashboard' }
    },
    {
      path: '/home',
      name: 'home-dashboard',
      component: () => import('../pages/dashboard/Index.vue'),
      meta: { title: 'Dashboard' }
    },
    {
      path: '/painel-atendimentos',
      name: 'painel-atendimentos',
      component: () => import('../pages/dashboard/DashTicketsFilas.vue'),
      meta: { title: 'Painel de Atendimentos' }
    },
    {
      path: '/sessoes',
      name: 'sessoes',
      component: () => import('../pages/sessaoWhatsapp/Index.vue'),
      meta: { title: 'Sessões' }
    },
    {
      path: '/contatos',
      name: 'contatos',
      component: () => import('../pages/contatos/Index.vue'),
      meta: { title: 'Contatos' }
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: () => import('../pages/usuarios/Index.vue'),
      meta: { title: 'Usuários' }
    },
    {
      path: '/auto-resposta',
      name: 'auto-resposta',
      component: () => import('../pages/fluxoAutoResposta/Index.vue'),
      meta: { title: 'Auto Resposta' }
    },
    {
      path: '/mensagens-rapidas',
      name: 'mensagens-rapidas',
      component: () => import('../pages/mensagensRapidas/Index.vue'),
      meta: { title: 'Mensagens Rápidas' }
    },
    {
      path: '/filas',
      name: 'filas',
      component: () => import('../pages/filas/Index.vue'),
      meta: { title: 'Filas' }
    },
    {
      path: '/configuracoes',
      name: 'configuracoes',
      component: () => import('../pages/configuracoes/Index.vue'),
      meta: { title: 'Configurações' }
    },
    {
      path: '/etiquetas',
      name: 'etiquetas',
      component: () => import('../pages/etiquetas/Index.vue'),
      meta: { title: 'Etiquetas' }
    },
    {
      path: '/campanhas',
      name: 'campanhas',
      component: () => import('../pages/campanhas/Index.vue'),
      meta: { title: 'Campanhas' }
    },
    {
      path: '/campanhas/:campanhaId',
      name: 'contatos-campanha',
      component: () => import('../pages/campanhas/ContatosCampanha.vue'),
      meta: { title: 'Contatos da Campanha' },
      props: true
    },
    {
      path: '/horario-atendimento',
      name: 'horarioAtendimento',
      component: () => import('../pages/horarioAtendimento/Index.vue'),
      meta: { title: 'Horário de Atendimento' }
    },
    {
      path: '/api-service',
      name: 'api-service',
      component: () => import('../pages/api/Index.vue'),
      meta: { title: 'API Service' }
    },
    {
      path: '/sessaosuper',
      name: 'sessaosuper',
      component: () => import('../pages/sessaosuper/Index.vue'),
      meta: { title: 'Sessão Super', requiresSuper: true }
    },
    {
      path: '/usuariossuper',
      name: 'usuariossuper',
      component: () => import('../pages/usuariossuper/Index.vue'),
      meta: { title: 'Usuários Super', requiresSuper: true }
    },
    {
      path: '/empresassuper',
      name: 'empresassuper',
      component: () => import('../pages/empresassuper/Index.vue'),
      meta: { title: 'Empresas Super', requiresSuper: true }
    }
  ]
}

/**
 * Rotas de chat flow
 */
const chatFlowRoutes = {
  path: '/chat-flow',
  component: () => import('../pages/chatFlow/Index.vue'),
  redirect: { name: 'chat-flow' },
  meta: { title: 'Chat Flow' },
  children: [
    {
      path: '',
      name: 'chat-flow',
      component: () => import('../pages/chatFlow/ListaChatFlow.vue'),
      meta: { title: 'Lista de Fluxos' }
    },
    {
      path: 'builder',
      name: 'chat-flow-builder',
      component: () => import('../components/ccFlowBuilder/panel.vue'),
      meta: { title: 'Construtor de Fluxo' }
    }
  ]
}

/**
 * Rotas de relatórios
 */
const reportRoutes = {
  path: '/relatorios',
  component: MainLayout,
  redirect: { name: 'relatorios' },
  meta: { title: 'Relatórios' },
  children: [
    {
      path: '',
      name: 'relatorios',
      component: () => import('../pages/relatorios/ccListaRelatorios.vue'),
      meta: { title: 'Lista de Relatórios' }
    },
    {
      path: 'estatisticas-atendimentos-usuarios',
      name: 'estatisticas-atendimentos-usuarios',
      component: () => import('../pages/relatorios/RelatorioResumoAtendimentosUsuarios.vue'),
      meta: { title: 'Estatísticas de Atendimentos' }
    },
    {
      path: 'lista-contatos',
      name: 'lista-contatos',
      component: () => import('../pages/relatorios/RelatorioContatosGeral.vue'),
      meta: { title: 'Lista de Contatos' }
    },
    {
      path: 'contatos-por-etiquetas',
      name: 'contatos-por-etiquetas',
      component: () => import('../pages/relatorios/RelatorioContatosEtiquetas.vue'),
      meta: { title: 'Contatos por Etiquetas' }
    },
    {
      path: 'contatos-por-estado',
      name: 'contatos-por-estado',
      component: () => import('../pages/relatorios/RelatorioContatosEstado.vue'),
      meta: { title: 'Contatos por Estado' }
    }
  ]
}

/**
 * Rotas de atendimento
 */
const attendanceRoutes = {
  path: '/atendimento',
  name: 'atendimento',
  component: () => import('../pages/atendimento/Index.vue'),
  meta: { title: 'Atendimento' },
  children: [
    {
      path: '/chats',
      name: 'chat-empty',
      component: () => import('../pages/atendimento/Chat.vue'),
      meta: { title: 'Chat' }
    },
    {
      path: ':ticketId',
      name: 'chat',
      component: () => import('../pages/atendimento/Chat.vue'),
      meta: { title: 'Chat' },
      props: true
    },
    {
      path: 'contatos',
      name: 'chat-contatos',
      component: () => import('../pages/contatos/Index.vue'),
      meta: { title: 'Contatos do Chat' },
      props: { isChatContact: true }
    }
  ]
}

/**
 * Rotas de autenticação
 */
const authRoutes = {
  path: '/login',
  name: 'login',
  component: () => import('../pages/Login.vue'),
  meta: { title: 'Login', public: true }
}

/**
 * Rota de erro 404
 */
const notFoundRoute = {
  path: '/:pathMatch(.*)*',
  name: 'not-found',
  component: () => import('../pages/Error404.vue'),
  meta: { title: 'Página não encontrada', public: true }
}

// Exporta todas as rotas
export default [
  mainRoutes,
  chatFlowRoutes,
  reportRoutes,
  attendanceRoutes,
  authRoutes,
  notFoundRoute
]
