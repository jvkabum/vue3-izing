<template>
  <div class="mobile-frame">
    <div class="screen">
      <slot />
    </div>
  </div>
</template>

<script setup>
// Não há lógica específica para este componente
</script>

<style lang="scss" scoped>
.mobile-frame {
  width: 375px; /* Largura do dispositivo */
  height: 667px; /* Altura do dispositivo */
  border: 16px solid #000; /* Borda da moldura */
  border-radius: 36px; /* Bordas arredondadas */
  padding: 20px; /* Espaçamento interno */
  background: #fff; /* Cor de fundo */
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5); /* Sombra */
  position: relative; /* Posição relativa para elementos internos */
}

.screen {
  width: 100%;
  height: 100%;
  overflow: hidden; /* Oculta o conteúdo que ultrapassa a moldura */
  border-radius: 20px; /* Bordas arredondadas da tela */
  background: #f0f0f0; /* Cor de fundo da tela */
}
</style>
