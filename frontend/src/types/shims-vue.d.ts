/// <reference types="vite/client" />
/// <reference types="vue/dist/vue" />
/// <reference types="@quasar/app-vite" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue' {
  import { ComponentCustomProperties } from 'vue'
  interface ComponentCustomProperties {
    $q: any
    $router: any
    $route: any
  }
}

declare module 'pinia' {
  export interface PiniaCustomProperties {
    router: Router
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $q: any
    $router: any
    $route: any
  }
}

// Quasar specific types
declare module 'quasar' {
  interface QNotifyCreateOptions {
    type?: string
    message?: string
    position?: string
    timeout?: number
    progress?: boolean
    actions?: Array<{
      icon?: string
      color?: string
      handler?: () => void
    }>
  }

  export interface Dark {
    set: (value: boolean) => void
    toggle: () => void
    isActive: () => boolean
  }

  export interface Notify {
    create: (opts: QNotifyCreateOptions) => void
  }
}
