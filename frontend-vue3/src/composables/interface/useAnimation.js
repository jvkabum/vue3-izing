import { ref, onMounted, onUnmounted } from 'vue'

export function useAnimacao() {
  const animacaoAtiva = ref(false)
  const duracaoAnimacao = ref(300) // milissegundos
  const tipoAnimacao = ref('fade') // fade, slide, scale, etc.

  // Verifica se o navegador suporta animações
  const suportaAnimacoes = ref(false)

  onMounted(() => {
    // Verifica suporte a animações CSS
    const elemento = document.createElement('div')
    suportaAnimacoes.value = elemento.style.animation !== undefined ||
      elemento.style.webkitAnimation !== undefined
  })

  // Inicia uma animação
  const iniciarAnimacao = (tipo = 'fade', duracao = 300) => {
    if (!suportaAnimacoes.value) return false

    tipoAnimacao.value = tipo
    duracaoAnimacao.value = duracao
    animacaoAtiva.value = true

    return new Promise(resolve => {
      setTimeout(() => {
        animacaoAtiva.value = false
        resolve(true)
      }, duracao)
    })
  }

  // Gera classes CSS baseadas no estado atual
  const classesAnimacao = (elemento) => {
    if (!animacaoAtiva.value || !suportaAnimacoes.value) return {}

    return {
      [`animacao-${tipoAnimacao.value}`]: true,
      'animacao-ativa': animacaoAtiva.value,
      [`animacao-${elemento}`]: !!elemento
    }
  }

  // Gera estilos CSS baseados no estado atual
  const estilosAnimacao = () => {
    if (!animacaoAtiva.value || !suportaAnimacoes.value) return {}

    return {
      '--duracao-animacao': `${duracaoAnimacao.value}ms`
    }
  }

  // Transições pré-definidas
  const transicoes = {
    fade: {
      enter: 'fade-enter',
      leave: 'fade-leave'
    },
    slide: {
      enter: 'slide-enter',
      leave: 'slide-leave'
    },
    scale: {
      enter: 'scale-enter',
      leave: 'scale-leave'
    }
  }

  return {
    animacaoAtiva,
    duracaoAnimacao,
    tipoAnimacao,
    suportaAnimacoes,
    iniciarAnimacao,
    classesAnimacao,
    estilosAnimacao,
    transicoes
  }
}
