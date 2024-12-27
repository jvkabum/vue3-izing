<template>
  <div class="WAL position-relative bg-grey-3" :style="style">
    <q-layout class="WAL__layout shadow-3" container view="lHr LpR lFr">
      <!-- Left Drawer -->
      <q-drawer
        v-model="drawerState.left"
        show-if-above
        :overlay="$q.screen.lt.md"
        persistent
        :breakpoint="769"
        bordered
        :width="$q.screen.lt.md ? $q.screen.width : 380"
        content-class="hide-scrollbar full-width"
      >
        <!-- Toolbar -->
        <q-toolbar class="q-gutter-xs full-width" style="height: 64px">
          <q-btn-dropdown no-caps color="black" class="text-bold btn-rounded" ripple>
            <template #label>
              <div :style="{ maxWidth: $q.screen.lt.sm ? '120px' : '' }" class="ellipsis">
                {{ user.name }}
              </div>
            </template>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup @click="openUserProfile">
                <q-item-section>Perfil</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="handleLogout">
                <q-item-section>Sair</q-item-section>
              </q-item>
              <q-separator />
            </q-list>
          </q-btn-dropdown>

          <q-space />

          <q-btn
            color="black"
            class="btn-rounded"
            icon="mdi-home"
            @click="router.push({ name: 'home-dashboard' })"
          >
            <q-tooltip content-class="bg-padrao text-grey-9 text-bold">
              Retornar ao menu
            </q-tooltip>
          </q-btn>
        </q-toolbar>

        <!-- Search and Filters -->
        <q-toolbar v-show="toolbarSearch" class="row q-gutter-sm q-py-sm items-center">
          <q-separator class="absolute-top" />
          
          <q-btn
            :icon="!hasActiveFilters ? 'mdi-filter-outline' : 'mdi-filter-plus'"
            class="btn-rounded"
            :color="hasActiveFilters ? 'deep-orange-9' : 'primary'"
          >
            <q-menu content-class="shadow-10 no-scroll" square>
              <div class="row q-pa-sm" style="min-width: 350px; max-width: 350px">
                <div class="q-ma-sm">
                  <div class="text-h6 q-mb-md">Filtros Avançados</div>
                  
                  <!-- Admin Toggle -->
                  <q-toggle
                    v-if="isAdmin"
                    v-model="filters.showAll"
                    label="(Admin) - Visualizar Todos"
                    class="q-ml-lg"
                    :class="{ 'q-mb-lg': filters.showAll }"
                    @update:model-value="handleFilterChange"
                  />

                  <template v-if="!filters.showAll">
                    <!-- Queues Select -->
                    <q-select
                      v-model="filters.queuesIds"
                      :options="userQueues"
                      label="Filas"
                      multiple
                      outlined
                      dense
                      emit-value
                      map-options
                      option-value="id"
                      option-label="queue"
                      @update:model-value="handleFilterChange"
                    />

                    <!-- Status Checkboxes -->
                    <q-list dense class="q-my-md">
                      <q-item 
                        v-for="status in statusOptions" 
                        :key="status.value"
                        tag="label" 
                        v-ripple
                      >
                        <q-item-section avatar>
                          <q-checkbox
                            v-model="filters.status"
                            :val="status.value"
                            :color="status.color"
                            keep-color
                            @update:model-value="handleFilterChange"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ status.label }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>

                    <!-- Additional Filters -->
                    <q-toggle
                      v-model="filters.withUnreadMessages"
                      label="Somente Tickets com mensagens não lidas"
                      @update:model-value="handleFilterChange"
                    />
                    <q-toggle
                      v-model="filters.isNotAssignedUser"
                      label="Somente Tickets não atribuidos"
                      @update:model-value="handleFilterChange"
                    />
                  </template>

                  <q-separator class="q-my-md" spaced />
                  
                  <q-btn
                    class="float-right q-my-md"
                    color="negative"
                    label="Fechar"
                    push
                    rounded
                    v-close-popup
                  />
                </div>
              </div>
            </q-menu>
          </q-btn>

          <cInput
            v-model="filters.searchParam"
            dense
            outlined
            rounded
            type="search"
            class="col-grow"
            @update:model-value="handleFilterChange"
            placeholder="Digite sua mensagem"
          />

          <q-btn
            color="primary"
            class="btn-rounded"
            icon="mdi-book-account-outline"
            @click="handleContactsClick"
          >
            <q-tooltip content-class="bg-padrao text-grey-9 text-bold">
              Contatos
            </q-tooltip>
          </q-btn>

          <q-separator class="absolute-bottom" />
        </q-toolbar>

        <!-- Tickets List -->
        <q-scroll-area
          ref="scrollAreaTickets"
          style="height: calc(100% - 180px)"
          @scroll="handleScroll"
        >
          <div class="tab-container">
            <q-tabs v-model="activeTab" class="tab-scroll">
              <q-tab
                v-for="tab in visibleTabs"
                :key="tab.name"
                :name="tab.name"
                :label="tab.label"
              >
                <q-badge
                  v-if="tab.count > 0"
                  color="red"
                  text-color="white"
                >
                  {{ tab.count }}
                </q-badge>
              </q-tab>
            </q-tabs>
          </div>

          <div v-for="tab in visibleTabs" :key="tab.name" v-show="activeTab === tab.name">
            <div v-for="ticket in getFilteredTickets(tab.name)" :key="ticket.id">
              <ItemTicket
                :ticket="ticket"
                :queues="queues"
              />
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center q-pa-md">
            <q-spinner color="primary" size="3em" />
            <div class="q-mt-sm">Carregando...</div>
          </div>
        </q-scroll-area>

        <!-- Bottom Bar -->
        <div class="absolute-bottom row justify-between" style="height: 50px">
          <!-- Dark Mode Toggle -->
          <q-toggle
            v-model="isDarkMode"
            size="xl"
            keep-color
            dense
            class="text-bold q-ml-md flex flex-block"
            :icon-color="isDarkMode ? 'black' : 'white'"
            :color="isDarkMode ? 'grey-3' : 'black'"
            checked-icon="mdi-white-balance-sunny"
            unchecked-icon="mdi-weather-sunny"
          >
            <q-tooltip content-class="text-body1">
              {{ isDarkMode ? 'Desativar' : 'Ativar' }} Modo Escuro
            </q-tooltip>
          </q-toggle>

          <!-- Channel Status -->
          <div class="flex flex-inline q-pt-xs">
            <q-scroll-area horizontal style="height: 40px; width: 300px;">
              <div class="row no-wrap">
                <q-btn
                  v-for="channel in channels"
                  :key="channel.id"
                  rounded
                  flat
                  dense
                  size="18px"
                  :style="`opacity: ${channel.isConnected ? 1 : 0.2}`"
                  :icon="`img:${channel.type}-logo.png`"
                >
                  <q-tooltip max-height="300px" content-class="bg-blue-1 text-body1 text-grey-9 hide-scrollbar">
                    <ItemStatusChannel :item="channel" />
                  </q-tooltip>
                </q-btn>
              </div>
            </q-scroll-area>
          </div>
        </div>
      </q-drawer>

      <!-- Main Content -->
      <q-page-container>
        <router-view
          :quick-messages="quickMessages"
          :key="selectedTicket?.id"
        />
      </q-page-container>

      <!-- Right Drawer -->
      <q-drawer
        v-if="!isContactsRoute && selectedTicket?.id"
        v-model="drawerState.right"
        show-if-above
        bordered
        side="right"
        content-class="bg-grey-1"
      >
        <!-- Contact Info Content -->
        <ContactInfo
          :ticket="selectedTicket"
          :tags="tags"
          :users="users"
          @edit="handleEditContact"
          @update-tags="handleUpdateTags"
          @update-wallet="handleUpdateWallet"
          @delete-message="handleDeleteMessage"
        />
      </q-drawer>

      <!-- Modals -->
      <NewTicketModal v-model="modals.newTicket" />
      <ContactModal
        v-model="modals.contact"
        :contact-id="selectedContactId"
        @contact-updated="handleContactUpdated"
      />
      <UserProfileModal
        v-model="modals.userProfile"
        :user="currentUser"
      />
      <LogsModal
        v-model="modals.logs"
        :ticket-id="selectedTicket?.id"
        :logs="ticketLogs"
      />
    </q-layout>

    <!-- Notification Sound -->
    <audio ref="notificationSound">
      <source :src="alertSound" type="audio/mp3">
    </audio>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useAtendimentoStore } from 'src/stores/atendimento'
