<template>
  <q-drawer
    v-model="drawerTickets"
    show-if-above
    bordered
    :overlay="$q.screen.lt.md"
    persistent
    :breakpoint="769"
    :width="drawerWidth"
    content-class="hide-scrollbar full-width"
  >
    <!-- Header -->
    <AtendimentoHeader
      :show-whatsapp-status="false"
      :toolbar-search="toolbarSearch"
      @search="handleSearch"
      @logout="handleLogout"
      @open-profile="handleOpenProfile"
      @open-new-ticket-modal="handleOpenNewTicketModal"
    />

    <!-- Tabs e Lista de Tickets -->
    <q-scroll-area
      ref="scrollAreaTickets"
      style="height: calc(100% - 180px)"
      @scroll="handleScroll"
    >
      <AtendimentoTabs
        :filas="filas"
        @ticket-click="handleTicketClick"
      />
    </q-scroll-area>

    <!-- Footer -->
    <div class="absolute-bottom row justify-between" style="height: 50px">
      <!-- Dark Mode Toggle -->
      <q-toggle
        size="xl"
        keep-color
        dense
        class="text-bold q-ml-md flex flex-block"
        :icon-color="$q.dark.isActive ? 'black' : 'white'"
        :value="$q.dark.isActive"
        :color="$q.dark.isActive ? 'grey-3' : 'black'"
        checked-icon="mdi-white-balance-sunny"
        unchecked-icon="mdi-weather-sunny"
        @input="handleDarkModeToggle"
      >
        <q-tooltip content-class="text-body1">
          {{ $q.dark.isActive ? 'Desativar' : 'Ativar' }} Modo Escuro (Dark Mode)
        </q-tooltip>
      </q-toggle>

      <!-- Canais de Comunicação -->
      <div class="flex flex-inline q-pt-xs">
        <q-scroll-area horizontal style="height: 40px; width: 300px;">
          <template v-for="channel in whatsapps" :key="channel.id">
            <q-btn
              rounded
              flat
              dense
              size="18px"
              class="q-mx-xs q-pa-none"
              :style="`opacity: ${channel.status === 'CONNECTED' ? 1 : 0.2}`"
              :icon="`img:${channel.type}-logo.png`"
            >
              <q-tooltip
                max-height="300px"
                content-class="bg-blue-1 text-body1 text-grey-9 hide-scrollbar"
              >
                <ItemStatusChannel :item="channel" />
              </q-tooltip>
            </q-btn>
          </template>
        </q-scroll-area>
      </div>
    </div>
  </q-drawer>

  <!-- Modais -->
  <ModalNovoTicket
    v-model="showNewTicketModal"
    @close="showNewTicketModal = false"
  />

  <ModalUsuario
    :is-profile="true"
    v-model="showUserModal"
    :usuario-edicao.sync="usuario"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAtendimentoDrawers } from '../../composables/useAtendimentoDrawers'
import { useAtendimentoState } from '../../composables/useAtendimentoState'
import AtendimentoHeader from './AtendimentoHeader.vue'
import AtendimentoTabs from './AtendimentoTabs.vue'
import ItemStatusChannel from '../ItemStatusChannel.vue'
import ModalNovoTicket from './ModalNovoTicket.vue'
import ModalUsuario from '../ModalUsuario.vue'

// Props
const props = defineProps({
  filas: {
    type: Array,
    default: () => []
  },
  whatsapps: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['search', 'scroll', 'logout'])

// Composables
const $q = useQuasar()
const {
  drawerTickets,
  drawerWidth,
  toolbarSearch,
  openChat
} = useAtendimentoDrawers()

const {
  usuario,
  loading
} = useAtendimentoState()

// Estado
const showNewTicketModal = ref(false)
const showUserModal = ref(false)
const scrollAreaTickets = ref(null)

// Métodos
const handleSearch = () => {
  emit('search')
}

const handleScroll = (info) => {
  emit('scroll', info)
}

const handleLogout = () => {
  emit('logout')
}

const handleOpenProfile = () => {
  showUserModal.value = true
}

const handleOpenNewTicketModal = () => {
  showNewTicketModal.value = true
}

const handleTicketClick = (ticket) => {
  openChat(ticket)
}

const handleDarkModeToggle = (value) => {
  $q.dark.set(value)
  // Emitir evento para atualizar configurações do usuário
  emit('update-config', { isDark: value })
}
</script>

<style lang="scss" scoped>
.hide-scrollbar {
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.btn-rounded {
  border-radius: 50%;
}
</style>
