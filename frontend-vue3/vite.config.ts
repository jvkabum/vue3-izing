import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import path from 'path'

/**
 * Configuração do Vite para Vue 3
 * https://vitejs.dev/config/
 */
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // Plugins
    plugins: [
      // Vue 3
      vue({
        template: {
          transformAssetUrls,
          compilerOptions: {
            isCustomElement: (tag) => tag.startsWith('q-')
          }
        }
      }),

      // Quasar
      quasar({
        sassVariables: 'src/css/quasar.variables.sass'
      })
    ],

    // Resolução de módulos
    resolve: {
      // Aliases
      alias: {
        '@': path.resolve(__dirname, './src'),
        'vue': '@vue/runtime-dom'
      },
      
      // Extensões
      extensions: [
        '.js',
        '.ts',
        '.jsx',
        '.tsx',
        '.json',
        '.vue',
        '.mjs'
      ]
    },

    // Servidor de desenvolvimento
    server: {
      port: 8080,
      host: true,
      
      // Proxy
      proxy: {
        '/api': {
          target: env.VUE_URL_API,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },

    // Build
    build: {
      // Target
      target: 'es2015',
      
      // Otimizações
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },

      // Chunks
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': [
              'vue',
              'vue-router',
              'pinia',
              '@quasar/extras',
              'quasar'
            ],
            'auth': [
              './src/composables/auth/useAuth.js',
              './src/stores/user.js'
            ],
            'chat': [
              './src/composables/chat',
              './src/stores/chat'
            ]
          }
        }
      },

      // Source maps
      sourcemap: mode === 'development'
    },

    // Otimizações
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        '@quasar/extras',
        'quasar'
      ],
      exclude: [
        'vue-demi'
      ]
    },

    // CSS
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/css/variables.scss";`
        }
      }
    },

    // Env
    define: {
      'process.env': env
    },

    // Performance
    esbuild: {
      target: 'es2015',
      jsxFactory: 'h',
      jsxFragment: 'Fragment'
    }
  }
})
