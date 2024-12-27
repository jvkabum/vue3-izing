<template>
  <q-list separator style="max-width: 370px" class="q-px-sm q-py-none q-pt-sm">
    <q-item 
      clickable
      style="height: 95px; max-width: 100%;"
      @click="abrirChatContato(ticket)"
      :style="`border-left: 6px solid ${borderColor[ticket.status]}; border-radius: 10px`"
      class="ticketBorder q-px-sm"
      :class="{
        'ticketBorderGrey': !$q.dark.isActive,
        'ticket-active-item': ticket.id === ticketFocado.id,
        'ticketNotAnswered': ticket.answered == false && ticket.isGroup == false && ticket.status == 'open',
        'ticket-unread': ticket.unreadMessages > 0
      }"
    >
      <q-item-section avatar class="q-px-none">
        <q-btn 
          flat
          @click="iniciarAtendimento(ticket)"
          push
          color="primary"
          dense
          round
          v-if="ticket.status === 'pending' || (buscaTicket && ticket.status === 'pending')"
        >
          <q-badge 
            v-if="ticket.unreadMessages"
            style="border-radius: 10px;"
            class="text-center text-bold"
            floating
            dense
            text-color="white"
            color="red"
            :label="ticket.unreadMessages" 
          />
          <q-avatar>
            <img 
              :src="ticket.profilePicUrl"
              onerror="this.style.display='none'"
              style="width: 50px; height: 50px; border-radius: 50%;" 
            />
          </q-avatar>
          <q-tooltip>Atender</q-tooltip>
        </q-btn>
        
        <q-avatar size="50px" v-if="ticket.status !== 'pending'" class="relative-position">
          <q-badge 
            v-if="ticket.unreadMessages"
            style="border-radius: 10px; z-index: 99"
            class="text-center text-bold"
            floating
            dense
            text-color="white"
            color="red"
            :label="ticket.unreadMessages" 
          />
          <img 
            :src="ticket.profilePicUrl"
            onerror="this.style.display='none'"
            v-show="ticket.profilePicUrl"
          />
          <q-icon size="50px" name="mdi-account-circle" color="grey-8" />
        </q-avatar>
      </q-item-section>

      <q-item-section id="ListItemsTicket">
        <q-item-label class="text-bold" lines="1">
          {{ !ticket.name ? ticket.contact.name : ticket.name }}
          <q-icon size="20px" :name="`img:${ticket.channel}-logo.png`" />
          <span class="absolute-top-right q-pr-xs">
            <q-badge 
              dense
              style="font-size: .7em;"
              transparent
              square
              text-color="grey-10"
              color="secondary"
              :label="dataInWords(ticket.lastMessageAt, ticket.updatedAt)"
              :key="recalcularHora" 
            />
          </span>
        </q-item-label>

        <q-item-label lines="1" caption>
          {{ ticket.lastMessage }}
        </q-item-label>

        <q-item-label lines="1" caption>
          #{{ ticket.id }}
          <q-icon
            v-for="tag in tagsDoTicket"
            :key="tag.tag"
            :style="{ color: tag.color }"
            name="mdi-tag"
            size="1.4em"
            class="q-mb-sm"
          >
            <q-tooltip>{{tag && tag.tag}}</q-tooltip>
          </q-icon>
          <q-icon
            v-for="wallet in walletsDoTicket"
            :key="wallet.wallet"
            name="mdi-wallet"
            size="1.4em"
            class="q-mb-sm"
          >
            <q-tooltip>{{wallet.wallet}}</q-tooltip>
          </q-icon>
          <span class="q-ml-sm text-bold" :color="$q.dark.isActive ? 'white ' : 'black'">
            {{ `${ticket.queue || obterNomeFila(ticket, filas) || ''}` }}
          </span>
          <span class="absolute-bottom-right">
            <q-icon 
              v-if="ticket.status === 'closed'"
              name="mdi-check-circle-outline"
              color="positive"
              size="1.8em"
              class="q-mb-sm"
            >
              <q-tooltip>Atendimento Resolvido</q-tooltip>
            </q-icon>
            <q-icon
              v-if="(ticket.stepAutoReplyId && ticket.autoReplyId && ticket.status === 'pending') || (ticket.chatFlowId && ticket.stepChatFlow && ticket.status === 'pending')"
              name="mdi-robot"
              color="primary"
              size="1.8em"
              class="q-mb-sm"
            >
              <q-tooltip>ChatBot atendendo</q-tooltip>
            </q-icon>
          </span>
        </q-item-label>

        <q-item-label class="row col items-center justify-between" caption>
          Usuário: {{ ticket.username || '' }}
          <q-chip 
            :color="$q.dark.isActive ? '$primary' : 'blue-2'"
            dense
            square
            :label="ticket.whatsapp && ticket.whatsapp.name"
            size="10px"
            class="q-mr-md text-bold" 
          />
        </q-item-label>
      </q-item-section>

      <q-item-section avatar class="q-px-none">
        <q-btn 
          flat
          push
          color="primary"
          dense
          round
          v-if="!$q.screen.xs && (ticket.status === 'pending' || (buscaTicket && ticket.status === 'pending'))"
          class="q-mr-md"
          @click="espiarAtendimento(ticket)"
        >
          <q-dialog v-model="isTicketModalOpen">
            <q-card :style="cardStyle">
              <q-card-section class="row items-center justify-between">
                <div class="text-h6">{{ 'Espiar Atendimento: ' + currentTicket.id}}</div>
                <q-btn 
                  icon="close" 
                  flat 
                  round 
                  @click="closeModal" 
                />
              </q-card-section>
              <q-card-section>
                <MensagemChat :mensagens="currentTicket.messages" />
              </q-card-section>
            </q-card>
          </q-dialog>
          <q-avatar>
            <q-icon size="20px" name="mdi-eye-outline" />
          </q-avatar>
          <q-tooltip>Espiar</q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import MensagemChat from '../../components/atendimento/ConversationMessage.vue'
