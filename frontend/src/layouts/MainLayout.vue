<template>
  <q-layout view="hHh Lpr lFf">
    <q-header class="bg-white text-grey-8 q-py-xs" height-hint="58" bordered>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
          icon="menu"
        >
          <q-tooltip>Menu</q-tooltip>
        </q-btn>

        <q-btn flat no-caps no-wrap dense class="q-ml-sm" v-if="$q.screen.gt.xs">
          <q-img
            src="/logo.png"
            spinner-color="primary"
            style="height: 50px; width: 140px"
          />
        </q-btn>

        <q-space />

        <div class="q-gutter-sm row items-center no-wrap">
          <div v-if="userProfile === 'admin' || userProfile === 'user'">
            <q-btn round dense flat color="grey-8" icon="notifications">
              <q-badge
                color="red"
                text-color="white"
                floating
                v-if="totalNotifications > 0"
              >
                {{ totalNotifications }}
              </q-badge>
              <q-menu>
                <q-list style="min-width: 300px">
                  <q-item v-if="totalNotifications === 0">
                    <q-item-section style="cursor: pointer">
                      Nada de novo por aqui!
                    </q-item-section>
                  </q-item>
                  <q-item v-if="notifications_p.count > 0">
                    <q-item-section
                      avatar
                      @click="() => router.push({ name: 'atendimento' })"
                      style="cursor: pointer"
                    >
                      <q-avatar
                        style="width: 60px; height: 60px"
                        color="blue"
                        text-color="white"
                      >
                        {{ notifications_p.count }}
                      </q-avatar>
                    </q-item-section>
                    <q-item-section
                      @click="() => router.push({ name: 'atendimento' })"
                      style="cursor: pointer"
                    >
                      Clientes pendentes na fila
                    </q-item-section>
                  </q-item>
                  <q-item
                    v-for="ticket in notifications.tickets"
                    :key="ticket.id"
                    style="border-bottom: 1px solid #ddd; margin: 5px"
                  >
                    <q-item-section
                      avatar
                      @click="abrirAtendimentoExistente(ticket.name, ticket)"
                      style="cursor: pointer"
                    >
                      <q-avatar style="width: 60px; height: 60px">
                        <img :src="ticket.profilePicUrl" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section
                      @click="abrirAtendimentoExistente(ticket.name, ticket)"
                      style="cursor: pointer"
                    >
                      <q-list>
                        <q-item
                          style="text-align: center; font-size: 17px; font-weight: bold; min-height: 0"
                        >
                          {{ ticket.name }}
                        </q-item>
                        <q-item style="min-height: 0; padding-top: 0">
                          <b>Mensagem: </b> {{ ticket.lastMessage }}
                        </q-item>
                      </q-list>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
              <q-tooltip>Notificações</q-tooltip>
            </q-btn>
            <q-toggle
              size="xl"
              keep-color
              dense
              class="text-bold q-ml-xs"
              :icon-color="$q.dark.isActive ? 'black' : 'white'"
              :value="$q.dark.isActive"
              :color="$q.dark.isActive ? 'grey-3' : 'black'"
              checked-icon="mdi-white-balance-sunny"
              unchecked-icon="mdi-weather-sunny"
              @input="setConfigsUsuario({ isDark: !$q.dark.isActive })"
            >
              <q-tooltip content-class="text-body1 hide-scrollbar">
                {{ $q.dark.isActive ? "Desativar" : "Ativar" }} Modo Escuro (Dark
                Mode)
              </q-tooltip>
            </q-toggle>
            <q-avatar
              :color="usuario.status === 'offline' ? 'negative' : 'positive'"
              text-color="white"
              size="25px"
              :icon="
                usuario.status === 'offline'
                  ? 'mdi-account-off'
                  : 'mdi-account-check'
              "
              rounded
              class="q-ml-lg"
            >
              <q-tooltip>
                {{
                  usuario.status === "offline"
                    ? "Usuário Offiline"
                    : "Usuário Online"
                }}
              </q-tooltip>
            </q-avatar>
          </div>
          <q-btn round flat class="bg-padrao text-bold q-mx-sm q-ml-lg">
            <q-avatar size="26px">
              {{ iniciaisString(username) }}
            </q-avatar>
            <q-menu>
              <q-list style="min-width: 100px">
                <q-item-label header>
                  Olá! <b> {{ username }} </b>
                </q-item-label>

                <cStatusUsuario
                  @update:usuario="atualizarUsuario"
                  :usuario="usuario"
                />
                <q-item clickable v-close-popup @click="abrirModalUsuario">
                  <q-item-section>Perfil</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="efetuarLogout">
                  <q-item-section>Sair</q-item-section>
                </q-item>
                <q-separator />
                <q-item>
                  <q-item-section>
                    <cSystemVersion />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
            <q-tooltip>Usuário</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :mini="miniState"
      @mouseover="miniState = false"
      @mouseout="miniState = true"
      mini-to-overlay
      content-class="bg-white text-grey-9"
    >
      <q-scroll-area class="fit">
        <q-list padding :key="userProfile">
          <div v-if="userProfile === 'admin' || userProfile === 'user'">
            <EssentialLink
              v-for="item in menuData"
              :key="item.title"
              v-bind="item"
            />
          </div>
          <div v-if="userProfile === 'admin'">
            <q-separator spaced />
            <div class="q-mb-lg"></div>
            <template v-for="item in menuDataAdmin">
              <EssentialLink
                v-if="exibirMenuBeta(item)"
                :key="item.title"
                v-bind="item"
              />
            </template>
          </div>
          <div v-if="userProfile === 'super'">
            <div class="q-mb-lg"></div>
            <template v-for="item in menuDataSuper">
              <EssentialLink
                v-if="exibirMenuBeta(item)"
                :key="item.title"
                v-bind="item"
              />
            </template>
          </div>
        </q-list>
      </q-scroll-area>
      <div
        class="absolute-bottom text-center row justify-start"
        :class="{ 'bg-grey-3': $q.dark.isActive }"
        style="height: 40px"
      ></div>
    </q-drawer>

    <q-page-container>
      <q-page class="q-pa-xs">
        <router-view />
      </q-page>
    </q-page-container>

    <audio ref="audioNotification" v-if="userProfile === 'admin' || userProfile === 'user'">
      <source :src="alertSound" type="audio/mp3" />
    </audio>

    <ModalUsuario
      :isProfile="true"
      v-model:modalUsuario="modalUsuario"
      v-model:usuarioEdicao="usuario"
    />
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useStore } from 'vuex'
import { format } from 'date-fns'
import { socketIO } from 'src/utils/socket'

