<template>
  <q-card class="metric-card" :class="`bg-${color}`">
    <q-card-section class="text-white">
      <!-- Valor Principal -->
      <div class="text-h4 text-bold text-center">
        {{ formattedValue }}
      </div>

      <!-- Ícone -->
      <div class="text-center q-mt-sm">
        <q-icon :name="icon" size="2rem" />
      </div>

      <!-- Título -->
      <div class="text-subtitle1 text-center q-mt-sm">
        {{ title }}
      </div>

      <!-- Subtítulo (opcional) -->
      <div v-if="subtitle" class="text-caption text-center q-mt-xs">
        {{ subtitle }}
      </div>
    </q-card-section>

    <!-- Loading -->
    <q-inner-loading :showing="loading">
      <q-spinner-dots size="50px" color="white" />
    </q-inner-loading>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

/**
 * Props do componente
 */
const props = defineProps({
  /** Título do card */
  title: {
    type: String,
    required: true
  },
  /** Subtítulo do card */
  subtitle: {
    type: String,
    default: ''
  },
  /** Valor a ser exibido */
  value: {
    type: [Number, String],
    default: 0
  },
  /** Ícone do card */
  icon: {
    type: String,
    required: true
  },
  /** Cor do card */
  color: {
    type: String,
    default: 'primary'
  },
  /** Estado de loading */
  loading: {
    type: Boolean,
    default: false
  }
})

/**
 * Formata o valor para exibição
 */
const formattedValue = computed(() => {
  if (props.value === null || props.value === undefined) {
    return '-'
  }

  // Se for número, formata com separador de milhares
  if (typeof props.value === 'number') {
    return new Intl.NumberFormat('pt-BR').format(props.value)
  }

  return props.value
})
</script>

<style lang="scss" scoped>
.metric-card {
  height: 100%;
  transition: all 0.3s ease;

  // Efeito hover
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  // Animação do ícone
  :deep(.q-icon) {
    transition: all 0.3s ease;
  }

  &:hover {
    :deep(.q-icon) {
      transform: scale(1.1);
    }
  }

  // Cores de fundo
  &.bg-positive {
    background: linear-gradient(135deg, #05d69e, #04b98b);
  }

  &.bg-warning {
    background: linear-gradient(135deg, #faad42, #f59e1b);
  }

  &.bg-info {
    background: linear-gradient(135deg, #0398e2, #0277bd);
  }

  &.bg-orange {
    background: linear-gradient(135deg, #ffa880, #ff7043);
  }

  &.bg-pink {
    background: linear-gradient(135deg, #fc5881, #e91e63);
  }
}

// Tema escuro
:deep(.body--dark) {
  .metric-card {
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
  }
}

// Responsividade
@media (max-width: 599px) {
  .metric-card {
    .text-h4 {
      font-size: 1.8rem;
    }
  }
}
</style>
