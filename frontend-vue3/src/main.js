import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Notify, Dialog, LocalStorage } from 'quasar'
import quasarLang from 'quasar/lang/pt-BR'
import router from './router'

// Estilos
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/mdi-v5/mdi-v5.css'
import 'quasar/src/css/index.sass'

// Componentes
import App from './App.vue'

// Composables
import { useSocket } from './composables/useSocket'
import { useNotification } from './composables/useNotification'
import { useGlobalHelpers } from './composables/utils/useGlobalHelpers'

// Cria app
const app = createApp(App)

// Configuração do Quasar
app.use(Quasar, {
  plugins: {
    Notify,
    Dialog,
    LocalStorage
  },
  lang: quasarLang,
  config: {
    // Configurações do Notify
    notify: {
      position: 'top',
      timeout: 2500,
      textColor: 'white',
      actions: [{ icon: 'close', color: 'white' }]
    },
    // Configurações do Loading
    loading: {
      delay: 400,
      message: 'Carregando...',
      spinnerSize: 80,
      spinnerColor: 'primary'
    },
    // Configurações de animações
    animations: {
      duration: 300
    },
    // Configurações de tema
    brand: {
      primary: '#3E72AF',
      secondary: '#26A69A',
      accent: '#9C27B0',
      positive: '#21BA45',
      negative: '#C10015',
      info: '#31CCEC',
      warning: '#F2C037'
    }
  }
})

// Pinia
const pinia = createPinia()
app.use(pinia)

// Router
app.use(router)

// Composables globais
const { socket } = useSocket()
const { notify } = useNotification()
const { getInitials, requestNotificationPermission } = useGlobalHelpers()

app.provide('socket', socket)
app.provide('notify', notify)

// Helpers globais
app.config.globalProperties.$iniciaisString = getInitials

// Configuração de notificações
requestNotificationPermission()

// Configurações globais
app.config.errorHandler = (err, vm, info) => {
  console.error('Erro global:', err)
  console.error('Componente:', vm)
  console.error('Info:', info)
  
  Notify.create({
    type: 'negative',
    message: 'Ocorreu um erro inesperado',
    caption: 'Por favor, tente novamente',
    position: 'top',
    timeout: 5000
  })
}

app.config.warnHandler = (msg, vm, trace) => {
  console.warn('Aviso:', msg)
  console.warn('Componente:', vm)
  console.warn('Trace:', trace)
}

// Performance
app.config.performance = true

// Compilação
app.config.compilerOptions = {
  isCustomElement: (tag) => tag.startsWith('q-')
}

// Mount
app.mount('#q-app')

// Exporta app para uso em outros arquivos se necessário
export { app }