// Componentes
import cSystemVersion from '../components/cSystemVersion.vue'
import EssentialLink from 'components/EssentialLink.vue'
import ModalUsuario from 'src/pages/usuarios/ModalUsuario'
import cStatusUsuario from '../components/cStatusUsuario.vue'

// Serviços
import { ListarWhatsapps } from 'src/service/sessoesWhatsapp'
import { ListarConfiguracoes } from 'src/service/configuracoes'
import { RealizarLogout } from 'src/service/login'
import { ConsultarTickets } from 'src/service/tickets'

// Assets
import alertSound from 'src/assets/sound.mp3'

// Composables e Utils
const router = useRouter()
const $q = useQuasar()
const store = useStore()
const socket = socketIO()

// Estado
const username = ref(localStorage.getItem('username'))
const domainExperimentalsMenus = ref(['@'])
const miniState = ref(true)
const userProfile = ref('user')
const modalUsuario = ref(false)
const usuario = ref({})
const leftDrawerOpen = ref(false)
const countTickets = ref(0)
const ticketsList = ref([])

// Menus
const menuData = ref([
  {
    title: 'Painel de Controle',
    caption: '',
    icon: 'mdi-home',
    routeName: 'home-dashboard'
  },
  {
    title: 'Chat',
    caption: 'Lista de atendimentos',
    icon: 'mdi-whatsapp',
    routeName: 'atendimento'
  },
  {
    title: 'Contatos',
    caption: 'Lista de contatos',
    icon: 'mdi-contacts-outline',
    routeName: 'contatos'
  }
])

const menuDataAdmin = ref([
  {
    title: 'Conexões',
    caption: 'Canais de Comunicação',
    icon: 'mdi-cellphone-wireless',
    routeName: 'sessoes'
  },
  // ... outros itens do menu admin
])

