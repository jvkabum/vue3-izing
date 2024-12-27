<template>
  <div class="bg-white no-scroll hide-scrollbar overflow-hidden" :style="style">
    <InforCabecalhoChat
      @updateTicket:resolver="atualizarStatusTicket('closed')"
      @updateTicket:retornar="atualizarStatusTicket('pending')"
      @updateTicket:reabrir="atualizarStatusTicket('open')"
      @abrir:modalAgendamentoMensagem="modalAgendamentoMensagem = true"
    />

    <q-scroll-area
      ref="scrollContainer"
      class="scroll-y"
      :style="scrollAreaStyle"
      @scroll="handleScroll"
    >
      <transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <infinite-loading
          v-if="messages.length"
          @infinite="loadMoreMessages"
          direction="top"
          :identifier="selectedTicket?.id"
          spinner="spiral"
        >
          <template #no-results>
            <div v-if="!messages.length">Sem resultados :(</div>
          </template>
          <template #no-more>
            Nada mais a carregar :)
          </template>
        </infinite-loading>
      </transition>

      <MensagemChat
        v-if="messages.length && selectedTicket?.id"
        :replying-message="replyingMessage"
        @update:replying-message="replyingMessage = $event"
        :messages="messages"
        @forward-message="openForwardModal"
        :enable-multi-forward="isMultiForwardEnabled"
        @update:enable-multi-forward="isMultiForwardEnabled = $event"
        :messages-to-forward="messagesToForward"
        @update:messages-to-forward="messagesToForward = $event"
      />

      <div id="messageListStart"></div>
    </q-scroll-area>

    <!-- Empty State -->
    <div
      v-if="!selectedTicket?.id"
      class="absolute-center items-center"
      :class="{
        'row col text-center q-col-gutter-lg': !$q.screen.xs,
        'full-width text-center': $q.screen.xs
      }"
    >
      <q-icon
        style="margin-left: 30vw"
        size="6em"
        color="grey-6"
        name="mdi-emoticon-wink-outline"
        class="row col text-center"
        :class="{
          'row col text-center q-mr-lg': !$q.screen.xs,
          'full-width text-center center-block': $q.screen.xs
        }"
      />
      <h1
        class="text-grey-6 row col justify-center"
        :class="{ 'full-width': $q.screen.xs }"
      >
        Selecione um ticket!
      </h1>
    </div>

    <!-- Scroll to Bottom Button -->
    <div v-if="messages.length" class="relative-position">
      <transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <div v-if="showScrollIcon">
          <q-btn
            class="vac-icon-scroll"
            color="white"
            text-color="black"
            icon="mdi-arrow-down"
            round
            push
            ripple
            dense
            @click="scrollToBottom"
          />
        </div>
      </transition>
    </div>

    <!-- Footer -->
    <q-footer class="bg-white">
      <q-separator class="bg-grey-4" />

      <!-- Reply Preview -->
      <q-list
        v-if="replyingMessage"
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
            'bg-blue-1': !replyingMessage.fromMe && !$q.dark.isActive,
            'bg-blue-2 text-black': !replyingMessage.fromMe && $q.dark.isActive,
            'bg-grey-2 text-black': replyingMessage.fromMe
          }"
        >
          <q-item-section>
            <q-item-label
              v-if="!replyingMessage.fromMe"
              :class="{ 'text-black': $q.dark.isActive }"
              caption
            >
              {{ replyingMessage.contact?.name }}
            </q-item-label>
            <q-item-label
              lines="4"
              :innerHTML="formatWhatsAppMessage(replyingMessage.body)"
            />
          </q-item-section>
          <q-btn
            @click="replyingMessage = null"
            dense
            flat
            round
            icon="close"
            class="float-right absolute-top-right z-max"
            :disabled="loading || selectedTicket?.status !== 'open'"
          />
        </q-item>
      </q-list>

      <!-- Forward Messages Banner -->
      <q-banner
        class="text-grey-8"
        v-if="messagesToForward.length > 0"
      >
        <span class="text-bold text-h5">
          {{ messagesToForward.length }} de 10 mensagens
        </span>
        selecionadas para serem encaminhadas.
        <q-separator class="bg-grey-4" />
        
        <ContactSelect
          :selected-contact="selectedContact"
          @update:selected-contact="selectedContact = $event"
          :loading="loading"
          @search="searchContacts"
        />

        <template #action>
          <q-btn
            class="bg-padrao q-px-sm"
            flat
            color="negative"
            label="Cancelar"
            @click="cancelMultiForward"
          />
          <q-btn
            class="bg-padrao q-px-sm"
            flat
            color="positive"
            label="Enviar"
            icon="mdi-send"
            @click="confirmForwardMessages(messagesToForward)"
          />
        </template>
      </q-banner>

      <!-- Message Input -->
      <InputMensagem
        v-if="!messagesToForward.length"
        :quick-messages="quickMessages"
        :replying-message="replyingMessage"
        @update:replying-message="replyingMessage = $event"
        :is-schedule-date="isSchedulingModalOpen"
      />

      <q-resize-observer @resize="handleInputResize" />
    </q-footer>

    <!-- Scheduling Modal -->
    <q-dialog v-model="isSchedulingModalOpen" persistent>
      <q-card :style="modalStyle">
        <q-card-section>
          <div class="text-h6">
            Agendamento de Mensagem
            <q-btn
              flat
              class="bg-padrao btn-rounded float-right"
              color="negative"
              icon="close"
              v-close-popup
            />
          </div>
        </q-card-section>
        <q-card-section class="q-mb-lg">
          <InputMensagem
            is-schedule-date
            :quick-messages="quickMessages"
            :replying-message="replyingMessage"
            @update:replying-message="replyingMessage = $event"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Forward Modal -->
    <q-dialog
      v-model="isForwardModalOpen"
      persistent
      @hide="messageToForward = null"
    >
      <q-card :style="modalStyle">
        <q-card-section>
          <div class="text-h6">
            Encaminhando Mensagem
            <q-btn
              flat
              class="bg-padrao btn-rounded float-right"
              color="negative"
              icon="close"
              v-close-popup
            />
          </div>
        </q-card-section>

        <q-separator inset />

        <q-card-section>
          <MensagemChat
            :is-show-options="false"
            :replying-message="replyingMessage"
            @update:replying-message="replyingMessage = $event"
            :messages="[messageToForward]"
          />
        </q-card-section>

        <q-card-section>
          <ContactSelect
            :selected-contact="selectedContact"
            @update:selected-contact="selectedContact = $event"
            :loading="loading"
            @search="searchContacts"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            class="bg-padrao q-px-sm"
            flat
            color="positive"
            label="Enviar"
            icon="mdi-send"
            @click="confirmForwardMessages([messageToForward])"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useAtendimentoStore } from '@/stores/atendimento'
