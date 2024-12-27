declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Vue Macros
declare module 'vue' {
  export interface GlobalComponents {
    Component: DefineComponent<{}, {}, any>
  }
}

// Quasar Components
declare module 'quasar' {
  export interface QBtn {
    color?: string
    dense?: boolean
    noCaps?: boolean
    outline?: boolean
    ripple?: boolean
  }
}
