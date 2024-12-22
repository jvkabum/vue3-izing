<template>
  <div class="item-status-whatsapp">
    <!-- Cabeçalho -->
    <div class="status-header" :class="{ 'menu-mode': isIconStatusMenu }">
      <div class="status-info">
        <!-- Nome e Status -->
        <div class="status-title">
          <span class="name">{{ wbot.name }}</span>
          <q-chip
            :color="getStatusColor"
            text-color="white"
            size="sm"
            class="status-chip"
          >
            {{ getStatusText }}
          </q-chip>
        </div>

        <!-- Número -->
        <div class="phone-number">
          {{ formatPhoneNumber(wbot.number) }}
        </div>
      </div>

      <!-- Ações -->
      <div class="status-actions">
        <q-btn
          flat
          round
          :color="getStatusColor"
          :icon="getStatusIcon"
          :loading="loading"
          @click="handleAction"
        >
          <q-tooltip>{{ getActionTooltip }}</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- QR Code (se necessário) -->
    <div v-if="showQrCode" class="qr-code-container">
      <qrcode-vue
        :value="wbot.qrcode"
        :size="200"
        level="H"
        render-as="svg"
      />
      <div class="qr-code-instructions">
        <p>1. Abra o WhatsApp no seu celular</p>
        <p>2. Toque em Menu ou Configurações e selecione WhatsApp Web</p>
        <p>3. Aponte seu celular para esta tela para capturar o código</p>
      </div>
    </div>

    <!-- Mensagem de Erro -->
    <div v-if="hasError" class="error-message">
      <q-icon name="error" color="negative" size="sm" />
      <span>{{ wbot.status }}</span>
    </div>

    <!-- Timer de Reconexão -->
    <div v-if="isReconnecting" class="reconnect-timer">
      Tentando reconectar em {{ reconnectCountdown }}s...
      <q-btn
        flat
        dense
        color="primary"
        label="Reconectar Agora"
        @click="reconnectNow"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWhatsapp } from '../../composables/whatsapp/useWhatsapp'
import { useNotificationSystem } from '../../composables/sistema/useNotificationSystem'
import QrcodeVue from 'qrcode.vue'

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

const emit = defineEmits(['status-change'])

// Composables
const { startWhatsapp, stopWhatsapp, restartWhatsapp } = useWhatsapp()
const { notifySuccess, notifyError } = useNotificationSystem()

// Estado
const loading = ref(false)
const reconnectTimer = ref(null)
const reconnectCountdown = ref(30)

// Computed
const getStatusColor = computed(() => {
  const colors = {
    CONNECTED: 'positive',
    QRCODE: 'warning',
    DISCONNECTED: 'negative',
    CONNECTING: 'info',
    TIMEOUT: 'orange',
    OPENING: 'blue'
  }
  return colors[props.wbot.status] || 'grey'
})

const getStatusIcon = computed(() => {
  const icons = {
    CONNECTED: 'check_circle',
    QRCODE: 'qr_code_2',
    DISCONNECTED: 'power_off',
    CONNECTING: 'sync',
    TIMEOUT: 'timer_off',
    OPENING: 'open_in_new'
  }
  return icons[props.wbot.status] || 'help'
})

const getStatusText = computed(() => {
  const texts = {
    CONNECTED: 'Conectado',
    QRCODE: 'QR Code',
    DISCONNECTED: 'Desconectado',
    CONNECTING: 'Conectando',
    TIMEOUT: 'Tempo Esgotado',
    OPENING: 'Abrindo'
  }
  return texts[props.wbot.status] || props.wbot.status
})

const getActionTooltip = computed(() => {
  const tooltips = {
    CONNECTED: 'Desconectar',
    QRCODE: 'Reconectar',
    DISCONNECTED: 'Conectar',
    CONNECTING: 'Aguarde...',
    TIMEOUT: 'Reconectar',
    OPENING: 'Aguarde...'
  }
  return tooltips[props.wbot.status] || 'Ação'
})

const showQrCode = computed(() => props.wbot.status === 'QRCODE' && props.wbot.qrcode)
const hasError = computed(() => ['DISCONNECTED', 'TIMEOUT'].includes(props.wbot.status))
const isReconnecting = computed(() => props.wbot.status === 'CONNECTING')

// Métodos
const formatPhoneNumber = (number) => {
  if (!number) return ''
  return number.replace(/(\d{2})(\d{2})(\d{4,5})(\d{4})/, '+$1 ($2) $3-$4')
}

const handleAction = async () => {
  if (loading.value) return

  loading.value = true
  try {
    switch (props.wbot.status) {
      case 'CONNECTED':
        await stopWhatsapp(props.wbot.id)
        notifySuccess('WhatsApp desconectado com sucesso')
        break
      case 'DISCONNECTED':
      case 'TIMEOUT':
      case 'QRCODE':
        await startWhatsapp(props.wbot.id)
        notifySuccess('Iniciando conexão com WhatsApp')
        break
      default:
        break
    }
    emit('status-change')
  } catch (err) {
    notifyError('Erro ao executar ação')
    console.error(err)
  } finally {
    loading.value = false
  }
}

const startReconnectTimer = () => {
  if (reconnectTimer.value) return

  reconnectTimer.value = setInterval(() => {
    reconnectCountdown.value--
    if (reconnectCountdown.value <= 0) {
      reconnectNow()
    }
  }, 1000)
}

const stopReconnectTimer = () => {
  if (reconnectTimer.value) {
    clearInterval(reconnectTimer.value)
    reconnectTimer.value = null
  }
  reconnectCountdown.value = 30
}

const reconnectNow = async () => {
  stopReconnectTimer()
  if (loading.value) return

  loading.value = true
  try {
    await restartWhatsapp(props.wbot.id)
    notifySuccess('Tentando reconectar WhatsApp')
    emit('status-change')
  } catch (err) {
    notifyError('Erro ao reconectar')
    console.error(err)
    startReconnectTimer()
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  if (isReconnecting.value) {
    startReconnectTimer()
  }
})

onUnmounted(() => {
  stopReconnectTimer()
})
</script>

<style lang="scss" scoped>
.item-status-whatsapp {
  padding: 12px;
  width: 100%;

  .status-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;

    &.menu-mode {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;

      .status-actions {
        align-self: center;
      }
    }
  }

  .status-info {
    flex: 1;

    .status-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;

      .name {
        font-weight: 500;
      }

      .status-chip {
        font-size: 11px;
      }
    }

    .phone-number {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.6);
    }
  }

  .qr-code-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 16px;
    padding: 16px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .qr-code-instructions {
      margin-top: 16px;
      text-align: center;
      font-size: 13px;
      color: rgba(0, 0, 0, 0.6);

      p {
        margin: 4px 0;
      }
    }
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    padding: 8px;
    border-radius: 4px;
    background: rgba(var(--q-negative), 0.1);
    color: var(--q-negative);
    font-size: 13px;
  }

  .reconnect-timer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 8px;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.6);
  }
}

// Dark mode
.dark {
  .item-status-whatsapp {
    .status-info {
      .phone-number {
        color: rgba(255, 255, 255, 0.6);
      }
    }

    .qr-code-container {
      background: $dark;

      .qr-code-instructions {
        color: rgba(255, 255, 255, 0.6);
      }
    }

    .reconnect-timer {
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

// Responsive
@media (max-width: 599px) {
  .item-status-whatsapp {
    .status-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;

      .status-actions {
        align-self: center;
      }
    }
  }
}
</style>