import { useContactsStore } from '@/stores/contacts'
import { useSocketsStore } from '@/stores/sockets'
import { useNotifications } from '@/composables/useNotifications'
import { useTicketStatus } from '@/composables/atendimento/useTicketStatus'
import { useMessageFormat } from '@/composables/atendimento/useMessageFormat'

// Components
import InforCabecalhoChat from './InforCabecalhoChat.vue'
import MensagemChat from './MensagemChat.vue'
import InputMensagem from './InputMensagem.vue'
import ContactSelect from './ContactSelect.vue'

// Assets
import whatsBackground from '@/assets/wa-background.png'
import whatsBackgroundDark from '@/assets/wa-background-dark.jpg'

// Props
defineProps({
  quickMessages: {
    type: Array,
    default: () => []
  }
})

// Stores
const atendimentoStore = useAtendimentoStore()
const contactsStore = useContactsStore()
const socketsStore = useSocketsStore()

// Store State
const { messages, selectedTicket, loading, hasMore } = storeToRefs(atendimentoStore)

// Composables
const $q = useQuasar()
const { notify } = useNotifications()
const { updateTicketStatus } = useTicketStatus()
const { formatWhatsAppMessage } = useMessageFormat()

// Local State
const scrollContainer = ref(null)
const showScrollIcon = ref(false)
const inputHeight = ref(0)
const replyingMessage = ref(null)
const isSchedulingModalOpen = ref(false)
const isForwardModalOpen = ref(false)
const isMultiForwardEnabled = ref(false)
const messageToForward = ref(null)
const messagesToForward = ref([])
const selectedContact = ref(null)

