declare module 'pinia' {
  import { DefineStoreOptions } from 'pinia'
  export * from 'pinia'
  
  export function defineStore<Id extends string, S, G, A>(
    id: Id,
    options: DefineStoreOptions<Id, S, G, A>
  ): any
}

declare module 'vue-router' {
  import { Router, RouteLocationRaw } from 'vue-router'
  export * from 'vue-router'
  
  export function useRouter(): Router
  export function useRoute(): any
}
