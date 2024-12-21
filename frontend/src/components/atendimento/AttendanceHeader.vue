<template>
  <q-toolbar class="q-gutter-xs full-width" style="height: 64px">
    <!-- Dropdown Usuário -->
    <q-btn-dropdown no-caps color="black" class="text-bold btn-rounded" ripple>
      <template #label>
        <div :style="{ maxWidth: $q.screen.lt.sm ? '120px' : '' }" class="ellipsis">
          {{ username }}
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

    <!-- Botão Home -->
    <q-btn
      color="black"
      class="btn-rounded"
      icon="mdi-home"
      @click="goToDashboard"
    >
      <q-tooltip content-class="bg-padrao text-grey-9 text-bold">
        Retornar ao menu
      </q-tooltip>
    </q-btn>
  </q-toolbar>

  <!-- Status WhatsApp -->
  <StatusWhatsapp v-if="showWhatsappStatus" class="q-mx-sm full-width" />

  <!-- Barra de Pesquisa -->
  <q-toolbar v-show="toolbarSearch" class="row q-gutter-sm q-py-sm items-center">
    <q-separator class="absolute-top" />
    
    <!-- Botão Filtro -->
    <q-btn
      :icon="!hasActiveFilters ? 'mdi-filter-outline' : 'mdi-filter-plus'"
      class="btn-rounded"
      :color="hasActiveFilters ? 'deep-orange-9' : 'primary'"
    >
      <q-menu content-class="shadow-10 no-scroll" square>
        <AtendimentoFiltros />
      </q-menu>
      <q-tooltip content-class="bg-padrao text-grey-9 text-bold">
        Filtro Avançado
      </q-tooltip>
    </q-btn>

    <!-- Input Pesquisa -->
    <q-input
      v-model="searchParam"
      dense
      outlined
      rounded
      type="search"
      class="col-grow"
      :debounce="700"
      @input="handleSearch"
    >
      <template #append>
        <q-icon name="search" />
      </template>
    </q-input>

    <!-- Botão Contatos -->
    <q-btn
      color="primary"
      class="btn-rounded"
      icon="mdi-book-account-outline"
      @click="openContacts"
    >
      <q-tooltip content-class="bg-padrao text-grey-9 text-bold">
        Contatos
      </q-tooltip>
    </q-btn>

    <q-separator class="absolute-bottom" />
  </q-toolbar>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAtendimentoFilters } from '../../composables/useAtendimentoFilters'
import StatusWhatsapp from '../StatusWhatsapp.vue'
import AtendimentoFiltros from './AtendimentoFiltros.vue'

// Props
const props = defineProps({
  showWhatsappStatus: {
    type: Boolean,
    default: false
  },
  toolbarSearch: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['search', 'logout'])

// Composables
const $q = useQuasar()
const router = useRouter()
const { filterParams, hasActiveFilters } = useAtendimentoFilters()

// Estado
const username = ref(localStorage.getItem('username'))
const searchParam = computed({
  get: () => filterParams.value.searchParam,
  set: (value) => filterParams.value.searchParam = value
})

// Métodos
const handleSearch = () => {
  emit('search')
}

const handleLogout = () => {
  emit('logout')
}

const openUserProfile = () => {
  emit('openProfile')
}

const goToDashboard = () => {
  router.push({ name: 'home-dashboard' })
}

const openContacts = () => {
  if ($q.screen.lt.md) {
    emit('openNewTicketModal')
  } else {
    router.push({ name: 'chat-contatos' })
  }
}
</script>

<style lang="scss" scoped>
.btn-rounded {
  border-radius: 50%;
}
</style>
