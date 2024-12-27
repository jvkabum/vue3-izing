<template>
  <q-dialog
    :value="modalNovoTicket"
    persistent
    @hide="fecharModal"
  >
    <q-card
      class="q-pa-md"
      style="width: 500px"
    >
      <q-card-section>
        <div class="text-h6">Criar Ticket</div>
      </q-card-section>
      <q-card-section>
        <q-select
          ref="selectAutoCompleteContato"
          autofocus
          square
          outlined
          filled
          hide-dropdown-icon
          :loading="loading"
          v-model="contatoSelecionado"
          :options="contatos"
          input-debounce="700"
          @filter="localizarContato"
          use-input
          hide-selected
          fill-input
          option-label="name"
          option-value="id"
          label="Localizar Contato"
          hint="Digite no mínimo duas letras para localizar o contato."
        >
          <template v-slot:before-options>
            <q-btn
              color="primary"
              no-caps
              padding
              ripple
              class="full-width no-border-radius"
              outline
              icon="add"
              label="Adicionar Contato"
              @click="modalContato = true"
            />
          </template>
          <template v-slot:option="scope">
            <q-item
              v-bind="scope.itemProps"
              v-on="scope.itemEvents"
              v-if="scope.opt.name"
            >
              <q-item-section>
                <q-item-label>{{ scope.opt.name }}</q-item-label>
                <q-item-label caption>{{ scope.opt.number }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>
      <q-card-actions
        align="right"
        class="q-pr-md"
      >
        <q-btn
          label="Sair"
          color="negative"
          v-close-popup
          class="q-px-md q-mr-lg"
        />
        <q-btn
          label="Salvar"
          class="q-px-md"
          color="primary"
          @click="criarTicket"
        />
      </q-card-actions>
    </q-card>
    <ContatoModal
      v-model="modalContato"
      @contatoModal:contato-criado="contatoCriadoNotoTicket"
    />
  </q-dialog>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useStore } from 'vuex'
import { ListarContatos } from 'src/service/contatos'
import { CriarTicket } from 'src/service/tickets'
import ContatoModal from 'src/pages/contatos/ContatoModal'

defineProps({
  modalNovoTicket: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modalNovoTicket'])

const userId = +localStorage.getItem('userId')
const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const store = useStore()

const ticket = ref({})
const contatoSelecionado = ref(null)
const contatos = ref([])
const modalContato = ref(false)
const loading = ref(false)
const selectAutoCompleteContato = ref(null)

const fecharModal = () => {
  ticket.value = {}
  contatoSelecionado.value = null
  emit('update:modalNovoTicket', false)
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
    if (data.contacts.length) {
      contatos.value = data.contacts
    } else {
      contatos.value = [{}]
    }
  })
  loading.value = false
}

const contatoCriadoNotoTicket = contato => {
  contatoSelecionado.value = contato
  criarTicket()
}

const criarTicket = async () => {
  if (!contatoSelecionado.value?.id) return
  loading.value = true
  try {
    const { data: ticket } = await CriarTicket({
      contactId: contatoSelecionado.value.id,
      isActiveDemand: true,
      userId,
      status: 'open'
    })
    await store.commit('SET_HAS_MORE', true)
    await store.dispatch('AbrirChatMensagens', ticket)
    $q.notify({
      message: `Atendimento Iniciado || ${ticket.contact.name} - Ticket: ${ticket.id}`,
      type: 'positive',
      progress: true,
      position: 'top',
      actions: [{
        icon: 'close',
        round: true,
        color: 'white'
      }]
    })
    fecharModal()
    if (route.name !== 'atendimento') {
      router.push({ name: 'atendimento' })
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: 'Ocorreu um erro ao iniciar o atendimento!',
      caption: error.message
    })
  }
  loading.value = false
}

onUnmounted(() => {
  contatoSelecionado.value = null
})
</script>

<style lang="scss" scoped>
</style>
