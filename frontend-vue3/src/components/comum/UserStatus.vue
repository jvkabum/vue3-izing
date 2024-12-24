<template>
  <div 
    class="status-usuario"
    :class="{ 'status-usuario--disabled': disabled }"
  >
    <q-select
      v-model="status"
      :options="statusOptions"
      :disable="disabled"
      :loading="loading"
      borderless
      dense
      emit-value
      map-options
      @update:model-value="handleStatusChange"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <template #selected>
        <q-chip
          class="status-chip"
          :color="selectedStatus.color"
          text-color="white"
          :class="{ 'status-chip--pulse': showPulse }"
        >
          <q-avatar :icon="selectedStatus.icon" />
          {{ selectedStatus.label }}
          <q-tooltip v-if="showLastChange">
            Última alteração: {{ formattedLastChange }}
          </q-tooltip>
        </q-chip>
      </template>

      <template #option="{ opt }">
        <q-item v-ripple>
          <q-item-section avatar>
            <q-icon :name="opt.icon" :color="opt.color" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ opt.label }}</q-item-label>
            <q-item-label caption>{{ opt.description }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>

      <template #no-option>
        <q-item>
          <q-item-section class="text-grey">
            Nenhum status disponível
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <!-- Status History Dialog -->
    <q-dialog v-model="showHistory" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Histórico de Status</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-timeline color="secondary">
            <q-timeline-entry
              v-for="(history, index) in statusHistory"
              :key="index"
              :title="history.status"
              :subtitle="formatDate(history.date)"
              :icon="getStatusIcon(history.status)"
              :color="getStatusColor(history.status)"
            >
              <div v-if="history.description">
                {{ history.description }}
              </div>
            </q-timeline-entry>
          </q-timeline>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Fechar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { useUserStatus } from '../../composables/useUserStatus'

const props = defineProps({
  usuario: {
    type: Object,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  showPulse: {
    type: Boolean,
    default: false
  },
  showLastChange: {
    type: Boolean,
    default: true
  },
  showHistoryButton: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:usuario', 'status-change', 'focus', 'blur'])

const {
  status,
  statusOptions,
  selectedStatus,
  handleStatusChange: onStatusChange,
  getStatusColor,
  getStatusIcon
} = useUserStatus(props, emit)

// Status History
const showHistory = ref(false)
const statusHistory = computed(() => props.usuario.statusHistory || [])

// Computed
const formattedLastChange = computed(() => {
  if (!props.usuario.lastStatusChange) return ''
  return format(new Date(props.usuario.lastStatusChange), 'dd/MM/yyyy HH:mm')
})

// Methods
const handleStatusChange = (newStatus) => {
  onStatusChange(newStatus)
  emit('status-change', newStatus)
}

const handleFocus = (event) => {
  emit('focus', event)
}

const handleBlur = (event) => {
  emit('blur', event)
}

const formatDate = (date) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm')
}

// Expose methods
defineExpose({
  showHistory: () => { showHistory.value = true },
  hideHistory: () => { showHistory.value = false },
  getStatusColor,
  getStatusIcon
})
</script>

<style lang="scss" scoped>
.status-usuario {
  display: inline-block;
  position: relative;

  &--disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .status-chip {
    min-width: 120px;
    transition: all 0.3s ease;

    &--pulse {
      animation: pulse 2s infinite;
    }
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--q-primary), 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(var(--q-primary), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--q-primary), 0);
  }
}

// Responsive adjustments
@media (max-width: 599px) {
  .status-usuario {
    .status-chip {
      min-width: 100px;
    }
  }
}
</style>
