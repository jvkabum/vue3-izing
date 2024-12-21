<template>
  <q-item
    clickable
    v-ripple
    :active="isActive"
    :active-class="activeClass"
    @click="handleClick"
    class="essential-link"
    :class="linkClasses"
  >
    <q-item-section v-if="icon" avatar>
      <q-icon :name="iconName">
        <q-badge
          v-if="badge"
          v-bind="getBadgeProps"
        >
          {{ badge }}
        </q-badge>
      </q-icon>
    </q-item-section>

    <q-item-section>
      <q-item-label>
        {{ title }}
        <q-badge
          v-if="labelBadge"
          :color="labelBadgeColor"
          class="q-ml-sm"
        >
          {{ labelBadge }}
        </q-badge>
      </q-item-label>
      <q-item-label 
        v-if="caption"
        caption
        :class="{ 'text-negative': color === 'negative' }"
      >
        {{ caption }}
      </q-item-label>
    </q-item-section>

    <q-item-section v-if="$slots.right" side>
      <slot name="right" />
    </q-item-section>

    <!-- Loading overlay -->
    <template v-if="loading">
      <div class="absolute-full flex flex-center bg-grey-3" style="opacity: 0.7">
        <q-spinner color="primary" size="2em" />
      </div>
    </template>
  </q-item>
</template>

<script setup>
import { ref } from 'vue'
import { useEssentialLink } from '../composables/useEssentialLink'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: ''
  },
  routeName: {
    type: String,
    default: 'dashboard'
  },
  icon: {
    type: String,
    default: ''
  },
  badge: {
    type: [String, Number],
    default: null
  },
  badgeColor: {
    type: String,
    default: 'primary'
  },
  badgeProps: {
    type: Object,
    default: () => ({})
  },
  labelBadge: {
    type: String,
    default: ''
  },
  labelBadgeColor: {
    type: String,
    default: 'primary'
  },
  activeClass: {
    type: String,
    default: 'bg-blue-1 text-grey-8 text-bold menu-link-active-item-top'
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const {
  isActive,
  iconName,
  linkClasses,
  handleClick: onLinkClick,
  getBadgeProps
} = useEssentialLink(props)

// Methods
const handleClick = async (event) => {
  if (props.disabled || props.loading) {
    event.preventDefault()
    return
  }

  emit('click', event)
  await onLinkClick()
}
</script>

<style lang="scss">
.essential-link {
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  // Active state styling
  &.menu-link-active-item-top {
    border-left: 3px solid rgb(21, 120, 173);
    border-right: 3px solid rgb(21, 120, 173);
    border-top-right-radius: 20px;
    border-bottom-right-radius: 20px;
    position: relative;
    height: 100%;

    // Hover effect for active item
    &:hover {
      background: rgba(21, 120, 173, 0.1);
    }
  }

  // Disabled state
  &[disabled] {
    opacity: 0.6;
    cursor: not-allowed;

    &:hover {
      background: none;
    }
  }

  // Loading state
  .absolute-full {
    z-index: 1;
    border-radius: inherit;
  }
}

// Dark mode support
.body--dark {
  .essential-link {
    &:hover {
      background: rgba(255, 255, 255, 0.07);
    }

    &.menu-link-active-item-top {
      &:hover {
        background: rgba(21, 120, 173, 0.2);
      }
    }
  }
}

// Responsive adjustments
@media (max-width: 599px) {
  .essential-link {
    .q-item__section--avatar {
      min-width: 40px;
    }

    .q-item__label {
      font-size: 0.9em;
    }

    .q-item__label--caption {
      font-size: 0.75em;
    }
  }
}
</style>
