<template>
  <div class="contact-list">
    <!-- Cabeçalho -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Contatos</div>
      <div class="row q-gutter-sm">
        <q-btn
          color="primary"
          icon="person_add"
          label="Novo Contato"
          @click="openContactDialog()"
        />
        <q-btn-dropdown color="secondary" label="Importar/Exportar">
          <q-list>
            <q-item clickable v-close-popup @click="importContacts">
              <q-item-section avatar>
                <q-icon name="upload_file" />
              </q-item-section>
              <q-item-section>Importar Contatos</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="exportContacts">
              <q-item-section avatar>
                <q-icon name="download" />
              </q-item-section>
              <q-item-section>Exportar Contatos</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <!-- Filtros e Busca -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="searchTerm"
          dense
          outlined
          placeholder="Buscar contatos..."
          clearable
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-8 row q-col-gutter-sm">
        <div class="col">
          <q-select
            v-model="selectedTags"
            :options="availableTags"
            outlined
            dense
            multiple
            label="Tags"
            use-chips
          />
        </div>
        <div class="col">
          <q-select
            v-model="selectedGroups"
            :options="availableGroups"
            outlined
            dense
            multiple
            label="Grupos"
            use-chips
          />
        </div>
      </div>
    </div>

    <!-- Lista de Contatos -->
    <div class="contacts-table">
      <q-table
        :rows="filteredContacts"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination.sync="pagination"
        :filter="searchTerm"
      >
        <!-- Slots personalizados para colunas -->
        <template v-slot:body-cell-avatar="props">
          <q-td :props="props">
            <q-avatar size="32px">
              <img :src="props.row.profileImage || 'default-avatar.png'" />
            </q-avatar>
          </q-td>
        </template>

        <template v-slot:body-cell-tags="props">
          <q-td :props="props">
            <q-chip
              v-for="tag in props.row.tags"
              :key="tag.id"
              :color="tag.color"
              text-color="white"
              size="sm"
              class="q-mr-xs"
            >
              {{ tag.name }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div class="row items-center justify-end q-gutter-sm">
              <q-btn
                flat
                round
                color="primary"
                icon="chat"
                size="sm"
                @click="startChat(props.row)"
              >
                <q-tooltip>Iniciar conversa</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="primary"
                icon="edit"
                size="sm"
                @click="openContactDialog(props.row)"
              >
                <q-tooltip>Editar contato</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                size="sm"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>Excluir contato</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Dialog de Contato -->
    <contact-dialog
      v-model="showContactDialog"
      :contact="selectedContact"
      @save="saveContact"
    />

    <!-- Dialog de Importação -->
    <import-dialog
      v-model="showImportDialog"
      @import="handleImport"
    />

    <!-- Dialog de Confirmação -->
    <q-dialog v-model="showConfirmDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span class="q-ml-sm">Deseja realmente excluir este contato?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Excluir" color="negative" @click="deleteContact" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useContacts } from '../../composables/contatos/useContacts'
import { useNotificationSystem } from '../../composables/sistema/useNotificationSystem'
import ContactDialog from './ContactDialog.vue'
import ImportDialog from './ImportDialog.vue'

// Composables
const { 
  contacts,
  loading,
  error,
  createContact,
  updateContact,
  deleteContact: removeContact,
  importContacts: importContactsList,
  exportContacts: exportContactsList
} = useContacts()

const { notifySuccess, notifyError } = useNotificationSystem()

// Estado
const searchTerm = ref('')
const selectedTags = ref([])
const selectedGroups = ref([])
const showContactDialog = ref(false)
const showImportDialog = ref(false)
const showConfirmDialog = ref(false)
const selectedContact = ref(null)
const contactToDelete = ref(null)

// Configuração da tabela
const columns = [
  {
    name: 'avatar',
    label: '',
    field: 'profileImage',
    align: 'left',
    sortable: false
  },
  {
    name: 'name',
    required: true,
    label: 'Nome',
    align: 'left',
    field: row => row.name,
    sortable: true
  },
  {
    name: 'phone',
    label: 'Telefone',
    field: 'phone',
    sortable: true
  },
  {
    name: 'email',
    label: 'Email',
    field: 'email',
    sortable: true
  },
  {
    name: 'tags',
    label: 'Tags',
    field: 'tags',
    sortable: false
  },
  {
    name: 'actions',
    label: 'Ações',
    field: 'actions',
    align: 'right',
    sortable: false
  }
]

const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 10
})

// Computed
const filteredContacts = computed(() => {
  let filtered = [...contacts.value]

  if (selectedTags.value.length) {
    filtered = filtered.filter(contact => 
      contact.tags.some(tag => selectedTags.value.includes(tag.id))
    )
  }

  if (selectedGroups.value.length) {
    filtered = filtered.filter(contact =>
      contact.groups.some(group => selectedGroups.value.includes(group.id))
    )
  }

  return filtered
})

const availableTags = computed(() => {
  const tags = new Set()
  contacts.value.forEach(contact => {
    contact.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags)
})

const availableGroups = computed(() => {
  const groups = new Set()
  contacts.value.forEach(contact => {
    contact.groups.forEach(group => groups.add(group))
  })
  return Array.from(groups)
})

// Métodos
const openContactDialog = (contact = null) => {
  selectedContact.value = contact
  showContactDialog.value = true
}

const saveContact = async (contactData) => {
  try {
    if (contactData.id) {
      await updateContact(contactData)
      notifySuccess('Contato atualizado com sucesso')
    } else {
      await createContact(contactData)
      notifySuccess('Contato criado com sucesso')
    }
    showContactDialog.value = false
  } catch (err) {
    notifyError('Erro ao salvar contato')
  }
}

const confirmDelete = (contact) => {
  contactToDelete.value = contact
  showConfirmDialog.value = true
}

const deleteContact = async () => {
  try {
    await removeContact(contactToDelete.value.id)
    notifySuccess('Contato excluído com sucesso')
  } catch (err) {
    notifyError('Erro ao excluir contato')
  }
}

const importContacts = () => {
  showImportDialog.value = true
}

const handleImport = async (file) => {
  try {
    await importContactsList(file)
    notifySuccess('Contatos importados com sucesso')
    showImportDialog.value = false
  } catch (err) {
    notifyError('Erro ao importar contatos')
  }
}

const exportContacts = async () => {
  try {
    await exportContactsList()
    notifySuccess('Contatos exportados com sucesso')
  } catch (err) {
    notifyError('Erro ao exportar contatos')
  }
}

const startChat = (contact) => {
  // Implementar lógica para iniciar chat
}

// Lifecycle
onMounted(async () => {
  try {
    await loadContacts()
  } catch (err) {
    notifyError('Erro ao carregar contatos')
  }
})
</script>

<style lang="scss" scoped>
.contact-list {
  padding: 20px;

  .contacts-table {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
  }
}

.dark {
  .contacts-table {
    background: $dark;
  }
}
</style>
