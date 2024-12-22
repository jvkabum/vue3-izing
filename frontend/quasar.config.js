/* eslint-env node */
const { configure } = require('quasar/wrappers')
const ESLintPlugin = require('eslint-webpack-plugin')
const path = require('path')
require('dotenv').config()

/**
 * Configuração do Quasar Framework
 */
module.exports = configure(function (ctx) {
  return {
    // Suporte a TypeScript
    supportTS: false,

    // Recursos de pré-carregamento
    preFetch: false,

    // Arquivos de inicialização
    boot: [
      'vuelidate',
      'ccComponents',
      'i18n'
    ],

    // CSS global
    css: [
      'app.sass'
    ],

    // Extras do Quasar
    extras: [
      'mdi-v5',
      'roboto-font',
      'material-icons'
    ],

    // Configurações de build
    build: {
      // Variáveis de ambiente
      env: {
        VUE_URL_API: process.env.VUE_URL_API
      },

      // Modo do Vue Router
      vueRouterMode: 'history',

      // Transpilação
      transpile: true,
      transpileDependencies: ['vuelidate'],

      // Otimizações
      optimization: {
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 250000
        }
      },

      // Source maps
      sourceMap: ctx.dev,

      // Configuração do Webpack
      chainWebpack(chain) {
        // ESLint
        chain.plugin('eslint-webpack-plugin')
          .use(ESLintPlugin, [{ 
            extensions: ['js', 'vue'],
            fix: true
          }])

        // Aliases
        chain.resolve.alias.set(
          '@', path.resolve(__dirname, './src')
        )
      },

      // Extração de CSS
      extractCSS: true,

      // Minificação
      minify: !ctx.dev,
      
      // Análise de bundle
      analyze: false
    },

    // Servidor de desenvolvimento
    devServer: {
      https: false,
      port: 8080,
      open: true,
      proxy: {
        '/api': {
          target: process.env.VUE_URL_API,
          changeOrigin: true
        }
      }
    },

    // Framework Quasar
    framework: {
      // Configurações
      config: {
        dark: 'auto',
        loadingBar: {
          color: 'primary',
          size: '4px',
          position: 'top'
        },
        notify: {
          position: 'top',
          timeout: 2500,
          textColor: 'white',
          actions: [{ icon: 'close', color: 'white' }]
        },
        loading: {
          delay: 400,
          message: 'Carregando...',
          spinnerSize: 80,
          spinnerColor: 'primary'
        }
      },

      // Conjunto de ícones
      iconSet: 'material-icons',

      // Idioma
      lang: 'pt-BR',

      // Plugins
      plugins: [
        'Notify',
        'Dialog',
        'Loading',
        'LoadingBar',
        'LocalStorage',
        'SessionStorage',
        'Meta'
      ],

      // Componentes
      components: [
        'QLayout',
        'QHeader',
        'QDrawer',
        'QPageContainer',
        'QPage',
        'QToolbar',
        'QToolbarTitle',
        'QBtn',
        'QIcon',
        'QList',
        'QItem',
        'QItemSection',
        'QItemLabel',
        'QCard',
        'QCardSection',
        'QCardActions',
        'QInput',
        'QForm',
        'QSelect',
        'QTable',
        'QTh',
        'QTr',
        'QTd',
        'QCheckbox',
        'QRadio',
        'QToggle',
        'QBtnToggle',
        'QSpinner',
        'QSpinnerDots',
        'QBadge',
        'QChip',
        'QAvatar',
        'QSeparator',
        'QSpace',
        'QTooltip',
        'QMenu',
        'QDialog',
        'QUploader',
        'QImg',
        'QInnerLoading',
        'QSpinnerGears'
      ],

      // Diretivas
      directives: [
        'Ripple',
        'ClosePopup',
        'TouchSwipe'
      ]
    },

    // Animações
    animations: 'all',

    // PWA
    pwa: {
      workboxPluginMode: 'GenerateSW',
      workboxOptions: {
        skipWaiting: true,
        clientsClaim: true,
        maximumFileSizeToCacheInBytes: 5000000
      },

      // Manifesto
      manifest: {
        name: 'Izing Flow',
        short_name: 'Izing',
        description: 'Plataforma de atendimento multicanal',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#3E72AF',
        icons: [
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        shortcuts: [
          {
            name: 'Atendimento',
            short_name: 'Atendimento',
            description: 'Acessar atendimentos',
            url: '/atendimento',
            icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }]
          }
        ]
      }
    },

    // SSR
    ssr: {
      pwa: false,
      prodPort: 3000,
      maxAge: 1000 * 60 * 60 * 24 * 30,
      middlewares: [
        ctx.prod ? 'compression' : '',
        'render'
      ]
    },

    // Electron
    electron: {
      bundler: 'builder',
      
      builder: {
        appId: 'com.izing.app',
        productName: 'Izing Flow',
        copyright: 'Copyright © 2023',
        mac: {
          category: 'public.app-category.business'
        },
        win: {
          target: 'nsis'
        },
        linux: {
          target: 'AppImage'
        }
      }
    }
  }
})