import { useAuthStore } from 'src/stores/auth'
import { useChannelsStore } from 'src/stores/channels'
import { useSocketsStore } from 'src/stores/sockets'
import { useNotifications } from 'composables/useNotifications'
import { useAtendimentoState } from 'src/composables/atendimento/useAtendimentoState'
import { useAtendimentoDrawers } from 'src/composables/atendimento/useAtendimentoDrawers'
import { useAtendimentoFilters } from 'src/composables/atendimento/useAtendimentoFilters'
import { useAtendimentoTabs } from 'src/composables/atendimento/useAtendimentoTabs'

// Components
import ItemTicket from './ItemTicket.vue'
import ItemStatusChannel from '../sessaoWhatsapp/ItemStatusChannel.vue'
import ContactInfo from './ContactInfo.vue'
import NewTicketModal from './NewTicketModal.vue'
import ContactModal from '../contatos/ContactModal.vue'
import UserProfileModal from '../usuarios/UserProfileModal.vue'
import LogsModal from './LogsModal.vue'

// Assets
import alertSound from 'assets/sound.mp3'

// Stores
const atendimentoStore = useAtendimentoStore()
const authStore = useAuthStore()
const channelsStore = useChannelsStore()
const socketsStore = useSocketsStore()

// Store State
const { tickets, selectedTicket, loading, hasMore } = storeToRefs(atendimentoStore)
const { user: currentUser, isAdmin } = storeToRefs(authStore)
const { channels } = storeToRefs(channelsStore)

