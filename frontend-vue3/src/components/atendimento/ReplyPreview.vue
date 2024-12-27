<template>
  <q-list
    v-if="message"
    :style="`border-top: 1px solid; max-height: 140px; width: 100%;`"
    style="max-height: 100px;"
    class="q-pa-none q-py-md text-black row items-center col justify-center full-width"
    :class="{
      'bg-grey-1': !$q.dark.isActive,
      'bg-grey-10': $q.dark.isActive
    }"
  >
    <q-item
      class="q-card--bordered q-pb-sm btn-rounded"
      :style="`
        width: 460px;
        min-width: 460px;
        max-width: 460px;
        max-height: 110px;
      `"
      :class="{
        'bg-blue-1': !message.fromMe && !$q.dark.isActive,
        'bg-blue-2 text-black': !message.fromMe && $q.dark.isActive,
        'bg-grey-2 text-black': message.fromMe
      }"
    >
      <q-item-section>
        <q-item-label
          v-if="!message.fromMe"
          :class="{ 'text-black': $q.dark.isActive }"
          caption
        >
          {{ message.contact?.name }}
        </q-item-label>
        <q-item-label
          lines="4"
          v-html="formatMessage(message.body)"
        />
      </q-item-section>

      <q-btn
        @click="$emit('close')"
        dense
        flat
        round
        icon="close"
        class="float-right absolute-top-right z-max"
        :disabled="loading || disabled"
      />
    </q-item>
  </q-list>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useMessageFormatter } from '../../../composables/useMessageFormatter'

// Props
const props = defineProps({
  message: {
    type: Object,
    required: true
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

// Emits
const emit = defineEmits(['close'])

// Composables
const $q = useQuasar()
const { formatWhatsAppMessage: formatMessage } = useMessageFormatter()
</script>

<style lang="scss" scoped>
.btn-rounded {
  border-radius: 8px;
}

.z-max {
  z-index: 9999;
}
</style>
