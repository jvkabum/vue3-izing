<template>
  <div 
    class="notification-container"
    :class="[
      `notification-container--${position}`,
      { 'notification-container--grouped': grouped }
    ]"
  >
    <TransitionGroup
      name="notification"
      tag="div"
      class="notification-list"
    >
      <q-notification
        v-for="notification in sortedNotifications"
        :key="notification.id"
        v-bind="getNotificationProps(notification)"
        @hide="removeNotification(notification.id)"
        @click="handleNotificationClick(notification)"
      >
        <template v-if="notification.html" #message>
          <div v-html="notification.message" />
        </template>

        <template v-if="notification.actions?.length" #actions>
          <q-btn
            v-for="(action, index) in notification.actions"
            :key="index"
            :flat="action.flat"
            :color="action.color"
            :label="action.label"
            :icon="action.icon"
            @click="handleActionClick(action, notification)"
          />
        </template>

        <template v-if="notification.caption" #caption>
          {{ notification.caption }}
        </template>
      </q-notification>
    </TransitionGroup>

    <!-- Clear All Button (when grouped and multiple notifications) -->
    <q-btn
      v-if="grouped && notifications.length > 1"
      flat
      color="grey-7"
      class="clear-all-btn"
      label="Limpar Todas"
      @click="markAllAsRead"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useNotificationSystem } from '../../composables/sistema/useNotificationSystem'

const props = defineProps({
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => [
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right',
      'top',
      'bottom',
      'left',
      'right',
      'center'
    ].includes(value)
  },
  grouped: {
    type: Boolean,
    default: false
  },
  maxNotifications: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['action', 'click'])

const {
  notifications,
  deleteNotification: removeNotification,
  markAllAsRead,
  notify,
  notifySuccess: success,
  notifyError: error,
  notifyWarning: warning,
  notifyInfo: info
} = useNotificationSystem()

// Computed
const sortedNotifications = computed(() => {
  return [...notifications.value]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, props.maxNotifications)
})

// Methods
const getNotificationProps = (notification) => {
  const {
    id, createdAt, actions, html, caption, ...props
  } = notification
  
  return {
    ...props,
    group: props.grouped || false,
    progress: true,
    position: props.position || props.position
  }
}

const handleNotificationClick = (notification) => {
  emit('click', notification)
}

const handleActionClick = (action, notification) => {
  if (action.handler) {
    action.handler(notification)
  }
  emit('action', { action, notification })
}

// Expose methods
defineExpose({
  notify,
  success,
  error,
  warning,
  info,
  markAllAsRead
})
</script>

<style lang="scss">
.notification-container {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;

  .notification-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  // Position variants
  &--top-left {
    top: 0;
    left: 0;
  }

  &--top-right {
    top: 0;
    right: 0;
  }

  &--bottom-left {
    bottom: 0;
    left: 0;
  }

  &--bottom-right {
    bottom: 0;
    right: 0;
  }

  &--top {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  &--bottom {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  &--left {
    left: 0;
    top: 50%;
    transform: translateY(-50%);
  }

  &--right {
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }

  &--center {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  // Grouped style
  &--grouped {
    .q-notification {
      margin: 0;
    }
  }

  // Make notifications clickable
  .q-notification {
    pointer-events: auto;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  }

  // Clear all button
  .clear-all-btn {
    pointer-events: auto;
    align-self: flex-end;
    margin-top: 8px;
    opacity: 0.7;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 1;
    }
  }
}

// Transition animations
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

// Dark mode support
.body--dark {
  .notification-container {
    .q-notification {
      &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }
    }
  }
}

// Responsive adjustments
@media (max-width: 599px) {
  .notification-container {
    padding: 8px;
    max-width: 100%;
    width: 100%;

    .q-notification {
      margin: 0;
      border-radius: 0;
    }
  }
}
</style>
