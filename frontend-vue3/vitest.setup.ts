import { config } from '@vue/test-utils'
import { Quasar, Dialog, Notify } from 'quasar'
import { vi } from 'vitest'

// Mock Quasar plugins
vi.mock('quasar', () => ({
  Quasar: {
    plugins: {
      Dialog: {
        create: vi.fn()
      },
      Notify: {
        create: vi.fn()
      }
    }
  }
}))

// Configure Vue Test Utils
config.global.plugins = [
  [Quasar, {
    plugins: {
      Dialog,
      Notify
    }
  }]
]

// Mock window
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  key: vi.fn(),
  length: 0
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  key: vi.fn(),
  length: 0
}
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

// Mock Intersection Observer
const intersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn()
}))
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: intersectionObserverMock
})

// Mock ResizeObserver
const resizeObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn()
}))
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: resizeObserverMock
})

// Mock console methods
console.error = vi.fn()
console.warn = vi.fn()
console.log = vi.fn()

// Global test setup
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.clearAllTimers()
})
