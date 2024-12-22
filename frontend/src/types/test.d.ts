/// <reference types="vitest" />
/// <reference types="@vue/test-utils" />
/// <reference types="quasar" />

// Vitest Snapshot Matcher
interface CustomMatchers<R = unknown> {
  toBeWithinRange(floor: number, ceiling: number): R
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

// Mock Types
declare namespace Vi {
  interface Mocked<T> {
    [K in keyof T]: T[K] extends (...args: any[]) => any
      ? MockInstance<T[K]>
      : T[K] extends object
      ? Mocked<T[K]>
      : T[K]
  }

  interface MockInstance<T extends (...args: any[]) => any> {
    new (...args: any[]): T
    (...args: Parameters<T>): ReturnType<T>
    mockName(name: string): this
    mockImplementation(fn: T): this
    mockImplementationOnce(fn: T): this
    mockResolvedValue<T>(value: T): this
    mockRejectedValue(value: any): this
    mockReturnValue<T>(value: T): this
    mockReturnValueOnce<T>(value: T): this
    mockReset(): this
    mockRestore(): void
    mockClear(): this
    getMockName(): string
    mock: {
      calls: Parameters<T>[]
      results: { type: string; value: ReturnType<T> }[]
      instances: any[]
      lastCall: Parameters<T>
      contexts: any[]
    }
  }
}

// Storage Mock
interface MockStorage {
  getItem: Vi.MockInstance<(key: string) => string | null>
  setItem: Vi.MockInstance<(key: string, value: string) => void>
  clear: Vi.MockInstance<() => void>
  removeItem: Vi.MockInstance<(key: string) => void>
  key: Vi.MockInstance<(index: number) => string | null>
  length: number
}

// Observer Mock
interface MockObserver {
  disconnect: Vi.MockInstance<() => void>
  observe: Vi.MockInstance<(target: Element) => void>
  unobserve: Vi.MockInstance<(target: Element) => void>
  takeRecords?: Vi.MockInstance<() => any[]>
}

// Window Mocks
declare global {
  interface Window {
    localStorage: MockStorage
    sessionStorage: MockStorage
    IntersectionObserver: {
      new (callback: IntersectionObserverCallback, options?: IntersectionObserverInit): MockObserver
    }
    ResizeObserver: {
      new (callback: ResizeObserverCallback): MockObserver
    }
    matchMedia: Vi.MockInstance<(query: string) => MediaQueryList>
  }

  namespace jest {
    interface Matchers<R> extends CustomMatchers<R> {}
  }

  // Vue Test Utils
  namespace Cypress {
    interface Chainable {
      vue(): Chainable<Vue>
    }
  }
}

// Quasar Mocks
declare module 'quasar' {
  interface QDialogOptions {
    ok?: boolean
  }

  interface QNotifyConfig {
    message: string
    type?: string
    position?: string
    timeout?: number
    actions?: Array<{
      icon: string
      color: string
    }>
  }

  interface QuasarPluginOptions {
    plugins?: {
      Dialog?: {
        create: Vi.MockInstance<(options: QDialogOptions) => Promise<boolean>>
      }
      Notify?: {
        create: Vi.MockInstance<(config: QNotifyConfig) => { dismiss: () => void }>
      }
      Loading?: {
        show: Vi.MockInstance<() => void>
        hide: Vi.MockInstance<() => void>
      }
      LocalStorage?: {
        get: Vi.MockInstance<(key: string) => any>
        set: Vi.MockInstance<(key: string, value: any) => void>
        remove: Vi.MockInstance<(key: string) => void>
        clear: Vi.MockInstance<() => void>
        getItem: Vi.MockInstance<(key: string) => string | null>
        setItem: Vi.MockInstance<(key: string, value: string) => void>
        removeItem: Vi.MockInstance<(key: string) => void>
      }
    }
    config?: {
      brand?: {
        primary: string
        secondary: string
        accent: string
        positive: string
        negative: string
        info: string
        warning: string
      }
      notify?: Partial<QNotifyConfig>
      loading?: {
        delay?: number
        message?: string
        spinnerSize?: number
        spinnerColor?: string
      }
    }
  }
}

// Declare modules without types
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@vue/test-utils' {
  interface DOMWrapper<ElementType> {
    exists(): boolean
    isVisible(): boolean
  }
}
