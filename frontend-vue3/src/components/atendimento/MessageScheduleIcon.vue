<template>
  <q-icon
    class="q-ma-xs"
    name="mdi-calendar"
    size="18px"
    :class="{
      'text-primary': mensagem.scheduleDate && mensagem.status === 'pending',
      'text-positive': !['pending', 'canceled'].includes(mensagem.status)
    }"
  >
    <q-tooltip content-class="bg-secondary text-grey-8">
      <div class="row col">Mensagem agendada</div>
      <div v-if="mensagem.isDeleted" class="row col">
        <q-chip color="red-3" icon="mdi-trash-can-outline">
          Envio cancelado: {{ formattedDate(mensagem.updatedAt, 'dd/MM/yyyy') }}
        </q-chip>
      </div>
      <div class="row col">
        <q-chip color="blue-1" icon="mdi-calendar-import">
          Criado em: {{ formattedDate(mensagem.createdAt, 'dd/MM/yyyy HH:mm') }}
        </q-chip>
      </div>
      <div class="row col">
        <q-chip color="blue-1" icon="mdi-calendar-start">
          Programado para: {{ formattedDate(mensagem.scheduleDate, 'dd/MM/yyyy HH:mm') }}
        </q-chip>
      </div>
    </q-tooltip>
  </q-icon>
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
