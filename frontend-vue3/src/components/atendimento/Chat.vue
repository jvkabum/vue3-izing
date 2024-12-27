<template>
  <div>
    <InforCabecalhoChat :cticket="ticketFocado" />
    <TicketList :filas="filas" :status="status" :searchParam="searchParam" />
    <InputMensagem :replyingMessage="replyingMessage" :mensagensRapidas="mensagensRapidas" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'src/stores'
import InforCabecalhoChat from './InforCabecalhoChat.vue'
import TicketList from './TicketList.vue'
import InputMensagem from './InputMensagem.vue'

const store = useStore()
const { ticketFocado, filas, status, searchParam, mensagensRapidas } = storeToRefs(store)

const replyingMessage = computed(() => store.getters.replyingMessage)
</script>

<style scoped>
/* Adicione estilos aqui, se necessário */
</style>
