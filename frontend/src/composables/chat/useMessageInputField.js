import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import mitt from 'mitt'

/**
 * Composable para gerenciar o campo de input de mensagem
 * @param {Object} options - Opções de configuração
 * @returns {Object} Objeto contendo estados e métodos do input
 */
export function useMessageInputField({ emit }) {
  const $q = useQuasar()
  const inputRef = ref(null)
  const emitter = mitt()

  /**
   * Manipula tecla Enter
   * @param {string} text - Texto atual do input
   */
  const handleEnterPress = (text) => {
    if (text?.trim()) {
      emit('send')
    }
  }

  /**
   * Insere emoji na posição do cursor
   * @param {Object} emoji - Objeto do emoji selecionado
   * @param {string} currentText - Texto atual do input
   */
  const insertEmoji = (emoji, currentText) => {
    if (!emoji.data || !inputRef.value?.$refs.input) return

    const input = inputRef.value.$refs.input
    const startPos = input.selectionStart
    const endPos = input.selectionEnd
    
    const newText = currentText.substring(0, startPos) + 
                   emoji.data + 
                   currentText.substring(endPos)
    
    emit('update:modelValue', newText)
    
    // Posicionar cursor após o emoji
    setTimeout(() => {
      input.selectionStart = input.selectionEnd = startPos + emoji.data.length
      input.focus()
    }, 10)
  }

  /**
   * Foca no campo de input
   */
  const focus = () => {
    inputRef.value?.focus()
  }

  /**
   * Configura eventos do emoji picker
   */
  const setupEmojiPicker = () => ({
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
  })

  /**
   * Configura menu do emoji picker
   */
  const setupEmojiMenu = () => ({
    anchor: 'top right',
    self: 'bottom middle',
    offset: [5, 40],
    transitionShow: 'jump-down',
    transitionHide: 'jump-up'
  })

  /**
   * Configura tooltips
   */
  const setupTooltips = () => ({
    class: 'text-bold',
    anchor: 'top middle',
    self: 'bottom middle',
    offset: [0, 8]
  })

  // Event Listeners
  onMounted(() => {
    emitter.on('mensagem-chat:focar-input-mensagem', focus)
  })

  onUnmounted(() => {
    emitter.off('mensagem-chat:focar-input-mensagem', focus)
  })

  return {
    // Refs
    inputRef,

    // Métodos
    handleEnterPress,
    insertEmoji,
    focus,

    // Configurações
    emojiPickerConfig: setupEmojiPicker(),
    emojiMenuConfig: setupEmojiMenu(),
    tooltipConfig: setupTooltips()
  }
}
