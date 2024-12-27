import { ref, onMounted, onUnmounted } from 'vue'

export function useInteracao() {
  const ultimaInteracao = ref(null)
  const tipoDispositivo = ref('mouse') // mouse, touch, pen
  const suportaTouch = ref(false)
  const coordenadas = ref({ x: 0, y: 0 })
  
  // Estado de gestos
  const gesture = ref({
    emProgresso: false,
    tipo: null, // pinch, swipe, rotate
    escala: 1,
    rotacao: 0,
    direcao: null
  })

  // Detecta o tipo de dispositivo e suporte a touch
  onMounted(() => {
    suportaTouch.value = 'ontouchstart' in window
    window.addEventListener('touchstart', () => tipoDispositivo.value = 'touch', { once: true })
    window.addEventListener('mousemove', () => tipoDispositivo.value = 'mouse', { once: true })
  })

  // Rastreamento de clique/toque
  const rastrearInteracao = (evento) => {
    ultimaInteracao.value = {
      tipo: evento.type,
      timestamp: Date.now(),
      target: evento.target
    }

    if (evento.touches) {
      coordenadas.value = {
        x: evento.touches[0].clientX,
        y: evento.touches[0].clientY
      }
    } else {
      coordenadas.value = {
        x: evento.clientX,
        y: evento.clientY
      }
    }
  }

  // Detecção de gestos
  let touchInicial = null
  let distanciaInicial = 0
  let anguloInicial = 0

  const calcularDistancia = (touch1, touch2) => {
    return Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    )
  }

  const calcularAngulo = (touch1, touch2) => {
    return Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    ) * 180 / Math.PI
  }

  const iniciarGesto = (evento) => {
    if (evento.touches.length !== 2) return

    touchInicial = [...evento.touches]
    distanciaInicial = calcularDistancia(evento.touches[0], evento.touches[1])
    anguloInicial = calcularAngulo(evento.touches[0], evento.touches[1])
    
    gesture.value.emProgresso = true
  }

  const atualizarGesto = (evento) => {
    if (!gesture.value.emProgresso || evento.touches.length !== 2) return

    const distanciaAtual = calcularDistancia(evento.touches[0], evento.touches[1])
    const anguloAtual = calcularAngulo(evento.touches[0], evento.touches[1])

    gesture.value.escala = distanciaAtual / distanciaInicial
    gesture.value.rotacao = anguloAtual - anguloInicial

    if (gesture.value.escala > 1.1) {
      gesture.value.tipo = 'pinch-out'
    } else if (gesture.value.escala < 0.9) {
      gesture.value.tipo = 'pinch-in'
    } else if (Math.abs(gesture.value.rotacao) > 15) {
      gesture.value.tipo = 'rotate'
    }
  }

  const finalizarGesto = () => {
    gesture.value = {
      emProgresso: false,
      tipo: null,
      escala: 1,
      rotacao: 0,
      direcao: null
    }
  }

  // Event listeners
  onMounted(() => {
    window.addEventListener('mousedown', rastrearInteracao)
    window.addEventListener('touchstart', rastrearInteracao)
    window.addEventListener('touchstart', iniciarGesto)
    window.addEventListener('touchmove', atualizarGesto)
    window.addEventListener('touchend', finalizarGesto)
  })

  onUnmounted(() => {
    window.removeEventListener('mousedown', rastrearInteracao)
    window.removeEventListener('touchstart', rastrearInteracao)
    window.removeEventListener('touchstart', iniciarGesto)
    window.removeEventListener('touchmove', atualizarGesto)
    window.removeEventListener('touchend', finalizarGesto)
  })

  return {
    ultimaInteracao,
    tipoDispositivo,
    suportaTouch,
    coordenadas,
    gesture
  }
}
