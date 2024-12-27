// Vue
declare module 'vue' {
  import { DefineComponent } from 'vue'
  
  export const ref: any
  export const computed: any
  export const onMounted: any
  export const onUnmounted: any
  export const defineProps: any
  export const defineEmits: any
  export const withDefaults: any
  export const watch: any
  export const defineComponent: any
  
  export interface GlobalComponents {
    Component: DefineComponent<{}, {}, any>
  }
}

// Quasar
declare module 'quasar' {
  import { ComponentPublicInstance } from 'vue'

  export const useQuasar: () => {
    dark: {
      isActive: boolean
      set: (value: boolean) => void
    }
    screen: {
      width: number
      height: number
      lt: {
        sm: boolean
        md: boolean
        lg: boolean
      }
    }
    notify: (config: {
      type?: 'positive' | 'negative' | 'warning' | 'info'
      message: string
      caption?: string
      position?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
      progress?: boolean
      actions?: Array<{
        icon?: string
        color?: string
        handler?: () => void
        [key: string]: any
      }>
    }) => void
    dialog: (config: {
      title?: string
      message?: string
      ok?: {
        label?: string
        color?: string
        [key: string]: any
      }
      cancel?: {
        label?: string
        color?: string
        [key: string]: any
      }
      persistent?: boolean
      [key: string]: any
    }) => Promise<any>
  }

  export interface QVueGlobals {
    screen: {
      width: number
      height: number
      lt: {
        sm: boolean
        md: boolean
        lg: boolean
      }
    }
    dark: {
      isActive: boolean
      set: (value: boolean) => void
    }
    notify: (config: any) => void
    dialog: (config: any) => Promise<any>
  }
}

// Vue Router
declare module 'vue-router' {
  export interface Router {
    push: (location: any) => Promise<void>
    go: (options: any) => void
  }
  export function useRouter(): Router
}

// Pinia
declare module 'pinia' {
  export function defineStore(
    id: string,
    setup: () => any,
    options?: {
      persist?: boolean | object
    }
  ): () => any

  export function useStore(): any
}

// Date-fns
declare module 'date-fns' {
  export function format(date: Date | number, format: string, options?: any): string
  export function parseISO(dateString: string): Date
  export function parseJSON(date: string | number | Date): Date
}

declare module 'date-fns/locale/pt-BR' {
  const locale: any
  export default locale
}

// Environment Variables
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_SOCKET_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