import { useTicket } from 'src/composables/atendimento/useTicket'
import { useTicketModal } from 'src/composables/atendimento/useTicketModal'
import { useTicketStatus } from 'src/composables/atendimento/useTicketStatus'
import { useAtendimentoTicketStore } from 'src/stores'

const props = defineProps({
  ticket: {
    type: Object,
    default: () => ({})
  },
  buscaTicket: {
    type: Boolean,
    default: false
  },
  filas: {
    type: Array,
    default: () => []
  },
  etiquetas: {
    type: Array,
    default: () => []
  }
})

const $q = useQuasar()
const ticketStore = useAtendimentoTicketStore()

// Composables
const { 
  borderColor, 
  recalcularHora, 
  ticketFocado, 
  dataInWords, 
  obterInformacoes, 
  abrirChatContato, 
  obterNomeFila,
  setupTicketSubscription
} = useTicket()

const {
  isTicketModalOpen,
  currentTicket,
  cardStyle,
  espiarAtendimento,
  closeModal
} = useTicketModal()

const { iniciarAtendimento } = useTicketStatus()

// Estado local
const tagsDoTicket = ref([])
const walletsDoTicket = ref([])

// Lifecycle hooks
onMounted(async () => {
  await setupTicketSubscription(props.ticket)
})

// Watchers
watch(() => ticketStore.getTicketFocado, newTicket => {
  if (newTicket?.contactId === props.ticket.contactId) {
    tagsDoTicket.value = obterInformacoes(props.ticket, 'tags')
    walletsDoTicket.value = obterInformacoes(props.ticket, 'carteiras')
  }
}, { deep: true })
</script>

<style lang="sass">
.ticket-active-item
  border-radius: 0
  position: relative
  height: 100%
  background: $blue-1

.ticketNotAnswered
  border-left: 5px solid $warning !important

.ticket-unread
  animation: pulse-red 1.5s infinite
  background-color: rgba(255, 0, 0, 0.1)

@keyframes pulse-red
  0%
    background-color: rgba(255, 0, 0, 0.1)
    transform: scale(1)
  50%
    background-color: rgba(255, 0, 0, 0.3)
    transform: scale(1.02)
  100%
    background-color: rgba(255, 0, 0, 0.1)
    transform: scale(1)
</style>
