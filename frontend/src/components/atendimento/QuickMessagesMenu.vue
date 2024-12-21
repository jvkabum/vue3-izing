<template>
  <div class="row absolute-full fit col-12" ref="menuRoot">
    <q-menu
      :target="() => menuRoot"
      :key="filteredMessages.length"
      square
      no-focus
      no-parent-event
      class="no-box-shadow no-shadow"
      fit
      :offset="[0, 5]"
      persistent
      max-height="400px"
      @hide="$emit('hide')"
      :model-value="show || messageStartsWithSlash"
    >
      <!-- Lista vazia -->
      <q-list
        v-if="!filteredMessages.length"
        class="no-shadow no-box-shadow"
        style="min-width: 100px"
        separator
      >
        <q-item>
          <q-item-section>
            <q-item-label class="text-negative text-bold">
              Ops... Nada por aqui!
            </q-item-label>
            <q-item-label caption>
              Cadastre suas mensagens na administração do sistema.
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Lista de mensagens -->
      <q-list
        v-else
        class="no-shadow no-box-shadow"
        style="min-width: 100px"
        separator
      >
        <q-item
          v-for="message in filteredMessages"
          :key="message.key"
          clickable
          v-close-popup
          @click="$emit('select', message)"
        >
          <q-item-section>
            <q-item-label class="text-bold">
              {{ message.key }}
            </q-item-label>
            <q-item-label caption lines="2">
              {{ message.message }}
            </q-item-label>
          </q-item-section>

          <q-tooltip content-class="bg-padrao text-grey-9 text-bold">
            {{ message.message }}
          </q-tooltip>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  messages: {
    type: Array,
    required: true,
    default: () => []
  },
  show: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['hide', 'select'])

// Refs
const menuRoot = ref(null)

// Computed
const messageStartsWithSlash = computed(() => 
  props.text?.trim().startsWith('/')
)

const searchTerm = computed(() => {
  if (!props.text?.trim().startsWith('/')) return ''
  return props.text.trim().toLowerCase().replace('/', '')
})

const filteredMessages = computed(() => {
  if (!searchTerm.value) return props.messages
  
  return props.messages.filter(message => 
    message.key.toLowerCase().includes(searchTerm.value)
  )
})
</script>

<style lang="scss" scoped>
.bg-padrao {
  background-color: var(--q-primary);
}

:deep(.q-menu) {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.q-item {
  min-height: 48px;
  padding: 8px 16px;
  
  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }
}

.q-tooltip {
  font-size: 14px;
  padding: 8px 12px;
}
</style>
