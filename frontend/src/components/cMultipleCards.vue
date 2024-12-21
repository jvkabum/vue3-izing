<template>
  <div class="multiple-cards-container">
    <q-card
      v-for="(card, index) in cards"
      :key="index"
      class="q-mb-md"
    >
      <q-card-section>
        <div class="text-h6">{{ card.title }}</div>
        <div class="text-body1">{{ card.content }}</div>
      </q-card-section>
      <q-card-actions>
        <q-btn
          label="Ação"
          @click="card.action"
          color="primary"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Estado para armazenar os cartões
const cards = ref([])

// Método para adicionar cartões
const addCard = (card) => {
  cards.value.push(card)
}

// Método para remover cartões
const removeCard = (index) => {
  cards.value.splice(index, 1)
}

// Expor métodos
defineExpose({
  addCard,
  removeCard
})
</script>

<style lang="scss" scoped>
.multiple-cards-container {
  display: flex;
  flex-direction: column;
}
</style>
