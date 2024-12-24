<template>
  <div class="bg-white no-scroll hide-scrollbar overflow-hidden" :style="style">
    <InforCabecalhoChat
      @updateTicket:resolver="atualizarStatusTicket('closed')"
      @updateTicket:retornar="atualizarStatusTicket('pending')"
      @updateTicket:reabrir="atualizarStatusTicket('open')"
      @abrir:modalAgendamentoMensagem="modalAgendamentoMensagem = true"
    />

    <q-scroll-area ref="scrollContainer" class="scroll-y" :style="cStyleScroll" @scroll="scrollArea">
      <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
        <infinite-loading
          v-if="cMessages.length"
          @infinite="onLoadMore"
          direction="top"
          :identificador="ticketFocado.id"
          spinner="spiral"
        >
          <div slot="no-results">
            <div v-if="!cMessages.length">Sem resultados :(</div>
          </div>
          <div slot="no-more">Nada mais a carregar :)</div>
        </infinite-loading>
      </transition>
      <MensagemChat
        :replyingMessage.sync="replyingMessage"
        :mensagens="cMessages"
        v-if="cMessages.length && ticketFocado.id"
        @mensagem-chat:encaminhar-mensagem="abrirModalEncaminharMensagem"
        :ativarMultiEncaminhamento.sync="ativarMultiEncaminhamento"
        :mensagensParaEncaminhar.sync="mensagensParaEncaminhar"
      />
      <div id="inicioListaMensagensChat"></div>
    </q-scroll-area>

    <div v-if="!ticketFocado.id" class="absolute-center items-center">
      <q-icon
        style="margin-left: 30vw"
        size="6em"
        color="grey-6"
        name="mdi-emoticon-wink-outline"
        class="row col text-center"
      />
      <h1 class="text-grey-6 row col justify-center">Selecione um ticket!</h1>
    </div>

    <div v-if="cMessages.length" class="relative-position">
      <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
        <div v-if="scrollIcon">
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

    <q-footer class="bg-white">
      <q-separator class="bg-grey-4" />
      <q-list v-if="replyingMessage" class="q-pa-none q-py-md text-black row items-center col justify-center full-width">
        <q-item class="q-card--bordered q-pb-sm btn-rounded" :style="`width: 460px; min-width: 460px; max-width: 460px; max-height: 110px;`">
          <q-item-section>
            <q-item-label v-if="!replyingMessage.fromMe" caption>
              {{ replyingMessage.contact && replyingMessage.contact.name }}
            </q-item-label>
            <q-item-label lines="4" v-html="farmatarMensagemWhatsapp(replyingMessage.body)" />
          </q-item-section>
          <q-btn
            @click="replyingMessage = null"
            dense
            flat
            round
            icon="close"
            class="float-right absolute-top-right z-max"
            :disabled="loading || ticketFocado.status !== 'open'"
          />
        </q-item>
      </q-list>

      <q-banner class="text-grey-8" v-if="mensagensParaEncaminhar.length > 0">
        <span class="text-bold text-h5">{{ mensagensParaEncaminhar.length }} de 10 mensagens</span> selecionadas para serem encaminhadas.
        <q-separator class="bg-grey-4" />
        <q-select
          dense
          ref="selectAutoCompleteContato"
          autofocus
          outlined
          rounded
          hide-dropdown-icon
          :loading="loading"
          v-model="contatoSelecionado"
          :options="contatos"
          input-debounce="700"
          @filter="localizarContato"
          use-input
          hide-selected
          fill-input
          clearable
          option-label="name"
          option-value="id"
          label="Localize e selecione o contato"
          hint="Digite no mínimo duas letras para localizar o contato. É possível selecionar apenas 1 contato!"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps" v-on="scope.itemEvents" v-if="scope.opt.name">
              <q-item-section>
                <q-item-label>{{ scope.opt.name }}</q-item-label>
                <q-item-label caption>{{ scope.opt.number }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <template v-slot:action>
          <q-btn class="bg-padrao q-px-sm" flat color="negative" label="Cancelar" @click="cancelarMultiEncaminhamento" />
          <q-btn class="bg-padrao q-px-sm" flat color="positive" label="Enviar" icon="mdi-send" @click="confirmarEncaminhamentoMensagem(mensagensParaEncaminhar)" />
        </template>
      </q-banner>

      <InputMensagem
        v-if="!mensagensParaEncaminhar.length"
        :mensagensRapidas="mensagensRapidas"
        :replyingMessage.sync="replyingMessage"
      />
      <q-resize-observer @resize="onResizeInputMensagem" />
    </q-footer>

    <q-dialog v-model="modalAgendamentoMensagem" persistent>
      <q-card :style="$q.screen.width < 770 ? `min-width: 98vw; max-width: 98vw` : 'min-width: 50vw; max-width: 50vw'">
        <q-card-section>
          <div class="text-h6">
            Agendamento de Mensagem
            <q-btn flat class="bg-padrao btn-rounded float-right" color="negative" icon="close" v-close-popup />
          </div>
        </q-card-section>
        <q-card-section class="q-mb-lg">
          <InputMensagem
            isScheduleDate
            :mensagensRapidas="mensagensRapidas"
            :replyingMessage.sync="replyingMessage"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="modalEncaminhamentoMensagem" persistent @hide="mensagemEncaminhamento = {}">
      <q-card :style="$q.screen.width < 770 ? `min-width: 98vw; max-width: 98vw` : 'min-width: 50vw; max-width: 50vw'">
        <q-card-section>
          <div class="text-h6">
            Encaminhando Mensagem
            <q-btn flat class="bg-padrao btn-rounded float-right" color="negative" icon="close" v-close-popup />
          </div>
        </q-card-section>
        <q-separator inset />
        <q-card-section>
          <MensagemChat
            :isShowOptions="false"
            :replyingMessage.sync="replyingMessage"
            :mensagens="[mensagemEncaminhamento]"
          />
        </q-card-section>
        <q-card-section>
          <q-select
            class="q-px-lg"
            ref="selectAutoCompleteContato"
            autofocus
            outlined
            rounded
            hide-dropdown-icon
            :loading="loading"
            v-model="contatoSelecionado"
            :options="contatos"
            input-debounce="700"
            @filter="localizarContato"
            use-input
            hide-selected
            fill-input
            clearable
            option-label="name"
            option-value="id"
            label="Localize e selecione o contato"
            hint="Digite no mínimo duas letras para localizar o contato. É possível selecionar apenas 1 contato!"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents" v-if="scope.opt.name">
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.number }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn class="bg-padrao q-px-sm" flat color="positive" label="Enviar" icon="mdi-send" @click="confirmarEncaminhamentoMensagem([mensagemEncaminhamento])" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import InforCabecalhoChat from './InforCabecalhoChat.vue'
import MensagemChat from './MensagemChat.vue'
import InputMensagem from './InputMensagem.vue'
import { ListarContatos } from 'src/service/contatos'
import { EncaminharMensagem } from 'src/service/tickets'

