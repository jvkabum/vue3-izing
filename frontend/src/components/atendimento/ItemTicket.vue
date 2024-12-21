<template>
  <div 
    class="ticket-item q-pa-sm cursor-pointer"
    :class="{ 'selected': isSelected }"
    @click="$emit('click')"
  >
    <div class="row items-center no-wrap">
      <!-- Avatar/Status -->
      <div class="col-auto q-mr-sm">
        <q-avatar size="40px">
          <img :src="ticket.contact?.profilePicUrl || 'default-avatar.png'" />
          <q-badge
            floating
            :color="statusColor"
            rounded
            size="xs"
          />
        </q-avatar>
      </div>

      <!-- Info -->
      <div class="col">
        <div class="row items-center">
          <div class="col text-weight-bold text-body2 ellipsis">
            {{ ticket.contact?.name || 'Sem nome' }}
          </div>
          <div class="col-auto text-grey-6 text-caption">
            {{ formatTime(ticket.updatedAt) }}
          </div>
        </div>

        <!-- Última mensagem -->
        <div class="text-grey-8 text-caption ellipsis">
          {{ ticket.lastMessage }}
        </div>

        <!-- Tags -->
        <div class="row q-gutter-x-xs items-center" v-if="ticket.tags?.length">
          <q-chip
            v-for="tag in ticket.tags"
            :key="tag.id"
            dense
            size="xs"
            :color="tag.color"
            text-color="white"
          >
            {{ tag.name }}
          </q-chip>
        </div>

        <!-- Fila -->
        <div v-if="filaAtual" class="text-caption text-primary">
          {{ filaAtual.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Props
const props = defineProps({
  ticket: {
    type: Object,
    required: true
  },
  filas: {
    type: Array,
    default: () => []
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

// Computed
const statusColor = computed(() => {
  switch (props.ticket.status) {
    case 'open': return 'green'
    case 'pending': return 'orange'
    case 'closed': return 'red'
    default: return 'grey'
  }
})

const filaAtual = computed(() => {
  return props.filas.find(f => f.id === props.ticket.queueId)
})

// Methods
const formatTime = (date) => {
  if (!date) return ''
  
  const dateObj = new Date(date)
  
  if (isToday(dateObj)) {
    return format(dateObj, 'HH:mm')
  }
  
  if (isYesterday(dateObj)) {
    return 'Ontem'
  }
  
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR })
}
</script>

<style lang="scss" scoped>
.ticket-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }

  &.selected {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// Dark mode
:deep(.q-dark) {
  .ticket-item {
    border-bottom-color: rgba(255, 255, 255, 0.12);

    &:hover {
      background-color: rgba(255, 255, 255, 0.03);
    }

    &.selected {
      background-color: rgba(255, 255, 255, 0.05);
    }
  }
}
</style>
