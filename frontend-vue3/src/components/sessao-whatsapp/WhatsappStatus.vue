<template>
  <div class="whatsapp-status">
    <!-- Menu de Status -->
    <div v-if="isIconStatusMenu" class="status-menu">
      <div 
        v-for="wbot in whatsapps" 
        :key="wbot.id"
        class="status-menu-item"
      >
        <q-btn
          unelevated
          round
          flat
          :color="!isInvalidConnect(wbot) ? 'positive' : 'negative'"
          class="status-btn"
          :class="{ 'pulse-animation': isInvalidConnect(wbot) }"
        >
          <!-- Ícone de Status -->
          <template v-if="!isInvalidConnect(wbot)">
            <q-icon name="mdi-wifi-check" size="2em" />
          </template>

          <!-- Ícone de Notificação -->
          <div v-else class="notification-bell">
            <span class="bell-top"></span>
            <span class="bell-middle"></span>
            <span class="bell-bottom"></span>
            <span class="bell-rad"></span>
          </div>

          <!-- Menu de Detalhes -->
          <q-menu anchor="top right" self="top left" class="status-details-menu">
            <ItemStatusWhatsapp 
              :wbot="wbot" 
              :is-icon-status-menu="true"
              @status-change="handleStatusChange"
            />
          </q-menu>
        </q-btn>
      </div>
    </div>

    <!-- Carrossel de Status -->
    <transition
      appear
      enter-active-class="animated flipInX"
      leave-active-class="animated flipOutX"
    >
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
        height="120px"
        class="status-carousel bg-grey-1 shadow-2 rounded-borders"
        @navigation="handleNavigation"
      >
        <q-carousel-slide
          v-for="wbot in whatsappsInvalid"
          :key="wbot.id"
          :name="wbot.id"
          class="column no-wrap flex-center"
        >
          <ItemStatusWhatsapp 
            :wbot="wbot"
            @status-change="handleStatusChange"
          />
        </q-carousel-slide>

        <!-- Controles de Navegação Personalizados -->
        <template v-if="isBtnSlider" v-slot:control>
          <q-btn
            round
            dense
            color="primary"
            text-color="white"
            icon="chevron_left"
            @click="previousWhatsapp"
          />
          <q-btn
            round
            dense
            color="primary"
            text-color="white"
            icon="chevron_right"
            @click="nextWhatsapp"
          />
        </template>
      </q-carousel>
    </transition>

    <!-- Notificação de Status -->
    <q-dialog
      v-model="showNotification"
      position="top"
    >
      <q-card class="status-notification">
        <q-card-section class="row items-center no-wrap">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span class="q-ml-sm">
            Há problemas com a conexão do WhatsApp.
            Por favor, verifique o status.
          </span>
          <q-space />
          <q-btn
            flat
            round
            dense
            icon="close"
            @click="showNotification = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { useWhatsappStatus } from '../composables/useWhatsappStatus'
import ItemStatusWhatsapp from './ItemStatusWhatsapp.vue'

const props = defineProps({
  isIconStatusMenu: {
    type: Boolean,
    default: false
  }
})

const {
  idWbotVisible,
  isProblemConnect,
  showNotification,
  whatsapps,
  whatsappsInvalid,
  isBtnSlider,
  isInvalidConnect,
  handleStatusChange,
  nextWhatsapp,
  previousWhatsapp
} = useWhatsappStatus()

const handleNavigation = (index) => {
  idWbotVisible.value = whatsappsInvalid.value[index].id
}
</script>

<style lang="scss" scoped>
.whatsapp-status {
  .status-menu {
    display: flex;
    gap: 8px;
    
    &-item {
      position: relative;
    }
  }

  .status-btn {
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.1);
    }
  }

  .status-carousel {
    max-width: 600px;
    margin: 0 auto;
  }

  .status-notification {
    background: rgba(255, 152, 0, 0.1);
    border-left: 4px solid var(--q-warning);
  }

  // Notification Bell Animation
  .notification-bell {
    position: relative;
    width: 24px;
    height: 24px;

    span {
      background: currentColor;
      position: absolute;
    }

    .bell-top {
      width: 6px;
      height: 6px;
      top: 0;
      left: 9px;
      border-radius: 3px 3px 0 0;
    }

    .bell-middle {
      width: 24px;
      height: 18px;
      bottom: 0;
      left: 0;
      border-radius: 12px 12px 4px 4px;
    }

    .bell-bottom {
      width: 14px;
      height: 4px;
      bottom: -4px;
      left: 5px;
      border-radius: 0 0 4px 4px;
    }

    .bell-rad {
      width: 8px;
      height: 4px;
      top: 18px;
      left: 8px;
      border-radius: 4px;
      animation: ring 4s .7s ease-in-out infinite;
      transform-origin: 50% 0;
    }
  }
}

// Animations
@keyframes ring {
  0% { transform: rotate(0); }
  1% { transform: rotate(30deg); }
  3% { transform: rotate(-28deg); }
  5% { transform: rotate(34deg); }
  7% { transform: rotate(-32deg); }
  9% { transform: rotate(30deg); }
  11% { transform: rotate(-28deg); }
  13% { transform: rotate(26deg); }
  15% { transform: rotate(-24deg); }
  17% { transform: rotate(22deg); }
  19% { transform: rotate(-20deg); }
  21% { transform: rotate(18deg); }
  23% { transform: rotate(-16deg); }
  25% { transform: rotate(14deg); }
  27% { transform: rotate(-12deg); }
  29% { transform: rotate(10deg); }
  31% { transform: rotate(-8deg); }
  33% { transform: rotate(6deg); }
  35% { transform: rotate(-4deg); }
  37% { transform: rotate(2deg); }
  39% { transform: rotate(-1deg); }
  41% { transform: rotate(1deg); }
  43% { transform: rotate(0); }
  100% { transform: rotate(0); }
}

.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--q-negative), 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(var(--q-negative), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--q-negative), 0);
  }
}

// Dark mode support
.body--dark {
  .status-notification {
    background: rgba(255, 152, 0, 0.2);
  }
}

// Responsive
@media (max-width: 599px) {
  .whatsapp-status {
    .status-carousel {
      max-width: 100%;
    }

    .status-btn {
      &:hover {
        transform: none;
      }
    }
  }
}
</style>
