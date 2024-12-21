<template>
  <div class="status-usuario">
    <q-select
      v-model="status"
      :options="statusOptions"
      borderless
      dense
      emit-value
      map-options
      @update:model-value="handleStatusChange"
    >
      <template #selected>
        <q-chip
          class="status-chip"
          :color="selectedStatus.color"
          text-color="white"
        >
          <q-avatar :icon="selectedStatus.icon" />
          {{ selectedStatus.label }}
        </q-chip>
      </template>
    </q-select>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  usuario: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:usuario'])

const statusOptions = [
  { 
    value: 'online',
    label: 'Online',
    icon: 'mdi-account-check',
    color: 'positive'
  },
  { 
    value: 'offline',
    label: 'Offline',
    icon: 'mdi-account-off',
    color: 'negative'
  }
]

const status = ref(props.usuario.status)

const selectedStatus = computed(() => 
  statusOptions.find(opt => opt.value === status.value) || statusOptions[1]
)

const handleStatusChange = (newStatus) => {
  const updatedUser = {
    ...props.usuario,
    status: newStatus
  }
  
  localStorage.setItem('usuario', JSON.stringify(updatedUser))
  emit('update:usuario', updatedUser)
}
</script>

<style lang="scss" scoped>
.status-usuario {
  .status-chip {
    min-width: 120px;
  }
}
</style> 