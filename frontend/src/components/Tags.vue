<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">Gerenciar Tags</div>
      <q-separator />
      <q-input
        v-model="searchTerm"
        label="Buscar Tag"
        outlined
        dense
        class="q-mb-md"
      />
      <q-btn
        label="Adicionar Tag"
        color="primary"
        @click="openAddTagDialog"
      />
      <q-list>
        <q-item
          v-for="tag in filteredTags"
          :key="tag.id"
          @click="openEditTagDialog(tag.id)"
        >
          <q-item-section>
            <q-item-label>{{ tag.name }}</q-item-label>
            <q-item-label caption>{{ tag.color }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              flat
              icon="edit"
              @click.stop="openEditTagDialog(tag.id)"
            />
            <q-btn
              flat
              icon="delete"
              color="negative"
              @click.stop="deleteTag(tag.id)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTags } from '../composables/useTags'
import { useNotification } from '../composables/useNotification'

const { tags, loading, error, deleteTag, loadTags } = useTags()
const { notify } = useNotification()

// Estado
const searchTerm = ref('')

// Computed
const filteredTags = computed(() => {
  if (!searchTerm.value) return tags.value
  const search = searchTerm.value.toLowerCase()
  return tags.value.filter(tag => 
    tag.name.toLowerCase().includes(search)
  )
})

// Métodos
const openAddTagDialog = () => {
  // Lógica para abrir o diálogo de adicionar tag
}

const openEditTagDialog = (tagId) => {
  // Lógica para abrir o diálogo de editar tag
}

const handleDeleteTag = async (tagId) => {
  try {
    await deleteTag(tagId)
    notify({
      type: 'positive',
      message: 'Tag removida com sucesso',
      position: 'top'
    })
  } catch (err) {
    notify({
      type: 'negative',
      message: 'Erro ao remover tag',
      position: 'top'
    })
  }
}

// Carregar tags ao montar
loadTags()
</script>

<style lang="scss" scoped>
.tags-container {
  padding: 16px;

  .q-card {
    margin-bottom: 16px;
  }
}
</style>
