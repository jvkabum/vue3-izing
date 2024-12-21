<template>
  <q-item
    :key="wbot.id"
    v-ripple
    clickable
    dense
    class="full-width full-height"
  >
    <q-item-section avatar>
      <q-icon
        :color="status[wbot.status].color"
        size="2.5em"
        :name="status[wbot.status].icon"
      />
    </q-item-section>

    <q-item-section>
      <q-item-label lines="1">
        Nome: {{ wbot.name }}
      </q-item-label>
      <q-item-label caption lines="1">
        {{ status[wbot.status].status }}
      </q-item-label>
      <q-item-label caption lines="3" v-if="isIconStatusMenu">
        {{ status[wbot.status].description }}
      </q-item-label>
    </q-item-section>

    <q-tooltip v-if="!isIconStatusMenu" content-class="bg-light-blue-1 text-black q-pa-sm shadow-4">
      <span class="text-weight-medium">{{ status[wbot.status].description }}</span>
    </q-tooltip>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  wbot: {
    type: Object,
    required: true
  },
  isIconStatusMenu: {
    type: Boolean,
    default: false
  }
})

const status = {
  CONNECTED: {
    status: 'Conectado',
    icon: 'mdi-whatsapp',
    color: 'positive',
    description: 'Whatsapp conectado e funcionando'
  },
  QRCODE: {
    status: 'QRCODE',
    icon: 'mdi-qrcode-scan',
    color: 'warning',
    description: 'Aguardando leitura do QRCODE'
  },
  DISCONNECTED: {
    status: 'Desconectado',
    icon: 'mdi-alert-circle-outline',
    color: 'negative',
    description: 'Whatsapp desconectado'
  },
  TIMEOUT: {
    status: 'Timeout',
    icon: 'mdi-clock-outline',
    color: 'negative',
    description: 'Whatsapp desconectado por timeout'
  },
  DESTROYED: {
    status: 'Destruído',
    icon: 'mdi-delete-outline',
    color: 'negative',
    description: 'Whatsapp destruído'
  }
}
</script>

<style lang="scss" scoped>
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

@keyframes moon-moving {
  0% { transform: translate(-200%, 600%); }
  100% { transform: translate(800%, -200%); }
}
</style>
