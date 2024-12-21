import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Notify, Dialog, LocalStorage } from 'quasar'
import quasarLang from 'quasar/lang/pt-BR'
import router from './router'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/mdi-v5/mdi-v5.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

// Assumes your root component is App.vue
// and placed in same folder as main.js
import App from './App.vue'

// Composables globais
import { useSocket } from './composables/useSocket'
import { useNotification } from './composables/useNotification'

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
    notify: {},
    loading: {}
  }
})

// Pinia para gerenciamento de estado
const pinia = createPinia()
app.use(pinia)

// Router
app.use(router)

// Composables globais
app.provide('socket', useSocket())
app.provide('notify', useNotification())

// Helpers globais
app.config.globalProperties.$iniciaisString = (str) => {
  if (!str) return ''
  return str
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

// Configuração de notificações
if ('Notification' in window) {
  Notification.requestPermission()
}

// Mount the app
app.mount('#q-app')
