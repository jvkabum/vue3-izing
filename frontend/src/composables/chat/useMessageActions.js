import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

/**
 * Composable para gerenciar ações de mensagem
 * @returns {Object} Objeto contendo estados e métodos das ações
 */
export function useMessageActions() {
  const $q = useQuasar()

  /**
   * Configurações do emoji picker
   */
  const emojiPickerConfig = {
    showSearch: false,
    emojisByRow: 20,
    labelSearch: 'Localizar...',
    lang: 'pt-BR',
    style: {
      width: '40vw',
      '--vep-color-border': 'var(--q-separator-color)',
      '--vep-color-background': 'var(--q-card-color)',
      '--vep-color-text': 'var(--q-primary-text-color)'
    }
  }

  /**
   * Configurações dos botões
   */
  const buttonConfig = computed(() => ({
    color: $q.dark.isActive ? 'white' : '',
    class: 'bg-padrao btn-rounded',
    flat: true,
    dense: true
  }))

  /**
   * Configurações dos tooltips
   */
  const tooltipConfig = {
    class: 'text-bold',
    anchor: 'top middle',
    self: 'bottom middle',
    offset: [0, 8]
  }

  /**
   * Configurações do menu de emojis
   */
  const emojiMenuConfig = {
    anchor: 'top right',
    self: 'bottom middle',
    offset: [5, 40],
    transitionShow: 'jump-down',
    transitionHide: 'jump-up'
  }

  /**
   * Gera link para videoconferência
   * @returns {string} Link da videoconferência
   */
  const generateVideoLink = () => {
    const roomId = Math.random().toString(36).substring(7)
    return `https://meet.jit.si/${roomId}`
  }

  /**
   * Copia texto para a área de transferência
   * @param {string} text - Texto a ser copiado
   */
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      $q.notify({
        type: 'positive',
        message: 'Link copiado!',
        position: 'top'
      })
    } catch (error) {
      console.error('Erro ao copiar:', error)
      $q.notify({
        type: 'negative',
        message: 'Erro ao copiar link',
        position: 'top'
      })
    }
  }

  /**
   * Manipula clique no botão de vídeo
   */
  const handleVideoClick = async () => {
    const link = generateVideoLink()
    await copyToClipboard(link)
    return link
  }

  return {
    // Configurações
    emojiPickerConfig,
    buttonConfig,
    tooltipConfig,
    emojiMenuConfig,

    // Métodos
    generateVideoLink,
    copyToClipboard,
    handleVideoClick
  }
}
