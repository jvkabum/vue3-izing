<template>
  <div class="notification-container">
    <q-notification
      v-for="(notification, index) in notifications"
      :key="index"
      :type="notification.type"
      :message="notification.message"
      :position="notification.position"
      :timeout="notification.timeout"
      @hide="removeNotification(index)"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Estado
const notifications = ref([])

// Métodos
const addNotification = (notification) => {
  notifications.value.push(notification)
}

const removeNotification = (index) => {
  notifications.value.splice(index, 1)
}

// Expor métodos
defineExpose({
  addNotification,
  removeNotification
})
</script>

<style lang="scss" scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}
</style>
