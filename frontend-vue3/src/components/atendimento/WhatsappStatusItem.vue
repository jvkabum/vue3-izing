<template>
  <q-item
    :key="wbot.id"
    v-ripple
    clickable
    dense
    class="whatsapp-status-item"
    :class="[statusClass, { 'whatsapp-status-item--menu': isIconStatusMenu }]"
    @click="handleClick"
  >
    <q-item-section avatar>
      <q-icon
        :color="statusInfo.color"
        size="2.5em"
        :name="statusInfo.icon"
        class="whatsapp-status-icon"
      />
    </q-item-section>

    <q-item-section>
      <q-item-label lines="1" class="row items-center">
        <span>Nome: {{ wbot.name }}</span>
        <q-badge
          v-if="wbot.queueCount"
          color="primary"
          class="q-ml-sm"
        >
          {{ wbot.queueCount }}
        </q-badge>
      </q-item-label>

      <q-item-label caption lines="1" class="status-label">
        {{ statusInfo.status }}
        <q-spinner-dots v-if="isPending" color="primary" size="1em" />
      </q-item-label>

      <q-item-label 
        v-if="isIconStatusMenu"
        caption
        lines="3"
        class="description-label"
      >
        {{ statusInfo.description }}
      </q-item-label>
    </q-item-section>

    <!-- Status Actions -->
    <q-item-section v-if="showActions" side>
      <div class="row q-gutter-x-sm">
        <q-btn
          v-if="isDisconnected"
          flat
          round
          dense
          color="primary"
          icon="refresh"
          @click.stop="$emit('reconnect', wbot)"
        >
          <q-tooltip>Reconectar</q-tooltip>
        </q-btn>
        <q-btn
          v-if="isConnected"
          flat
          round
          dense
          color="negative"
          icon="power_settings_new"
          @click.stop="$emit('disconnect', wbot)"
        >
          <q-tooltip>Desconectar</q-tooltip>
        </q-btn>
      </div>
    </q-item-section>

    <!-- Tooltip for non-menu mode -->
    <q-tooltip 
      v-if="!isIconStatusMenu"
      content-class="bg-light-blue-1 text-black q-pa-sm shadow-4"
    >
      <span class="text-weight-medium">{{ statusInfo.description }}</span>
    </q-tooltip>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'
import { useWhatsappStatus } from '../composables/useWhatsappStatus'

const props = defineProps({
  wbot: {
    type: Object,
    required: true
  },
  isIconStatusMenu: {
    type: Boolean,
    default: false
  },
  showActions: {
    type: Boolean,
    default: true
  },
  animated: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['click', 'reconnect', 'disconnect'])

const {
  getStatusInfo,
  getStatusClass,
  isConnected,
  isDisconnected,
  isPending
} = useWhatsappStatus()

// Computed
const statusInfo = computed(() => getStatusInfo(props.wbot.status))

const statusClass = computed(() => 
  getStatusClass(props.wbot.status, props.animated)
)

const isConnected = computed(() => isConnected(props.wbot.status))
const isDisconnected = computed(() => isDisconnected(props.wbot.status))
const isPending = computed(() => isPending(props.wbot.status))

// Methods
const handleClick = (event) => {
  emit('click', { event, wbot: props.wbot })
}
</script>

<style lang="scss" scoped>
.whatsapp-status-item {
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 2px 8px;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  &--menu {
    margin: 0;
    border-radius: 0;
  }

  .status-label {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .description-label {
    margin-top: 4px;
    color: var(--q-primary);
  }
}

// Status animations
.whatsapp-status {
  &--pulse {
    .whatsapp-status-icon {
      animation: pulse 2s infinite;
    }
  }

  &--shake {
    .whatsapp-status-icon {
      animation: rad 1s infinite;
    }
  }

  &--spin {
    .whatsapp-status-icon {
      animation: spin 1s infinite linear;
    }
  }

  &--fade {
    .whatsapp-status-icon {
      animation: zoom 2s infinite;
    }
  }
}

// Animations
@keyframes rad {
  0% { transform: translateX(0); }
  10% { transform: translateX(6px); }
  20% { transform: translateX(0); }
  80% { transform: translateX(0); }
  90% { transform: translateX(-6px); }
  100% { transform: translateX(0); }
}

@keyframes zoom {
  0% { opacity: 0; transform: scale(0); }
  10% { opacity: 1; transform: scale(1); }
  50% { opacity: 1; }
  51% { opacity: 0; }
  100% { opacity: 0; }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// Dark mode support
.body--dark {
  .whatsapp-status-item {
    &:hover {
      background: rgba(255, 255, 255, 0.07);
    }
  }

  .q-tooltip {
    background: rgba(0, 0, 0, 0.8) !important;
    color: white !important;
  }
}

// Responsive
@media (max-width: 599px) {
  .whatsapp-status-item {
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
