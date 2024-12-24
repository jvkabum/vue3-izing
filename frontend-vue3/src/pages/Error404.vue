<template>
  <div class="error-404">
    <!-- Container Principal -->
    <div class="content-wrapper">
      <!-- Código do Erro -->
      <div class="error-code">
        404
      </div>

      <!-- Mensagem -->
      <div class="error-message">
        Oooooops... Nada por aqui...
      </div>

      <!-- Ações -->
      <div class="actions">
        <!-- Voltar -->
        <q-btn
          color="white"
          text-color="negative"
          unelevated
          class="action-btn"
          icon="arrow_back"
          label="Voltar"
          no-caps
          @click="goBack"
        >
          <q-tooltip>Voltar para página anterior</q-tooltip>
        </q-btn>

        <!-- Início -->
        <q-btn
          color="white"
          text-color="negative"
          unelevated
          class="action-btn q-ml-md"
          icon="home"
          label="Início"
          no-caps
          @click="goHome"
        >
          <q-tooltip>Ir para página inicial</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Partículas de Fundo -->
    <div class="particles">
      <div v-for="n in 20" :key="n" class="particle" />
    </div>
  </div>
</template>

<script setup>
import { useError404 } from '../composables/error/useError404'

// Composables
const { goBack, goHome } = useError404()
</script>

<style lang="scss" scoped>
.error-404 {
  position: relative;
  height: 100vh;
  background: linear-gradient(135deg, #C10015 0%, #E31B0C 100%);
  overflow: hidden;

  // Container Principal
  .content-wrapper {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    text-align: center;
    padding: 16px;
  }

  // Código do Erro
  .error-code {
    font-size: clamp(150px, 30vh, 300px);
    font-weight: 700;
    line-height: 1;
    text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.2);
    animation: pulse 2s infinite;
  }

  // Mensagem
  .error-message {
    font-size: clamp(24px, 5vw, 48px);
    opacity: 0.6;
    margin: 24px 0 48px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  }

  // Ações
  .actions {
    .action-btn {
      padding: 8px 24px;
      font-size: 16px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }
    }
  }

  // Partículas
  .particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;

    .particle {
      position: absolute;
      width: 10px;
      height: 10px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      animation: float 20s infinite linear;

      @for $i from 1 through 20 {
        &:nth-child(#{$i}) {
          $size: random(20) + px;
          width: $size;
          height: $size;
          left: random(100) + vw;
          top: random(100) + vh;
          animation-delay: random(20) + s;
          animation-duration: (random(20) + 10) + s;
        }
      }
    }
  }
}

// Animações
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
  }
}

// Responsividade
@media (max-width: 599px) {
  .error-404 {
    .actions {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .action-btn {
        margin: 0 !important;
      }
    }
  }
}
</style>