const scrollIcon = ref(false)
const loading = ref(false)
const modalAgendamentoMensagem = ref(false)
const modalEncaminhamentoMensagem = ref(false)
const replyingMessage = ref(null)
const mensagensParaEncaminhar = ref([])
const ativarMultiEncaminhamento = ref(false)
const contatoSelecionado = ref({ id: '', name: '' })
const contatos = ref([])

const cMessages = computed(() => {
  // Lógica para retornar mensagens
  return [] // Substituir pela lógica real
})

const style = computed(() => {
  return {
    backgroundImage: 'url(../assets/wa-background.png)',
    backgroundPosition: 'center'
  }
})

const cStyleScroll = computed(() => {
  return `min-height: calc(100vh - 62px); height: calc(100vh - 62px); width: 100%`
})

const onLoadMore = async (infiniteState) => {
  if (loading.value) return
  loading.value = true
  // Lógica para carregar mais mensagens
  infiniteState.loaded()
  loading.value = false
}

const scrollArea = (e) => {
  // Lógica para scroll
}

const scrollToBottom = () => {
  document.getElementById('inicioListaMensagensChat').scrollIntoView()
}

const abrirModalEncaminharMensagem = (msg) => {
  replyingMessage.value = msg
  modalEncaminhamentoMensagem.value = true
}

const localizarContato = async (search, update, abort) => {
  if (search.length < 2) {
    if (contatos.value.length) update(() => { contatos.value = [...contatos.value] })
    abort()
    return
  }
  loading.value = true
  const { data } = await ListarContatos({ searchParam: search })
  update(() => {
    contatos.value = data.contacts.length ? data.contacts : [{}]
  })
  loading.value = false
}

const cancelarMultiEncaminhamento = () => {
  mensagensParaEncaminhar.value = []
  ativarMultiEncaminhamento.value = false
}

const confirmarEncaminhamentoMensagem = async (data) => {
  if (!contatoSelecionado.value.id) {
    Notify.create({ type: 'negative', message: 'Selecione o contato de destino das mensagens.' })
    return
  }
  try {
    await EncaminharMensagem(data, contatoSelecionado.value)
    Notify.create({ type: 'positive', message: `Mensagem encaminhada para ${contatoSelecionado.value.name}` })
    mensagensParaEncaminhar.value = []
    ativarMultiEncaminhamento.value = false
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Não foi possível encaminhar mensagem. Tente novamente.' })
  }
}
</script>

<style lang="scss">
/* Estilos do componente */
</style>
