<template>
  <div 
    class="stat-card"
    :class="[
      `stat-card--${color}`,
      { 'stat-card--animated': animated }
    ]"
  >
    <div class="stat-card__icon">
      <q-icon 
        :name="icon" 
        :color="color"
        size="2.5em"
      />
    </div>
    
    <div class="stat-card__content">
      <div class="stat-card__title">{{ title }}</div>
      <div class="stat-card__value">
        {{ value }}
        <q-icon
          v-if="trend"
          :name="trendIcon"
          :class="trendClass"
          size="1.2em"
        />
      </div>
      <div 
        v-if="subtitle"
        class="stat-card__subtitle"
      >
        {{ subtitle }}
      </div>
    </div>

    <q-linear-progress
      v-if="showProgress"
      :value="progress"
      :color="color"
      class="stat-card__progress"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'primary'
  },
  subtitle: {
    type: String,
    default: ''
  },
  trend: {
    type: String,
    default: '',
    validator: (value) => ['up', 'down', ''].includes(value)
  },
  progress: {
    type: Number,
    default: null
  },
  animated: {
    type: Boolean,
    default: true
  }
})

// Computed
const showProgress = computed(() => 
  typeof props.progress === 'number' && props.progress >= 0 && props.progress <= 1
)

const trendIcon = computed(() => {
  if (props.trend === 'up') return 'trending_up'
  if (props.trend === 'down') return 'trending_down'
  return ''
})

const trendClass = computed(() => ({
  'text-positive': props.trend === 'up',
  'text-negative': props.trend === 'down'
}))
</script>

<style lang="scss" scoped>
.stat-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  gap: 16px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  // Icon styles
  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background: currentColor;
    opacity: 0.1;

    .q-icon {
      opacity: 1;
    }
  }

  // Content styles
  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  &__title {
    font-size: 0.9em;
    color: rgba(0, 0, 0, 0.7);
    margin-bottom: 4px;
  }

  &__value {
    font-size: 1.5em;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 8px;

    .q-icon {
      opacity: 0.7;
    }
  }

  &__subtitle {
    font-size: 0.8em;
    color: rgba(0, 0, 0, 0.5);
    margin-top: 4px;
  }

  // Progress bar
  &__progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
  }

  // Animation
  &--animated {
    .stat-card__icon {
      animation: pulse 2s infinite;
    }
  }
}

// Color variants
@each $color in ('primary', 'secondary', 'accent', 'positive', 'negative', 'info', 'warning') {
  .stat-card--#{$color} {
    border-left: 3px solid var(--q-#{$color});
  }
}

// Animations
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

// Dark mode support
.body--dark {
  .stat-card {
    background: $dark;

    &:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    &__title {
      color: rgba(255, 255, 255, 0.7);
    }

    &__subtitle {
      color: rgba(255, 255, 255, 0.5);
    }
  }
}

// Responsive
@media (max-width: 599px) {
  .stat-card {
    padding: 12px;
    gap: 12px;

    &__icon {
      width: 40px;
      height: 40px;
    }

    &__title {
      font-size: 0.8em;
    }

    &__value {
      font-size: 1.3em;
    }

    &:hover {
      transform: none;
    }
  }
}
</style>
