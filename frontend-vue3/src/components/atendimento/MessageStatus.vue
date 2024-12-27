<template>
  <div>
    <!-- Status de edição -->
    <div v-if="mensagem.edited" class="text-italic">
      Editada: {{ mensagem.edited }}
    </div>
    <div v-if="mensagem.edited" class="text-italic">
      Mensagem anterior:<br>
    </div>

    <!-- Status de exclusão -->
    <div v-if="mensagem.isDeleted" class="text-italic">
      Mensagem apagada em {{ formattedDate(mensagem.updatedAt, 'dd/MM/yyyy') }}.
    </div>
  </div>
</template>

<script setup>
defineProps({
  mensagem: {
    type: Object,
    required: true
  },
  formattedDate: {
    type: Function,
    required: true
  }
})
</script>
