/// <reference types="vite/client" />
/// <reference types="vue/macros-global" />
/// <reference types="@quasar/app-vite" />

// Declaração do módulo Vue
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Variáveis de ambiente
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
  readonly VITE_SOCKET_URL: string
  readonly VITE_STORAGE_URL: string
  readonly VITE_PUSHER_APP_KEY: string
  readonly VITE_PUSHER_APP_CLUSTER: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_FACEBOOK_APP_ID: string
  readonly VITE_FACEBOOK_APP_VERSION: string
  readonly VITE_TELEGRAM_API_URL: string
  readonly VITE_INSTAGRAM_APP_ID: string
  readonly VITE_INSTAGRAM_APP_SECRET: string
  readonly VITE_WHATSAPP_API_URL: string
  readonly VITE_WHATSAPP_API_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Declarações globais
declare global {
  interface Window {
    // Quasar
    $q: {
      loading: {
        show: () => void
        hide: () => void
      }
      notify: (config: any) => void
      dialog: (config: any) => Promise<any>
      dark: {
        set: (value: boolean) => void
        toggle: () => void
        isActive: boolean
      }
      screen: {
        width: number
        height: number
        lt: {
          sm: boolean
          md: boolean
          lg: boolean
          xl: boolean
        }
      }
    }

    // Notificações
    Notification: {
      permission: NotificationPermission
      requestPermission(): Promise<NotificationPermission>
      new(title: string, options?: NotificationOptions): Notification
    }

    // APIs externas
    FB: any
    gapi: any
    google: any
    TelegramGameProxy: any
  }
}

// Declarações de módulos
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    // Quasar
    $q: typeof Window['$q']
    
    // Vue Router
    $router: import('vue-router').Router
    $route: import('vue-router').RouteLocationNormalizedLoaded
    
    // Pinia
    $store: import('pinia').Store<any>
    
    // i18n
    $i18n: import('vue-i18n').I18n
    $t: import('vue-i18n').TranslateResult
    
    // Helpers
    $iniciaisString: (str: string) => string
    $formatarData: (date: Date | string, format?: string) => string
    $notificarErro: (message: string, error?: any) => void
  }
}

// Declarações de módulos externos
declare module 'v-emoji-picker' {
  const VEmojiPicker: import('vue').DefineComponent<{}, {}, any>
  export { VEmojiPicker }
}

declare module 'vue3-apexcharts' {
  const VueApexCharts: import('vue').DefineComponent<{}, {}, any>
  export default VueApexCharts
}

declare module 'vue3-easy-lightbox' {
  const VueEasyLightbox: import('vue').DefineComponent<{}, {}, any>
  export default VueEasyLightbox
}

declare module 'vuedraggable' {
  const draggable: import('vue').DefineComponent<{}, {}, any>
  export default draggable
}

declare module 'drawflow' {
  export default class Drawflow {
    constructor(container: HTMLElement, options?: any)
    // Adicione os métodos e propriedades do Drawflow aqui
  }
}

declare module 'mic-recorder-to-mp3' {
  export default class MicRecorder {
    constructor(options?: any)
    start(): Promise<void>
    stop(): Promise<[Blob, AudioBuffer]>
  }
}

declare module 'printd' {
  export class Printd {
    constructor(options?: any)
    print(element: HTMLElement, cssText?: string): void
  }
}

declare module 'qrcode.vue' {
  const QrcodeVue: import('vue').DefineComponent<{
    value: string
    size?: number
    level?: string
    background?: string
    foreground?: string
  }, {}, any>
  export default QrcodeVue
}

declare module 'vdata-parser' {
  export function parse(data: any): any
  export function stringify(data: any): string
}
