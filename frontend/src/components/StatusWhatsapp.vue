<template>
  <div class="flex flex-inline q-gutter-sm">
    <div v-for="wbot in whatsapps" :key="wbot.id">
      <q-btn
        v-if="isIconStatusMenu"
        unelevated
        round
        flat
        :color="!isInvalidConnect(wbot) ? 'green' : 'negative'"
      >
        <q-icon
          v-if="!isInvalidConnect(wbot)"
          name="mdi-wifi-check"
          size="2em"
        />
        <div v-if="isInvalidConnect(wbot)" class="notification-box">
          <div class="notification-bell">
            <span class="bell-top"></span>
            <span class="bell-middle"></span>
            <span class="bell-bottom"></span>
            <span class="bell-rad"></span>
          </div>
        </div>

        <q-menu anchor="top right" self="top left">
          <ItemStatusWhatsapp :wbot="wbot" :is-icon-status-menu="true" />
        </q-menu>
      </q-btn>
    </div>

    <transition transition-show="flip-up" transition-hide="flip-down">
      <q-carousel
        v-if="!isIconStatusMenu && whatsapps.length && isProblemConnect"
        ref="carouselStatusWhatsapp"
        v-model="idWbotVisible"
        transition-prev="slide-right"
        transition-next="slide-left"
        swipeable
        animated
        control-color="primary"
        navigation
        padding
        arrows
        height="100px"
        class="bg-grey-1 shadow-1 rounded-borders"
      >
        <q-carousel-slide
          v-for="wbot in whatsappsInvalid"
          :key="wbot.id"
          :name="wbot.id"
          class="column no-wrap flex-center"
        >
          <ItemStatusWhatsapp :wbot="wbot" />
        </q-carousel-slide>
      </q-carousel>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useWhatsappStore } from '@/stores/whatsapp'
import ItemStatusWhatsapp from './ItemStatusWhatsapp.vue'

const props = defineProps({
  isIconStatusMenu: {
    type: Boolean,
    default: false
  }
})

const store = useWhatsappStore()
const idWbotVisible = ref(0)
const isProblemConnect = ref(false)

const whatsapps = computed(() => store.whatsapps)

const whatsappsInvalid = computed(() => 
  whatsapps.value.filter(w => w.status !== 'CONNECTED')
)

const isBtnSlider = computed(() => {
  const len = whatsapps.value.filter(w => w.status !== 'CONNECTED')
  return len.length > 1
})

const isInvalidConnect = (wbot) => {
  const statusAlert = [
    'PAIRING',
    'TIMEOUT',
    'DISCONNECTED',
    'qrcode',
    'DESTROYED',
    'CONFLICT'
  ]
  return statusAlert.includes(wbot.status)
}

watch(whatsapps, () => {
  const problem = whatsapps.value.some(w => w.status !== 'CONNECTED')
  setTimeout(() => {
    isProblemConnect.value = problem
  }, 3000)
}, { deep: true, immediate: true })
</script>

<style lang="scss" scoped>
.notification-box {
  // Estilos mantidos do original
}
</style>
