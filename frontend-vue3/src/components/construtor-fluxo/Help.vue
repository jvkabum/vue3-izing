<template>
  <q-dialog v-model="dialogVisible" width="70%" title="Ajuda">
    <q-tabs tab-position="left">
      <q-tab-panel label="Como Adicionar">
        <q-divider content-position="left">Como Adicionar</q-divider>
        <div>Arraste os componentes da esquerda para a área central</div>
      </q-tab-panel>

      <q-tab-panel label="Como Excluir">
        <q-divider content-position="left">Excluir na Interface</q-divider>
        <div>Selecione o nó e clique no ícone de exclusão</div>

        <q-divider content-position="left">Excluir via Código</q-divider>
        <pre>this.deleteNode(nodeId)</pre>
      </q-tab-panel>

      <q-tab-panel label="Como Mover">
        <q-divider content-position="left">Como Mover</q-divider>
        <div>Clique e arraste o nó para a nova posição</div>
      </q-tab-panel>

      <q-tab-panel label="Como Conectar">
        <q-divider content-position="left">Como Conectar</q-divider>
        <div>Arraste do ponto de conexão de um nó até outro nó</div>
      </q-tab-panel>

      <q-tab-panel label="Como Adicionar Condições">
        <q-divider content-position="left">Como Adicionar Condições</q-divider>
        <div>Clique na linha de conexão e configure no painel lateral</div>
      </q-tab-panel>

      <q-tab-panel label="Integração Backend">
        <q-divider content-position="left">Integração Backend</q-divider>
        <div>Consulte: https://gitee.com/xiaoka2017/easy-flow-sdk</div>
      </q-tab-panel>
    </q-tabs>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'

const dialogVisible = ref(false)

const init = () => {
  dialogVisible.value = true
}

defineExpose({
  init
})
</script>

<style>
.flowHelp {
  height: 80%;
}
</style>
