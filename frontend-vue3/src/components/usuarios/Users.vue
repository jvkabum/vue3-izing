<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">Gerenciar Usuários</div>
      <q-separator />
      <q-input
        v-model="searchTerm"
        label="Buscar Usuário"
        outlined
        dense
        class="q-mb-md"
      />
      <q-btn
        label="Adicionar Usuário"
        color="primary"
        @click="openAddUserDialog"
      />
      <q-list>
        <q-item
          v-for="user in filteredUsers"
          :key="user.id"
          @click="openUserDetails(user.id)"
        >
          <q-item-section>
            <q-item-label>{{ user.name }}</q-item-label>
            <q-item-label caption>{{ user.email }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              flat
              icon="edit"
              @click.stop="openEditUserDialog(user.id)"
            />
            <q-btn
              flat
              icon="delete"
              color="negative"
              @click.stop="deleteUser(user.id)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUsers } from '../../composables/usuarios/useUsers'
import { useNotificationSystem } from '../../composables/sistema/useNotificationSystem'

const { users, loading, error, deleteUser, loadUsers } = useUsers()
const { notifySuccess, notifyError } = useNotificationSystem()

// Estado
const searchTerm = ref('')

// Computed
const filteredUsers = computed(() => {
  if (!searchTerm.value) return users.value
  const search = searchTerm.value.toLowerCase()
  return users.value.filter(user => 
    user.name.toLowerCase().includes(search) ||
    user.email.toLowerCase().includes(search)
  )
})

// Métodos
const openAddUserDialog = () => {
  // Lógica para abrir o diálogo de adicionar usuário
}

const openEditUserDialog = (userId) => {
  // Lógica para abrir o diálogo de editar usuário
}

const openUserDetails = (userId) => {
  // Lógica para abrir detalhes do usuário
}

const handleDeleteUser = async (userId) => {
  try {
    await deleteUser(userId)
    notifySuccess('Usuário removido com sucesso')
  } catch (err) {
    notifyError('Erro ao remover usuário')
  }
}

// Carregar usuários ao montar
loadUsers()
</script>

<style lang="scss" scoped>
.users-container {
  padding: 16px;

  .q-card {
    margin-bottom: 16px;
  }
}
</style>
