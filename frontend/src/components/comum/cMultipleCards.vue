<template>
  <div 
    class="multiple-cards"
    :class="{
      'multiple-cards--gapless': gapless,
      'multiple-cards--animated': animated,
      [`multiple-cards--spacing-${spacing}`]: true
    }"
  >
    <TransitionGroup
      v-if="animated"
      name="card-list"
      tag="div"
      class="multiple-cards__container"
    >
      <div 
        v-for="(set, index) in sets" 
        :key="index"
        :class="[contentClass, cardClass]"
      >
        <slot 
          name="card" 
          v-bind="{ 
            items: set, 
            index,
            isFirst: index === 0,
            isLast: index === sets.length - 1
          }"
        >
          <!-- Fallback content -->
          <q-card v-for="(item, itemIndex) in set" :key="itemIndex">
            <q-card-section>
              {{ item }}
            </q-card-section>
          </q-card>
        </slot>
      </div>
    </TransitionGroup>

    <template v-else>
      <div 
        v-for="(set, index) in sets" 
        :key="index"
        :class="[contentClass, cardClass]"
      >
        <slot 
          name="card" 
          v-bind="{ 
            items: set, 
            index,
            isFirst: index === 0,
            isLast: index === sets.length - 1
          }"
        >
          <!-- Fallback content -->
          <q-card v-for="(item, itemIndex) in set" :key="itemIndex">
            <q-card-section>
              {{ item }}
            </q-card-section>
          </q-card>
        </slot>
      </div>
    </template>

    <!-- Empty state -->
    <div v-if="sets.length === 0 && $slots.empty" class="multiple-cards__empty">
      <slot name="empty" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMultipleCards } from '../../composables/useMultipleCards'

const props = defineProps({
  collection: {
    type: Array,
    required: true
  },
  sizes: {
    type: Object,
    default: () => ({
      lg: 4,
      md: 3,
      sm: 2,
      xs: 1
    }),
    validator(value) {
      return Object.entries(value).every(([_, count]) => 12 % count === 0)
    }
  },
  gapless: {
    type: Boolean,
    default: false
  },
  animated: {
    type: Boolean,
    default: false
  },
  spacing: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  cardClass: {
    type: [String, Array, Object],
    default: ''
  }
})

const {
  contentClass,
  sets,
  getColumnCount,
  getResponsiveClass
} = useMultipleCards(props)

// Expose useful methods
defineExpose({
  getColumnCount,
  getResponsiveClass
})
</script>

<style lang="scss" scoped>
.multiple-cards {
  $spacing-values: (
    'sm': 8px,
    'md': 16px,
    'lg': 24px
  );

  display: flex;
  flex-wrap: wrap;

  &__container {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
  }

  &__empty {
    width: 100%;
    padding: 24px;
    text-align: center;
  }

  // Spacing variants
  @each $name, $value in $spacing-values {
    &--spacing-#{$name} {
      margin: -#{$value/2};

      > div {
        padding: #{$value/2};
      }
    }
  }

  // Gapless variant
  &--gapless {
    margin: 0;

    > div {
      padding: 0;
    }
  }

  // Animation classes
  &--animated {
    .card-list-move,
    .card-list-enter-active,
    .card-list-leave-active {
      transition: all 0.5s ease;
    }

    .card-list-enter-from,
    .card-list-leave-to {
      opacity: 0;
      transform: translateY(30px);
    }

    .card-list-leave-active {
      position: absolute;
    }
  }
}

// Responsive adjustments
@media (max-width: 1023px) {
  .multiple-cards {
    &--spacing-lg {
      margin: -12px;
      > div {
        padding: 12px;
      }
    }
  }
}

@media (max-width: 599px) {
  .multiple-cards {
    &--spacing-md,
    &--spacing-lg {
      margin: -8px;
      > div {
        padding: 8px;
      }
    }
  }
}
</style>
