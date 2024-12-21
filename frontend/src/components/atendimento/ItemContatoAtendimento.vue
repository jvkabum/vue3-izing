<template>
  <q-item
    clickable
    v-ripple
    :active="isActive"
    @click="handleClick"
    :class="[
      'contato-atendimento-item',
      { 'contato-atendimento-item--disabled': disabled }
    ]"
    :active-class="activeClass"
  >
    <!-- Avatar/Icon Section -->
    <q-item-section avatar>
      <q-avatar v-if="getAvatarUrl">
        <img :src="getAvatarUrl" :alt="title">
        <q-badge
          floating
          :color="statusColor"
          rounded
          v-if="status"
        />
      </q-avatar>
      <q-icon v-else-if="icon" :name="icon" :color="iconColor" />
    </q-item-section>

    <!-- Main Content Section -->
    <q-item-section>
      <q-item-label class="row items-center">
        {{ title }}
        <q-badge
          v-if="unreadCount"
          color="primary"
          class="q-ml-sm"
        >
          {{ unreadCount }}
        </q-badge>
      </q-item-label>
      
      <q-item-label caption lines="2">
        <span v-if="caption" class="text-weight-medium">{{ caption }}</span>
        <template v-if="caption && lastMessage">•</template>
        <span v-if="lastMessage" class="ellipsis">{{ lastMessage }}</span>
      </q-item-label>
    </q-item-section>

    <!-- Right Side Section -->
    <q-item-section side v-if="showTimeOrActions">
      <div class="column items-end">
        <!-- Last Activity Time -->
        <div 
          v-if="lastActivity"
          class="text-caption text-grey-7"
        >
          {{ lastActivityTime }}
        </div>

        <!-- Action Buttons -->
        <div class="row q-gutter-x-sm" v-if="$slots.actions">
          <slot name="actions" />
        </div>
      </div>
    </q-item-section>

    <!-- Loading Overlay -->
    <template v-if="loading">
      <div class="absolute-full flex flex-center bg-grey-3" style="opacity: 0.7">
        <q-spinner color="primary" size="2em" />
      </div>
    </template>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'
import { useContatoAtendimento } from '../composables/useContatoAtendimento'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  iconColor: {
    type: String,
    default: 'primary'
  },
  routeName: {
    type: String,
    default: ''
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: ''
  },
  lastActivity: {
    type: String,
    default: ''
  },
  lastMessage: {
    type: String,
    default: ''
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  activeClass: {
    type: String,
    default: 'my-menu-link'
  }
})

const emit = defineEmits(['click'])

const {
  isActive,
  statusColor,
  lastActivityTime,
  handleClick,
  getAvatarUrl
} = useContatoAtendimento(props, emit)

// Computed
const showTimeOrActions = computed(() => 
  props.lastActivity || !!slots.actions
)
</script>

<style lang="scss" scoped>
.contato-atendimento-item {
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 2px 8px;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;

    &:hover {
      background: none;
    }
  }

  // Active state styling
  &.my-menu-link {
    background: rgba(var(--q-primary), 0.1);
    
    &:hover {
      background: rgba(var(--q-primary), 0.15);
    }
  }

  // Loading state
  .absolute-full {
    z-index: 1;
    border-radius: inherit;
  }

  // Badge positioning
  :deep(.q-badge--floating) {
    right: -2px;
    bottom: -2px;
    border: 2px solid white;
  }
}

// Dark mode support
.body--dark {
  .contato-atendimento-item {
    &:hover {
      background: rgba(255, 255, 255, 0.07);
    }

    &.my-menu-link {
      background: rgba(var(--q-primary), 0.2);
      
      &:hover {
        background: rgba(var(--q-primary), 0.25);
      }
    }

    :deep(.q-badge--floating) {
      border-color: var(--q-dark);
    }
  }
}

// Responsive adjustments
@media (max-width: 599px) {
  .contato-atendimento-item {
    margin: 1px 4px;
    
    :deep(.q-item__section--side) {
      padding-left: 8px;
    }

    :deep(.q-item__label) {
      font-size: 0.9em;
    }

    :deep(.q-item__label--caption) {
      font-size: 0.75em;
    }
  }
}
</style>