// Computed
const style = computed(() => ({
  backgroundImage: $q.dark.isActive 
    ? `url(${whatsBackgroundDark}) !important` 
    : `url(${whatsBackground}) !important`,
  backgroundPosition: 'center !important'
}))

const scrollAreaStyle = computed(() => {
  const loadingHeight = 0 // loading.value ? 72 : 0
  const totalHeight = inputHeight.value + loadingHeight
  return `min-height: calc(100vh - ${62 + totalHeight}px); height: calc(100vh - ${62 + totalHeight}px); width: 100%`
})

const modalStyle = computed(() => 
  $q.screen.width < 770 
    ? 'min-width: 98vw; max-width: 98vw' 
    : 'min-width: 50vw; max-width: 50vw'
)

// Methods
function handleInputResize(size) {
  inputHeight.value = size.height
}

async function loadMoreMessages(state) {
  if (loading.value) return

  if (!hasMore.value || !selectedTicket.value?.id) {
    return state.complete()
  }

  try {
    loading.value = true
    await atendimentoStore.loadMoreMessages(selectedTicket.value.id)
    loading.value = false
    state.loaded()
  } catch (error) {
    state.complete()
    loading.value = false
  }
}

function handleScroll(e) {
  if (!e) return
  
  setTimeout(() => {
    showScrollIcon.value = (
      e.verticalSize - (e.verticalPosition + e.verticalContainerSize)
    ) > 2000
  }, 200)
}

function scrollToBottom() {
  document.getElementById('messageListStart').scrollIntoView()
}

function leaveChat() {
  atendimentoStore.clearSelectedTicket()
}

function openForwardModal(message) {
  messageToForward.value = message
  isForwardModalOpen.value = true
}

async function searchContacts(search) {
  if (search.length < 2) return
  await contactsStore.searchContacts(search)
}

function cancelMultiForward() {
  messagesToForward.value = []
  isMultiForwardEnabled.value = false
}

async function confirmForwardMessages(messages) {
  if (!selectedContact.value?.id) {
    notify.error('Selecione o contato de destino das mensagens.')
    return
  }

  try {
    await atendimentoStore.forwardMessages(messages, selectedContact.value)
    notify.success(
      `Mensagem encaminhada para ${selectedContact.value.name} | Número: ${selectedContact.value.number}`
    )
    messagesToForward.value = []
    isMultiForwardEnabled.value = false
    isForwardModalOpen.value = false
  } catch (error) {
    notify.error('Não foi possível encaminhar mensagem. Tente novamente em alguns minutos!')
  }
}

// Lifecycle
onMounted(() => {
  socketsStore.connectTicket()
  socketsStore.connectMessages()
})

onUnmounted(() => {
  socketsStore.disconnectTicket()
  socketsStore.disconnectMessages()
})
</script>

<style lang="scss">
.vac-icon-scroll {
  position: absolute;
  bottom: 20px;
  right: 20px;
  box-shadow: 0 1px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 1px 2px 0 rgba(0, 0, 0, 0.12);
  display: flex;
  cursor: pointer;
  z-index: 99;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

audio {
  height: 40px;
  width: 264px;
}

.mostar-btn-opcoes-chat {
  display: none;
  transition: width 2s transform 2s;
}

.q-message-text:hover .mostar-btn-opcoes-chat {
  display: block;
  float: right;
  position: absolute;
  z-index: 999;
}

.textContentItem {
  overflow-wrap: break-word;
}

.textContentItemDeleted {
  font-style: italic;
  color: rgba(0, 0, 0, 0.36);
  overflow-wrap: break-word;
}

.replyginContactMsgSideColor {
  flex: none;
  width: 4px;
  background-color: #35cd96;
}

.replyginSelfMsgSideColor {
  flex: none;
  width: 4px;
  background-color: #6bcbef;
}

.replyginMsgBody {
  padding: 10;
  height: auto;
  display: block;
  white-space: pre-wrap;
  overflow: hidden;
}

.messageContactName {
  display: flex;
  color: #6bcbef;
  font-weight: 500;
}
</style>
