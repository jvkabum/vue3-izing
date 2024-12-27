<template>
  <div>
    <q-header class="bg-white text-grey-10 no-border-radius">
      <q-toolbar style="min-height: 60px; height: 60px;" class="no-border-radius q-pa-none">
        <q-btn flat
          dense
          round
          icon="mdi-menu"
          v-if="$q.screen.lt.md"
          class="q-mx-xs-none q-ml-md"
          :color="$q.dark.isActive ? 'white' : ''"
          @click="$root.$emit('infor-cabecalo-chat:acao-menu')" />
        <q-item clickable
          v-ripple
          class="q-ma-none q-pa-none full"
          style="min-height: 60px; height: 60px; width: 300px;"
          @click="$root.$emit('update-ticket:info-contato')">
          <q-item-section avatar
            class="q-pl-sm">
            <q-btn round
              flat>
              <q-avatar class="bg-grey blur-effect">
                <q-img :src="getValue(cticket.contact, 'profilePicUrl')">
                </q-img>
              </q-avatar>
            </q-btn>
          </q-item-section>
          <q-item-section id="InfoCabecalhoChat">
            <q-item-label class="text-bold blur-effect">
              {{ getValue(cticket.contact, 'name') }}
              <q-skeleton v-if="!getValue(cticket.contact, 'name')"
                animation="none"
                style="width: 230px" />
            </q-item-label>
            <q-item-label caption
              lines="1"
              style="margin-top: 2px !important;"
              :style="$q.screen.width < 500 ? 'max-width: 170px' : ''">
              <span v-if="getValue(cticket.user, 'name')"> Atribuido à: {{ getValue(cticket.user, 'name') }} </span>
              <q-skeleton v-else
                type="text"
                class="text-caption"
                animation="none"
                style="width: 150px" />
            </q-item-label>
            <q-item-label lines="1"
              style="margin-top: 0px !important;">
              <span v-if="getValue(cticket.contact, 'name')"
                class=""
                style="font-size: 11px"> Ticket: {{ cticket.id }}</span>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-space />
        <div class="q-gutter-xs q-pr-sm" v-if="getValue(cticket.contact, 'name')">
          <template v-if="!$q.screen.xs">
            <q-btn @click="sairConversa" flat icon="mdi-exit-to-app" color="grey" class="bg-padrao btn-rounded">
              <q-tooltip content-class="bg-grey text-bold">
                Sair da Conversa
              </q-tooltip>
            </q-btn>
            <q-btn @click.stop="$emit('updateTicket:resolver')"
              color="green"
              flat
              class="bg-padrao btn-rounded"
              icon="mdi-comment-check"
              :disable="cticket.status == 'closed'">
              <q-tooltip content-class="bg-primary text-bold">
                Resolver
              </q-tooltip>
            </q-btn>

            <q-btn
              flat
              icon="mdi-dots-horizontal"
              color="primary"
              class="bg-padrao btn-rounded"
              @click="toggleMenu"
            >
              <q-tooltip content-class="bg-primary text-bold">
                Ações
              </q-tooltip>
            </q-btn>

            <q-menu v-model="menuVisible" auto-close>
              <q-card>
                <q-card-section>
                  <q-btn
                    @click.stop="$emit('updateTicket:reabrir')"
                    flat
                    autofocus
                    icon="mdi-reload"
                    color="primary"
                    class="bg-padrao btn-rounded"
                    :disable="cticket.status == 'open'"
                  >
                    <q-tooltip content-class="bg-primary text-bold">
                      Reabrir Ticket
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    @click="$emit('abrir:modalAgendamentoMensagem')"
                    v-if="ticketFocado.channel !== 'instagram' && ticketFocado.channel !== 'telegram'"
                    flat
                    icon="mdi-message-text-clock-outline"
                    color="primary"
                    class="bg-padrao btn-rounded"
                    :disable="cticket.status == 'closed'"
                  >
                    <q-tooltip content-class="bg-primary text-bold">
                      Agendamento de mensagem
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    @click="$emit('updateTicket:retornar')"
                    flat
                    icon="mdi-replay"
                    color="primary"
                    class="bg-padrao btn-rounded"
                    :disable="cticket.status == 'closed'"
                  >
                    <q-tooltip content-class="bg-primary text-bold">
                      Retornar Ticket para a Fila
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    @click="listarFilas"
                    flat
                    color="primary"
                    class="bg-padrao btn-rounded"
                    :disable="cticket.status == 'closed'"
                  >
                    <q-icon name="mdi-transfer" />
                    <q-tooltip content-class="bg-primary text-bold">
                      Transferir
                    </q-tooltip>
                  </q-btn>
                </q-card-section>
              </q-card>
            </q-menu>
          </template>

          <template v-else>
            <q-fab :disable="cticket.status == 'closed'"
              color="primary"
              flat
              dense
              class="bg-padrao text-bold"
              icon="keyboard_arrow_left"
              direction="down"
              padding="5px"
              label="Ações"
              :class="{ 'bg-black': $q.dark.isActive }">

              <q-fab-action @click="$emit('updateTicket:resolver')"
                color="primary"
                flat
                class="bg-padrao q-pa-xs"
                icon="mdi-comment-check"
                :class="{ 'bg-black': $q.dark.isActive }">
                <q-tooltip content-class="bg-primary text-bold">
                  Resolver
                </q-tooltip>
              </q-fab-action>

              <q-fab-action @click="$emit('updateTicket:retornar')"
                flat
                icon="mdi-replay"
                color="primary"
                class="bg-padrao q-pa-xs"
                :class="{ 'bg-black': $q.dark.isActive }">
                <q-tooltip content-class="bg-primary text-bold">
                  Retornar Ticket para a Fila
                </q-tooltip>
              </q-fab-action>

              <q-fab-action @click="listarFilas"
                flat
                color="primary"
                class="bg-padrao q-pa-xs "
                :class="{ 'bg-black-dark': $q.dark.isActive }">
                <q-icon name="mdi-transfer" />
                <q-tooltip content-class="bg-primary text-bold">
                  Transferir
                </q-tooltip>
              </q-fab-action>

              <q-fab-action @click="$emit('abrir:modalAgendamentoMensagem')"
                v-if="ticketFocado.channel !== 'waba'"
                flat
                color="primary"
                class="bg-padrao q-pa-xs "
                :class="{ 'bg-black': $q.dark.isActive }">
                <q-icon name="mdi-message-text-clock-outline" />
                <q-tooltip content-class="bg-primary text-bold">
                  Agendamento de mensagem
                </q-tooltip>
              </q-fab-action>
            </q-fab>
          </template>
        </div>
      </q-toolbar>
      <q-separator />
    </q-header>

    <q-dialog v-model="modalTransferirTicket"
      @hide="modalTransferirTicket = false"
      persistent>
      <q-card class="q-pa-md" style="width: 500px">
        <q-card-section>
          <div class="text-h6">Selecione o destino:</div>
        </q-card-section>
        <q-card-section>
          <q-select square
            outlined
            v-model="filaSelecionada"
            :options="filas"
            emit-value
            map-options
            option-value="id"
            option-label="queue"
            label="Fila de destino" />
        </q-card-section>
        <q-card-section>
          <q-select square
            outlined
            v-model="usuarioSelecionado"
            :options="usuarios.filter(filterUsers)"
            emit-value
            map-options
            option-value="id"
            option-label="name"
            label="Usuário destino" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            label="Sair"
            color="negative"
            v-close-popup
            class="q-mr-lg" />
          <q-btn
            label="Salvar"
            color="primary"
            @click="confirmarTransferenciaTicket" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { useInforCabecalhoChat } from 'src/composables/atendimento/useInforCabecalhoChat'

const props = defineProps({
  cticket: {
    type: Object,
    required: true
  }
})

const {
  menuVisible,
  modalTransferirTicket,
  usuarioSelecionado,
  filaSelecionada,
  usuarios,
  filas,
  ticketFocado,
  getValue,
  filterUsers,
  listarFilas,
  confirmarTransferenciaTicket,
  toggleMenu,
  sairConversa
} = useInforCabecalhoChat()

defineEmits([
  'updateTicket:resolver',
  'updateTicket:reabrir',
  'abrir:modalAgendamentoMensagem',
  'updateTicket:retornar',
  'removeFocusFromChat'
])
</script>

<style lang="scss" scoped>
</style>
