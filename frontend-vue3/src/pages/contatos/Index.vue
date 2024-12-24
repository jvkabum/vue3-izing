<template>
  <div class="contatos-page">
    <q-table
      class="my-sticky-dynamic"
      title="Contatos"
      :id="`tabela-contatos-${isChatContact ? 'atendimento' : ''}`"
      :data="contacts"
      :columns="columns"
      :loading="loading"
      row-key="id"
      virtual-scroll
      :virtual-scroll-item-size="48"
      :virtual-scroll-sticky-size-start="48"
      :pagination="pagination"
      :rows-per-page-options="[0]"
      @virtual-scroll="onScroll"
      :bordered="isChatContact"
      :square="isChatContact"
      :flat="isChatContact"
      :separator="isChatContact ? 'vertical' : 'horizontal'"
      :class="{
        'q-ma-lg': !isChatContact,
        'q-ml-md heightChat': isChatContact
      }"
    >
      <!-- Cabeçalho da Tabela -->
      <template #top>
        <div class="row full-width items-center q-col-gutter-md">
          <!-- Título -->
          <div class="col-auto">
            <q-btn
              v-if="isChatContact"
              flat
              round
              color="black"
              icon="mdi-close"
              @click="$router.push({ name: 'chat-empty' })"
            >
              <q-tooltip>Fechar</q-tooltip>
            </q-btn>
            <span class="text-h6">Contatos</span>
          </div>

          <!-- Busca -->
          <q-input
            v-model="filter"
            dense
            outlined
            rounded
            debounce="500"
            class="col-grow"
            placeholder="Buscar contatos..."
            @update:model-value="filtrarContato"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
            <template #append v-if="filter">
              <q-icon
                name="close"
                class="cursor-pointer"
                @click="filter = ''; filtrarContato('')"
              />
            </template>
          </q-input>

          <!-- Botões de Ação -->
          <div class="col-auto">
            <q-btn-dropdown
              color="primary"
              label="Adicionar"
              rounded
              split
              class="glossy"
              @click="selectedContactId = null; modalContato = true"
            >
              <q-list>
                <q-item
                  clickable
                  v-close-popup
                  @click="handleImportWhatsapp"
                >
                  <q-item-section>
                    <q-item-label>Importar do WhatsApp</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-close-popup
                  @click="modalImportarContatos = true"
                >
                  <q-item-section>
                    <q-item-label>Importar CSV</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-close-popup
                  @click="handleExportContacts"
                >
                  <q-item-section>
                    <q-item-label>Exportar Contatos</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
        </div>
      </template>

      <!-- Coluna de Avatar -->
      <template #body-cell-profilePicUrl="props">
        <q-td>
          <q-avatar class="contact-avatar">
            <template v-if="props.value">
              <q-img :src="props.value">
                <template #error>
                  <q-icon name="mdi-account" size="1.5em" color="grey-5" />
                </template>
              </q-img>
            </template>
            <template v-else>
              <q-icon name="mdi-account" size="1.5em" color="grey-5" />
            </template>
          </q-avatar>
        </q-td>
      </template>

      <!-- Coluna de Ações -->
      <template #body-cell-acoes="props">
        <q-td class="text-center">
          <div class="row justify-center q-gutter-sm">
            <!-- WhatsApp -->
            <q-btn
              v-if="props.row.number"
              flat
              round
              icon="img:whatsapp-logo.png"
              @click="handleSaveTicket(props.row, 'whatsapp')"
            >
              <q-tooltip>Iniciar conversa no WhatsApp</q-tooltip>
            </q-btn>

            <!-- Instagram -->
            <q-btn
              v-if="props.row.instagramPK"
              flat
              round
              icon="img:instagram-logo.png"
              @click="handleSaveTicket(props.row, 'instagram')"
            >
              <q-tooltip>Iniciar conversa no Instagram</q-tooltip>
            </q-btn>

            <!-- Telegram -->
            <q-btn
              v-if="props.row.telegramId"
              flat
              round
              icon="img:telegram-logo.png"
              @click="handleSaveTicket(props.row, 'telegram')"
            >
              <q-tooltip>Iniciar conversa no Telegram</q-tooltip>
            </q-btn>

            <!-- Editar -->
            <q-btn
              flat
              round
              icon="edit"
              color="warning"
              @click="editContact(props.row.id)"
            >
              <q-tooltip>Editar contato</q-tooltip>
            </q-btn>

            <!-- Excluir -->
            <q-btn
              flat
              round
              icon="delete"
              color="negative"
              @click="deleteContact(props.row.id)"
            >
              <q-tooltip>Excluir contato</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <!-- Paginação -->
      <template #pagination="scope">
        <div class="row items-center justify-end">
          <span class="q-mr-sm">
            {{ contacts.length }}/{{ scope.pagination.rowsNumber }}
          </span>
        </div>
      </template>

      <!-- Loading -->
      <template #loading>
        <q-inner-loading showing color="primary">
          <q-spinner-dots size="50px" color="primary" />
        </q-inner-loading>
      </template>
    </q-table>

    <!-- Modal de Contato -->
    <ContatoModal
      v-if="modalContato"
      v-model="modalContato"
      :contact-id="selectedContactId"
      @update:contact="updateContact"
    />

    <!-- Modal de Importação -->
    <ImportModal
      v-model="modalImportarContatos"
      :loading="loading"
      :tags="tags"
      :wallets="wallets"
      :etiquetas="etiquetas"
      :usuarios="usuarios"
      @import="handleImportCSV"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useContatos } from '../../composables/contatos/useContatos'
import ContatoModal from './ContatoModal.vue'
import ImportModal from './ImportModal.vue'

// Props
const props = defineProps({
  isChatContact: {
    type: Boolean,
    default: false
  }
})

// Composables
const {
  contacts,
  loading,
  filter,
  selectedContactId,
  modalContato,
  modalImportarContatos,
  file,
  isImportCSV,
  wallets,
  tags,
  etiquetas,
  usuarios,
  params,
  pagination,
  columns,
  listarContatos,
  listarUsuarios,
  listarEtiquetas,
  updateContact,
  deleteContact,
  filtrarContato,
  onScroll,
  handleSaveTicket
} = useContatos()

// Lifecycle
onMounted(() => {
  listarContatos()
  listarUsuarios()
  listarEtiquetas()
})
</script>

<style lang="scss" scoped>
.contatos-page {
  .my-sticky-dynamic {
    height: 85vh;

    // Cabeçalho fixo
    .q-table__top,
    .q-table__bottom,
    thead tr:first-child th {
      background-color: #fff;
      transition: background-color 0.3s ease;
    }

    thead tr th {
      position: sticky;
      z-index: 1;
    }

    thead tr:last-child th {
      top: 63px;
    }

    thead tr:first-child th {
      top: 0;
    }
  }

  // Avatar do contato
  .contact-avatar {
    border: 1px solid rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.1);
    }
  }

  // Altura específica para chat
  .heightChat {
    height: calc(100vh - 0px);

    .q-table__top {
      padding: 8px;
    }
  }

  // Ajustes para tabela de atendimento
  #tabela-contatos-atendimento {
    thead th {
      height: 55px;
    }
  }
}

// Tema escuro
:deep(.body--dark) {
  .my-sticky-dynamic {
    .q-table__top,
    .q-table__bottom,
    thead tr:first-child th {
      background-color: $dark;
    }
  }

  .contact-avatar {
    border-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
