<template>
  <q-drawer
    v-if="isContactDrawerEnabled"
    v-model="drawerContact"
    show-if-above
    bordered
    side="right"
    content-class="bg-grey-1"
  >
    <!-- Header -->
    <div class="bg-white full-width no-border-radius q-pa-sm" style="height:60px;">
      <span class="q-ml-md text-h6">Dados Contato</span>
    </div>
    <q-separator />

    <!-- Admin Logs Button -->
    <q-item tag="label" v-ripple v-if="isAdmin">
      <q-card class="bg-white btn-rounded q-mt-sm" style="width: 100%" bordered flat>
        <q-card-section class="text-bold q-pa-sm">
          <q-btn
            flat
            class="bg-padrao btn-rounded"
            :color="$q.dark.isActive ? 'grey-3' : 'black'"
            label="Logs"
            icon="mdi-timeline-text-outline"
            @click="handleOpenLogs"
          />
        </q-card-section>
      </q-card>
    </q-item>

    <!-- Contact Info -->
    <q-scroll-area style="height: calc(100vh - 70px)">
      <div class="q-pa-sm">
        <!-- Profile Card -->
        <q-card class="bg-white btn-rounded" style="width: 100%" bordered flat>
          <q-card-section class="text-center">
            <!-- Avatar -->
            <q-avatar style="border: 1px solid #9e9e9ea1 !important; width: 100px; height: 100px">
              <template v-if="contact.profilePicUrl">
                <q-img :src="contact.profilePicUrl" style="width: 100px; height: 100px">
                  <template v-slot:error>
                    <q-icon name="mdi-account" size="1.5em" color="grey-5" />
                  </template>
                </q-img>
              </template>
              <q-icon v-else name="mdi-account" style="width: 100px; height: 100px" size="6em" color="grey-5" />
            </q-avatar>

            <!-- Contact Info -->
            <div class="text-caption q-mt-md" style="font-size: 14px">
              {{ contact.name || '' }}
            </div>
            <div class="text-caption q-mt-sm" style="font-size: 14px" id="number" @click="copyContent(contact.number)">
              {{ contact.number || '' }}
            </div>
            <div class="text-caption q-mt-md" style="font-size: 14px" id="email" @click="copyContent(contact.email)">
              {{ contact.email || '' }}
            </div>

            <!-- Edit Button -->
            <q-btn
              color="primary"
              class="q-mt-sm bg-padrao btn-rounded"
              flat
              icon="edit"
              label="Editar Contato"
              @click="handleEditContact"
            />
          </q-card-section>
        </q-card>

        <!-- Tags Card -->
        <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat>
          <q-card-section class="text-bold q-pb-none">
            Etiquetas
            <q-separator />
          </q-card-section>
          <q-card-section class="q-pa-none">
            <TagSelector
              v-model="selectedTags"
              :options="etiquetas"
              @update:model-value="handleTagsUpdate"
            />
          </q-card-section>
        </q-card>

        <!-- Wallet Card -->
        <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat>
          <q-card-section class="text-bold q-pb-none">
            Carteira
            <q-separator />
          </q-card-section>
          <q-card-section class="q-pa-none">
            <WalletSelector
              v-model="selectedWallets"
              :options="usuarios"
              @update:model-value="handleWalletsUpdate"
            />
          </q-card-section>
        </q-card>

        <!-- Scheduled Messages Card -->
        <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat>
          <q-card-section class="text-bold q-pb-none">
            Mensagens Agendadas
            <q-separator />
          </q-card-section>
          <q-card-section class="q-pa-none">
            <ScheduledMessagesList
              :messages="scheduledMessages"
              @delete="handleDeleteScheduledMessage"
            />
          </q-card-section>
        </q-card>

        <!-- Extra Info Card -->
        <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat>
          <q-card-section class="text-bold q-pb-none">
            Outras Informações
          </q-card-section>
          <q-card-section class="q-pa-none">
            <ExtraInfoList :info-list="contact.extraInfo" />
          </q-card-section>
        </q-card>
      </div>
    </q-scroll-area>
  </q-drawer>

  <!-- Modals -->
  <q-dialog v-model="showLogsModal" no-backdrop-dismiss full-height position="right">
    <TicketLogs :ticket-id="ticketId" @close="showLogsModal = false" />
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAtendimentoDrawers } from '../../composables/useAtendimentoDrawers'
import { useAtendimentoState } from '../../composables/useAtendimentoState'
import TagSelector from './TagSelector.vue'
import WalletSelector from './WalletSelector.vue'
import ScheduledMessagesList from './ScheduledMessagesList.vue'
import ExtraInfoList from './ExtraInfoList.vue'
import TicketLogs from './TicketLogs.vue'

// Props
const props = defineProps({
  etiquetas: {
    type: Array,
    default: () => []
  },
  usuarios: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits([
  'edit-contact',
  'update-tags',
  'update-wallets',
  'delete-scheduled-message'
])

// Composables
const $q = useQuasar()
const { drawerContact, isContactDrawerEnabled } = useAtendimentoDrawers()
const { ticketFocado } = useAtendimentoState()

// Estado
const showLogsModal = ref(false)
const selectedTags = ref([])
const selectedWallets = ref([])

// Computed
const isAdmin = computed(() => 
  localStorage.getItem('profile') === 'admin'
)

const contact = computed(() => 
  ticketFocado.value?.contact || {}
)

const ticketId = computed(() => 
  ticketFocado.value?.id
)

const scheduledMessages = computed(() => 
  ticketFocado.value?.scheduledMessages?.filter(msg => !msg.isDeleted) || []
)

// Métodos
const copyContent = (content) => {
  navigator.clipboard.writeText(content)
    .then(() => {
      $q.notify({
        type: 'positive',
        message: 'Copiado para a área de transferência',
        position: 'top'
      })
    })
    .catch(error => {
      console.error('Erro ao copiar:', error)
    })
}

const handleEditContact = () => {
  emit('edit-contact', contact.value.id)
}

const handleOpenLogs = () => {
  showLogsModal.value = true
}

const handleTagsUpdate = (tags) => {
  emit('update-tags', tags)
}

const handleWalletsUpdate = (wallets) => {
  emit('update-wallets', wallets)
}

const handleDeleteScheduledMessage = (message) => {
  emit('delete-scheduled-message', message)
}
</script>

<style lang="scss" scoped>
.btn-rounded {
  border-radius: 8px;
}

.bg-padrao {
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
}
</style>