// Composables
const router = useRouter()
const $q = useQuasar()
const { notify } = useNotifications()
const { drawerState, handleDrawerToggle } = useAtendimentoDrawers()
const { filters, hasActiveFilters, handleFilterChange } = useAtendimentoFilters()
const { activeTab, visibleTabs, handleTabChange } = useAtendimentoState()

// Local State
const modals = ref({
  newTicket: false,
  contact: false,
  userProfile: false,
  logs: false
})
const selectedContactId = ref(null)
const ticketLogs = ref([])
const isDarkMode = ref($q.dark.isActive)
const toolbarSearch = ref(true)

// Status Options
const statusOptions = [
  { value: 'open', label: 'Abertos', color: 'primary' },
  { value: 'pending', label: 'Pendentes', color: 'warning' },
  { value: 'closed', label: 'Resolvidos', color: 'negative' }
]

// Computed
const style = computed(() => ({
  height: `${$q.screen.height}px`
}))

const isContactsRoute = computed(() => 
  router.currentRoute.value.name === 'chat-contatos'
)

// Methods
function handleContactsClick() {
  if ($q.screen.lt.md) {
    modals.value.newTicket = true
  } else {
    router.push({ name: 'chat-contatos' })
  }
}

function handleScroll({ verticalPercentage }) {
  if (verticalPercentage > 0.85) {
    loadMoreTickets()
  }
}

function handleLogout() {
  authStore.logout()
  router.push({ name: 'login' })
}

function getFilteredTickets(status) {
  return tickets.value.filter(ticket => 
    ticket.status === status && 
    (!status === 'group' ? !ticket.isGroup : ticket.isGroup)
  )
}

// Lifecycle
onMounted(async () => {
  await loadTickets()
  socketsStore.connect()

  // Handle route ticket param
  const ticketId = router.currentRoute.value.params.ticketId
  if (ticketId) {
    const ticket = tickets.value.find(t => t.id === parseInt(ticketId))
    if (ticket) {
      handleTicketSelect(ticket)
    }
  } else {
    router.push({ name: 'chat-empty' })
  }
})

onUnmounted(() => {
  socketsStore.disconnect()
})

// Watch
watch(isDarkMode, (newValue) => {
  $q.dark.set(newValue)
})
</script>

<style lang="scss" scoped>
.WAL {
  width: 100%;
  height: 100%;

  &:before {
    content: '';
    height: 127px;
    position: fixed;
    top: 0;
    width: 100%;
  }

  &__layout {
    margin: 0 auto;
    z-index: 4000;
    height: 100%;
    width: 100%;
  }

  .q-drawer--standard {
    .WAL__drawer-close {
      display: none;
    }
  }
}

.tab-container {
  overflow-x: auto;
  font-size: 0.75rem;
}

.tab-scroll {
  white-space: nowrap;
}

@media (max-width: 850px) {
  .WAL {
    padding: 0;
    &__layout {
      width: 100%;
      border-radius: 0;
    }
  }
}

@media (min-width: 691px) {
  .WAL {
    &__drawer-open {
      display: none;
    }
  }
}
</style>