const menuDataSuper = ref([
  {
    title: 'Empresas',
    caption: 'Admin das Empresas',
    icon: 'mdi-office-building',
    routeName: 'empresassuper'
  },
  // ... outros itens do menu super
])

// Computed
const notifications = computed(() => store.getters.notifications)
const notifications_p = computed(() => store.getters.notifications_p)
const whatsapps = computed(() => store.getters.whatsapps)
const totalNotifications = computed(() => 
  parseInt(notifications.value.count) + parseInt(notifications_p.value.count)
)

const problemaConexao = computed(() => {
  return whatsapps.value.findIndex(w =>
    ['PAIRING', 'TIMEOUT', 'DISCONNECTED'].includes(w.status)
  ) !== -1
})

// Métodos
const exibirMenuBeta = (itemMenu) => {
  if (!itemMenu?.isBeta) return true
  return domainExperimentalsMenus.value.some(domain => 
    usuario.value.email.includes(domain)
  )
}

const listarWhatsapps = async () => {
  const { data } = await ListarWhatsapps()
  store.commit('LOAD_WHATSAPPS', data)
}

const handlerNotifications = (data) => {
  const { message, contact, ticket } = data

  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(
      `Mensagem de ${contact.name}`,
      {
        body: `${message.body} - ${format(new Date(), 'HH:mm')}`,
        icon: contact.profilePicUrl,
        tag: ticket.id,
        renotify: true
      }
    )

    notification.onclick = () => {
      window.focus()
      store.dispatch('AbrirChatMensagens', ticket)
      router.push({ name: 'atendimento' })
    }
  }
}

const abrirModalUsuario = () => {
  modalUsuario.value = true
}

const efetuarLogout = async () => {
  try {
    await RealizarLogout(usuario.value)
    const itemsToRemove = [
      'token', 'username', 'profile', 'userId',
      'queues', 'usuario', 'filtrosAtendimento'
    ]
    itemsToRemove.forEach(item => localStorage.removeItem(item))
    router.go({ name: 'login', replace: true })
  } catch (error) {
    console.error('Erro ao realizar logout:', error)
  }
}

const listarConfiguracoes = async () => {
  const { data } = await ListarConfiguracoes()
  localStorage.setItem('configuracoes', JSON.stringify(data))
}

const conectarSocket = (usuario) => {
  socket.on(`${usuario.tenantId}:chat:updateOnlineBubbles`, data => {
    store.commit('SET_USERS_APP', data)
  })
}

const atualizarUsuario = () => {
  usuario.value = JSON.parse(localStorage.getItem('usuario'))
  const event = usuario.value.status === 'offline' ? 'setUserIdle' : 'setUserActive'
  socket.emit(`${usuario.value.tenantId}:${event}`)
}

const consultarTickets = async () => {
  try {
    const params = {
      searchParam: '',
      pageNumber: 1,
      status: ['open'],
      showAll: false,
      count: null,
      queuesIds: [],
      withUnreadMessages: true,
      isNotAssignedUser: false,
      includeNotQueueDefined: true
    }
    
    const { data } = await ConsultarTickets(params)
    countTickets.value = data.count
    store.commit('UPDATE_NOTIFICATIONS', data)

    const params2 = { ...params, status: ['pending'], withUnreadMessages: false }
    const { data: dataPending } = await ConsultarTickets(params2)
    store.commit('UPDATE_NOTIFICATIONS_P', dataPending)
  } catch (err) {
    console.error('Erro ao consultar tickets:', err)
  }
}

// Lifecycle Hooks
onMounted(async () => {
  atualizarUsuario()
  await Promise.all([
    listarWhatsapps(),
    listarConfiguracoes(),
    consultarTickets()
  ])

  if ('Notification' in window) {
    Notification.requestPermission()
  }

  usuario.value = JSON.parse(localStorage.getItem('usuario'))
  userProfile.value = localStorage.getItem('profile')
  await conectarSocket(usuario.value)
})

onUnmounted(() => {
  socket.disconnect()
})
</script>

<style scoped>
.q-img__image {
  background-size: contain;
}
</style>
