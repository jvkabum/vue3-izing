<template>
  <q-dialog
    :value="abrirModalQR"
    @hide="fecharModalQrModal"
    persistent
  >
    <q-card style="bg-white">
      <q-card-section>
        <div class="text-h6 text-primary">
          Leia o QrCode para iniciar a sessão
          <q-btn
            round
            class="q-ml-md"
            color="negative"
            icon="mdi-close"
            @click="fecharModalQrModal"
          />
        </div>
      </q-card-section>
      <q-card-section
        class="text-center"
        :style="$q.dark.isActive ? 'background: white !important' : ''"
      >
        <QrcodeVue
          v-if="cQrcode"
          :value="cQrcode"
          :size="300"
          level="H"
        />
        <span v-else>
          Aguardando o Qr Code
        </span>
      </q-card-section>
      <q-card-section>
        <div class="row">Caso tenha problema com a leitura, solicite um novo Qr Code</div>
        <div class="row col-12 justify-center">
          <q-btn
            color="primary"
            glossy
            ripple
            outline
            label="Novo QR Code"
            @click="solicitarQrCode"
            icon="watch_later"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, watch } from 'vue'
import QrcodeVue from 'qrcode.vue'

const props = defineProps({
  abrirModalQR: {
    type: Boolean,
    default: false
  },
  channel: {
    type: Object,
    default: () => ({
      id: null,
      qrcode: ''
    })
  }
})

const emit = defineEmits(['update:abrirModalQR', 'gerar-novo-qrcode'])

const cQrcode = computed(() => props.channel.qrcode)

watch(
  () => props.channel,
  newChannel => {
    if (newChannel.status === 'CONNECTED') {
      fecharModalQrModal()
    }
  },
  { deep: true }
)

const solicitarQrCode = () => {
  emit('gerar-novo-qrcode', props.channel)
  fecharModalQrModal()
}

const fecharModalQrModal = () => {
  emit('update:abrirModalQR', false)
}
</script>

<style lang="scss" scoped>
</style>
