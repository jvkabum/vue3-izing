import { Notify, Dark } from 'quasar'

declare module 'quasar' {
  export { Notify, Dark }
  
  export interface QNotifyCreateOptions {
    type?: string
    message?: string
    position?: string
    timeout?: number
    progress?: boolean
    caption?: string
    actions?: Array<{
      icon?: string
      color?: string
      handler?: () => void
    }>
  }

  export interface NotifyApi {
    create: (opts: QNotifyCreateOptions) => void
  }
}
