<!-- Mesmo conteúdo anterior, mas alterando os v-model com argumentos -->
<template>
  <div>
    <!-- ... resto do template igual ... -->
    <ModalChatFlow
      :modalChatFlow="modalChatFlow"
      :chatFlowEdicao="chatFlowSelecionado"
      @update:modalChatFlow="modalChatFlow = $event"
      @update:chatFlowEdicao="chatFlowSelecionado = $event"
      @chatFlow:criada="novoFluxoCriado"
      @chatFlow:editado="fluxoEditado"
    />
    <!-- ... resto do template igual ... -->
  </div>
</template>

<script setup>
// ... mesmo script anterior ...
</script>

<style lang="scss" scoped>
</style>
