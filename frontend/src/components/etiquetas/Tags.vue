<template>
  <q-card class="tags-manager">
    <q-card-section>
      <!-- Header -->
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">{{ title }}</div>
        <q-btn
          icon="add"
          :label="addButtonLabel"
          color="primary"
          :disable="loading"
          @click="openAddDialog"
        />
      </div>

      <q-separator class="q-mb-md" />

      <!-- Search and Filters -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-8">
          <q-input
            v-model="searchTerm"
            :label="searchLabel"
            outlined
            dense
            clearable
            debounce="300"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-sm-4">
          <q-select
            v-model="filters.isActive"
            :options="statusOptions"
            label="Status"
            outlined
            dense
            emit-value
            map-options
            clearable
            @update:model-value="handleFilterChange"
          />
        </div>
      </div>

      <!-- Tag List -->
      <tag-list
        :tags="filteredTags"
        :loading="loading"
        :error="error"
        :search-term="searchTerm"
        @edit="openEditDialog"
        @delete="handleDelete"
        @retry="loadTags"
      />
    </q-card-section>

    <!-- Tag Form Dialog -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 400px; max-width: 600px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ dialogTitle }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <tag-form
            :tag="editingTag || {}"
            :available-colors="availableColors"
            :loading="loading"
            @submit="handleSubmit"
            @cancel="closeDialog"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteConfirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span class="q-ml-sm">
            {{ deleteConfirmMessage }}
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancelar"
            color="primary"
            v-close-popup
            :disable="loading"
          />
          <q-btn
            flat
            label="Excluir"
            color="negative"
            :loading="loading"
            @click="confirmDelete"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTagsManager } from '@/composables/tags'
import { TagList, TagForm } from '@/components/tags'
import type { Tag, TagFormData } from '@/types/tags'

// Props
const props = withDefaults(defineProps<{
  title?: string
  addButtonLabel?: string
  searchLabel?: string
  deleteConfirmMessage?: string
  showInactiveFilter?: boolean
}>(), {
  title: 'Gerenciar Tags',
  addButtonLabel: 'Nova Tag',
  searchLabel: 'Buscar Tag',
  deleteConfirmMessage: 'Tem certeza que deseja excluir esta tag?',
  showInactiveFilter: true
})

// Composables
const {
  tags,
  loading,
  error,
  searchTerm,
  showDialog,
  editingTag,
  tagForm,
  filteredTags,
  isEditing,
  dialogTitle,
  availableColors,
  loadTags,
  openAddDialog,
  openEditDialog,
  closeDialog,
  handleSubmit,
  handleDeleteTag
} = useTagsManager()

// Local state
const showDeleteConfirm = ref(false)
const tagToDelete = ref<Tag | null>(null)
const filters = ref({
  isActive: null as boolean | null
})

// Computed
const statusOptions = computed(() => [
  { label: 'Todas', value: null },
  { label: 'Ativas', value: true },
  { label: 'Inativas', value: false }
])

// Methods
const handleDelete = (tag: Tag) => {
  tagToDelete.value = tag
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!tagToDelete.value) return

  try {
    await handleDeleteTag(tagToDelete.value.id)
    showDeleteConfirm.value = false
    tagToDelete.value = null
  } catch (error) {
    console.error('Error deleting tag:', error)
  }
}

const handleFilterChange = () => {
  loadTags({ isActive: filters.value.isActive })
}

// Initialize
loadTags()
</script>

<style lang="scss" scoped>
.tags-manager {
  height: 100%;
  display: flex;
  flex-direction: column;

  .q-card__section {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  :deep(.tag-list) {
    flex: 1;
    overflow: hidden;
  }
}

// Dark mode support
.body--dark {
  .tags-manager {
    :deep(.q-separator) {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

// Responsive
@media (max-width: 599px) {
  .tags-manager {
    .text-h6 {
      font-size: 1.1rem;
    }
  }
}
</style>
