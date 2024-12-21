import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuth } from './useAuth'
import { useNotification } from './useNotification'

export function useShortcuts() {
  // Composables
  const $q = useQuasar()
  const router = useRouter()
  const { isAdmin } = useAuth()
  const { notify } = useNotification()

  // Estado
  const shortcuts = ref({
    global: {
      'alt+h': {
        description: 'Ir para Home',
        action: () => router.push({ name: 'home' })
      },
      'alt+a': {
        description: 'Ir para Atendimento',
        action: () => router.push({ name: 'atendimento' })
      },
      'alt+c': {
        description: 'Ir para Contatos',
        action: () => router.push({ name: 'contatos' })
      },
      'alt+r': {
        description: 'Ir para Relatórios',
        action: () => router.push({ name: 'relatorios' })
      },
      'alt+s': {
        description: 'Ir para Configurações',
        action: () => router.push({ name: 'configuracoes' })
      },
      'alt+t': {
        description: 'Alternar Tema',
        action: () => $q.dark.toggle()
      },
      'alt+n': {
        description: 'Abrir Notificações',
        action: () => $q.notify({
          message: 'Atalho para notificações pressionado',
          position: 'top'
        })
      }
    },
    chat: {
      'ctrl+enter': {
        description: 'Enviar Mensagem',
        action: () => document.querySelector('.send-message-btn')?.click()
      },
      'ctrl+b': {
        description: 'Texto em Negrito',
        action: () => wrapText('*')
      },
      'ctrl+i': {
        description: 'Texto em Itálico',
        action: () => wrapText('_')
      },
      'ctrl+s': {
        description: 'Texto Riscado',
        action: () => wrapText('~')
      },
      'ctrl+m': {
        description: 'Texto Monospace',
        action: () => wrapText('```')
      },
      'ctrl+r': {
        description: 'Responder Mensagem',
        action: () => document.querySelector('.reply-message-btn')?.click()
      },
      'ctrl+f': {
        description: 'Encaminhar Mensagem',
        action: () => document.querySelector('.forward-message-btn')?.click()
      },
      'esc': {
        description: 'Cancelar Ação',
        action: () => document.querySelector('.cancel-action-btn')?.click()
      }
    },
    tickets: {
      'alt+1': {
        description: 'Filtrar Tickets Abertos',
        action: () => filterTickets('open')
      },
      'alt+2': {
        description: 'Filtrar Tickets Pendentes',
        action: () => filterTickets('pending')
      },
      'alt+3': {
        description: 'Filtrar Tickets Fechados',
        action: () => filterTickets('closed')
      },
      'alt+0': {
        description: 'Limpar Filtros',
        action: () => filterTickets('all')
      }
    }
  })
  const activeShortcuts = ref('global')
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const currentShortcuts = computed(() => 
    shortcuts.value[activeShortcuts.value] || {}
  )

  const shortcutsList = computed(() => 
    Object.entries(currentShortcuts.value).map(([key, value]) => ({
      key,
      ...value
    }))
  )

  // Métodos
  const registerShortcut = (context, key, description, action) => {
    if (!shortcuts.value[context]) {
      shortcuts.value[context] = {}
    }

    shortcuts.value[context][key] = {
      description,
      action
    }
  }

  const removeShortcut = (context, key) => {
    if (shortcuts.value[context]) {
      delete shortcuts.value[context][key]
    }
  }

  const setActiveContext = (context) => {
    if (shortcuts.value[context]) {
      activeShortcuts.value = context
    }
  }

  const handleKeyPress = (event) => {
    const key = []
    if (event.ctrlKey) key.push('ctrl')
    if (event.altKey) key.push('alt')
    if (event.shiftKey) key.push('shift')
    
    // Adicionar a tecla principal apenas se não for uma tecla modificadora
    if (!['Control', 'Alt', 'Shift'].includes(event.key)) {
      key.push(event.key.toLowerCase())
    }

    const shortcutKey = key.join('+')
    const shortcut = currentShortcuts.value[shortcutKey]

    if (shortcut) {
      event.preventDefault()
      shortcut.action()
    }
  }

  const wrapText = (wrapper) => {
    const input = document.querySelector('.message-input')
    if (!input) return

    const start = input.selectionStart
    const end = input.selectionEnd
    const text = input.value

    if (start === end) return

    const selectedText = text.substring(start, end)
    const newText = text.substring(0, start) + 
                   wrapper + selectedText + wrapper + 
                   text.substring(end)

    input.value = newText
    input.dispatchEvent(new Event('input'))
    input.focus()

    // Ajustar seleção para incluir os wrappers
    input.setSelectionRange(
      start + wrapper.length,
      end + wrapper.length
    )
  }

  const filterTickets = (status) => {
    router.push({ 
      name: 'tickets',
      query: { status }
    })
  }

  const showShortcutsHelp = () => {
    $q.dialog({
      title: 'Atalhos de Teclado',
      message: `
        <div class="q-pa-md">
          ${Object.entries(currentShortcuts.value)
            .map(([key, { description }]) => 
              `<div class="row q-mb-sm">
                <div class="col-4 text-weight-bold">${key}</div>
                <div class="col-8">${description}</div>
              </div>`
            )
            .join('')}
        </div>
      `,
      html: true,
      persistent: false,
      ok: {
        label: 'Fechar',
        flat: true,
        color: 'primary'
      }
    })
  }

  // Lifecycle
  onMounted(() => {
    document.addEventListener('keydown', handleKeyPress)

    // Registrar atalho para ajuda
    registerShortcut('global', 'alt+?', 'Mostrar Atalhos', showShortcutsHelp)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyPress)
  })

  return {
    // Estado
    shortcuts,
    activeShortcuts,
    loading,
    error,

    // Computed
    currentShortcuts,
    shortcutsList,

    // Métodos
    registerShortcut,
    removeShortcut,
    setActiveContext,
    showShortcutsHelp
  }
}
