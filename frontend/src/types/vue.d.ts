declare module 'vue' {
  export * from '@vue/runtime-core'
  export * from '@vue/runtime-dom'
  
  export interface App<HostElement = any> {
    use(plugin: Plugin, ...options: any[]): this
    mount(rootContainer: HostElement | string): ComponentPublicInstance
    unmount(): void
    provide<T>(key: InjectionKey<T> | string, value: T): this
  }

  export interface ComponentCustomProperties {
    $store: any
    $router: any
    $route: any
  }
}
