<template>
  <div class="attendance-header">
    <!-- Toolbar Principal -->
    <q-toolbar class="q-gutter-xs full-width toolbar-main">
      <!-- Dropdown do Usuário -->
      <q-btn-dropdown 
        no-caps 
        color="black" 
        class="text-bold user-dropdown" 
        ripple
      >
        <template #label>
          <div 
            :style="{ maxWidth: $q.screen.lt.sm ? '120px' : '' }" 
            class="ellipsis"
          >
            {{ username }}
          </div>
        </template>
        <q-list style="min-width: 100px">
          <q-item clickable v-close-popup @click="openUserProfile">
            <q-item-section>
              <q-item-label>
                <q-icon name="mdi-account" class="q-mr-sm" />
                Perfil
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="handleLogout">
            <q-item-section>
              <q-item-label>
                <q-icon name="mdi-logout" class="q-mr-sm" />
                Sair
              </q-item-label>
            </q-item-section>
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
        <q-tooltip>Retornar ao menu</q-tooltip>
      </q-btn>
    </q-toolbar>

    <!-- Status do WhatsApp -->
    <StatusWhatsapp 
      v-if="showWhatsappStatus" 
      class="q-mx-sm full-width" 
    />

    <!-- Barra de Pesquisa -->
    <q-toolbar 
      v-show="toolbarSearch" 
      class="row q-gutter-sm q-py-sm items-center search-toolbar"
    >
      <q-separator class="absolute-top" />
      
      <!-- Botão de Filtro -->
      <q-btn
        :icon="!hasActiveFilters ? 'mdi-filter-outline' : 'mdi-filter-plus'"
        class="btn-rounded"
        :color="hasActiveFilters ? 'deep-orange-9' : 'primary'"
      >
        <q-menu 
          content-class="shadow-10 no-scroll" 
          square
          transition-show="jump-down"
          transition-hide="jump-up"
        >
          <AtendimentoFiltros @filter="handleSearch" />
        </q-menu>
        <q-tooltip>Filtro Avançado</q-tooltip>
      </q-btn>

      <!-- Campo de Pesquisa -->
      <q-input
        v-model="searchParam"
        dense
        outlined
        rounded
        type="search"
        class="col-grow search-input"
        placeholder="Pesquisar tickets..."
        :debounce="700"
        @update:model-value="handleSearch"
      >
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>

      <!-- Botão de Contatos -->
      <q-btn
        color="primary"
        class="btn-rounded"
        icon="mdi-book-account-outline"
        @click="openContacts"
      >
        <q-tooltip>Contatos</q-tooltip>
      </q-btn>

      <q-separator class="absolute-bottom" />
    </q-toolbar>
  </div>
</template>

<script setup>
/**
 * Componente de cabeçalho do atendimento
 * @component
 * @description Fornece interface para pesquisa, filtros e navegação no atendimento
 */

import { useAttendanceHeader } from '../../composables/atendimento/useAttendanceHeader'
import StatusWhatsapp from '../sessao-whatsapp/StatusWhatsapp.vue'
import AtendimentoFiltros from './AttendanceFilters.vue'

/**
 * Props do componente
 */
const props = defineProps({
  /** Controla a exibição do status do WhatsApp */
  showWhatsappStatus: {
    type: Boolean,
    default: false
  },
  /** Controla a exibição da barra de pesquisa */
  toolbarSearch: {
    type: Boolean,
    default: true
  }
})

/**
 * Eventos que o componente pode emitir
 */
const emit = defineEmits(['search', 'logout', 'openProfile', 'openNewTicketModal'])

/**
 * Composable com a lógica do header
 */
const {
  username,
  searchParam,
  hasActiveFilters,
  handleSearch,
  handleLogout,
  openUserProfile,
  goToDashboard,
  openContacts
} = useAttendanceHeader(emit)
</script>

<style lang="scss" scoped>
.attendance-header {
  // Toolbar principal
  .toolbar-main {
    height: 64px;
    border-bottom: 1px solid $grey-4;
    transition: all 0.3s ease;
  }

  // Dropdown do usuário
  .user-dropdown {
    border-radius: 24px;
    padding: 0 12px;
    transition: background-color 0.3s ease;

    :deep(.q-btn__content) {
      text-transform: none;
    }

    &:hover {
      background-color: $grey-2;
    }
  }

  // Barra de pesquisa
  .search-toolbar {
    position: relative;
    background: $grey-1;
    transition: all 0.3s ease;

    .search-input {
      :deep(.q-field__control) {
        height: 40px;
        transition: border-color 0.3s ease;

        &:hover {
          border-color: $primary;
        }
      }
    }

    // Botões arredondados
    .btn-rounded {
      border-radius: 50%;
      width: 40px;
      height: 40px;
      padding: 0;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.05);
        opacity: 0.9;
      }
    }

    // Tooltips
    :deep(.q-tooltip) {
      font-size: 12px;
      background: $grey-9;
      color: white;
      border-radius: 4px;
      padding: 4px 8px;
    }

    // Responsividade
    @media (max-width: 599px) {
      .toolbar-main {
        height: 56px;
      }

      .search-input {
        :deep(.q-field__control) {
          height: 36px;
        }
      }

      .btn-rounded {
        width: 36px;
        height: 36px;
      }
    }
  }
}
</style>
