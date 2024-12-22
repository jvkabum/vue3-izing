<template>
  <div class="attendance-drawer">
    <!-- Drawer Principal -->
    <q-drawer
      v-model="drawerTickets"
      show-if-above
      bordered
      :overlay="$q.screen.lt.md"
      persistent
      :breakpoint="769"
      :width="drawerWidth"
      content-class="attendance-drawer__content"
    >
      <!-- Header com Busca e Filtros -->
      <AtendimentoHeader
        :show-whatsapp-status="false"
        :toolbar-search="toolbarSearch"
        @search="$emit('search')"
        @logout="handleLogout"
        @open-profile="openUserProfile"
        @open-new-ticket-modal="openNewTicketModal"
      />

      <!-- Lista de Tickets com Tabs -->
      <q-scroll-area
        ref="scrollAreaTickets"
        class="attendance-drawer__tickets"
        @scroll="handleScroll"
      >
        <AtendimentoTabs
          :filas="filas"
          @ticket-click="openChat"
        />
      </q-scroll-area>

      <!-- Footer com Controles -->
      <footer class="attendance-drawer__footer">
        <!-- Toggle Modo Escuro -->
        <div class="dark-mode">
          <q-toggle
            v-model="isDarkMode"
            size="xl"
            keep-color
            dense
            class="dark-mode__toggle"
            :icon-color="$q.dark.isActive ? 'black' : 'white'"
            :color="$q.dark.isActive ? 'grey-3' : 'black'"
            checked-icon="mdi-white-balance-sunny"
            unchecked-icon="mdi-weather-sunny"
            @update:model-value="toggleDarkMode"
          >
            <q-tooltip>
              {{ $q.dark.isActive ? 'Desativar' : 'Ativar' }} Modo Escuro
            </q-tooltip>
          </q-toggle>
        </div>

        <!-- Lista de Canais -->
        <div class="channels">
          <q-scroll-area horizontal class="channels__list">
            <div class="row no-wrap q-gutter-x-sm">
              <template v-for="channel in whatsapps" :key="channel.id">
                <q-btn
                  rounded
                  flat
                  dense
                  :class="[
                    'channels__btn',
                    { 'channels__btn--disconnected': channel.status !== 'CONNECTED' }
                  ]"
                  :icon="`img:${channel.type}-logo.png`"
                >
                  <q-tooltip anchor="center right" self="center left" max-width="300px">
                    <ItemStatusChannel :item="channel" />
                  </q-tooltip>
                </q-btn>
              </template>
            </div>
          </q-scroll-area>
        </div>
      </footer>
    </q-drawer>

    <!-- Modais -->
    <ModalNovoTicket
      v-if="showNewTicketModal"
      v-model="showNewTicketModal"
      @close="showNewTicketModal = false"
    />

    <ModalUsuario
      v-if="showUserModal"
      :is-profile="true"
      v-model="showUserModal"
      :usuario-edicao="usuario"
      @update:usuario-edicao="updateUsuario"
    />
  </div>
</template>

<script setup>
/**
 * Componente de drawer lateral do atendimento
 * @component
 * @description Exibe lista de tickets e controles principais do atendimento
 */

import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAttendanceDrawer } from '../../composables/atendimento/useAttendanceDrawer'

// Componentes
import AtendimentoHeader from './AtendimentoHeader.vue'
import AtendimentoTabs from './AtendimentoTabs.vue'
import ItemStatusChannel from '../sessao-whatsapp/ItemStatusChannel.vue'
import ModalNovoTicket from './modals/ModalNovoTicket.vue'
import ModalUsuario from '../usuarios/ModalUsuario.vue'

/**
 * Props do componente
 */
const props = defineProps({
  /** Lista de filas disponíveis */
  filas: {
    type: Array,
    default: () => []
  },
  /** Lista de canais WhatsApp */
  whatsapps: {
    type: Array,
    default: () => []
  }
})

/**
 * Eventos que o componente pode emitir
 */
const emit = defineEmits(['search', 'scroll', 'logout', 'update-config'])

// Composables
const $q = useQuasar()
const {
  drawerTickets,
  drawerWidth,
  toolbarSearch,
  showNewTicketModal,
  showUserModal,
  scrollAreaTickets,
  openChat,
  toggleDarkMode,
  openNewTicketModal,
  openUserProfile,
  handleLogout,
  handleScroll
} = useAttendanceDrawer()

/**
 * Estado do modo escuro
 */
const isDarkMode = computed({
  get: () => $q.dark.isActive,
  set: (value) => {
    toggleDarkMode(value)
    emit('update-config', { isDark: value })
  }
})

/**
 * Dados do usuário
 */
const usuario = ref(JSON.parse(localStorage.getItem('usuario') || '{}'))

/**
 * Atualiza dados do usuário
 */
const updateUsuario = (newData) => {
  usuario.value = newData
  localStorage.setItem('usuario', JSON.stringify(newData))
}
</script>

<style lang="scss" scoped>
.attendance-drawer {
  // Container principal
  &__content {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: white;
    transition: all 0.3s ease;
  }

  // Lista de tickets
  &__tickets {
    flex: 1;
    height: calc(100vh - 180px);
  }

  // Footer
  &__footer {
    height: 50px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid rgba(0, 0, 0, 0.12);
    background: rgba(0, 0, 0, 0.02);
    transition: all 0.3s ease;

    // Modo escuro
    .dark-mode {
      &__toggle {
        transition: all 0.3s ease;

        &:hover {
          opacity: 0.8;
          transform: scale(1.05);
        }
      }
    }

    // Canais
    .channels {
      &__list {
        width: 300px;
        height: 40px;
      }

      &__btn {
        width: 40px;
        height: 40px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
        }

        &--disconnected {
          opacity: 0.2;
          filter: grayscale(1);

          &:hover {
            opacity: 0.4;
          }
        }

        img {
          width: 24px;
          height: 24px;
          transition: all 0.3s ease;
        }
      }
    }
  }
}

// Tema escuro
:deep(.body--dark) {
  .attendance-drawer {
    &__content {
      background: $dark;
    }

    &__footer {
      border-color: rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.03);
    }
  }
}

// Responsividade
@media (max-width: 599px) {
  .attendance-drawer {
    &__footer {
      padding: 0 8px;

      .channels {
        &__list {
          width: 200px;
        }

        &__btn {
          width: 32px;
          height: 32px;

          img {
            width: 20px;
            height: 20px;
          }
        }
      }
    }
  }
}

// Animações
.q-drawer-enter-active,
.q-drawer-leave-active {
  transition: transform 0.3s ease;
}

.q-drawer-enter-from,
.q-drawer-leave-to {
  transform: translateX(-100%);
}
</style>
