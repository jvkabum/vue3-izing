<template>
  <div class="status-container">
    <q-card v-for="(user, index) in users" :key="index" class="q-mb-md">
      <q-card-section>
        <div class="text-h6">{{ user.name }}</div>
        <div class="text-body1">{{ user.email }}</div>
        <q-badge
          :color="user.status === 'online' ? 'green' : 'red'"
          class="q-mt-md"
        >
          {{ user.status }}
        </q-badge>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Estado para armazenar os usuários
const users = ref([])

// Método para adicionar usuários
const addUser = (user) => {
  users.value.push(user)
}

// Método para remover usuários
const removeUser = (index) => {
  users.value.splice(index, 1)
}

// Expor métodos
defineExpose({
  addUser,
  removeUser
})
</script>

<style lang="scss" scoped>
.status-container {
  display: flex;
  flex-direction: column;
}
</style>
