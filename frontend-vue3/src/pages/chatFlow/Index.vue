<template>
  <div class="chat-flow">
    <router-view v-slot="{ Component }">
      <transition 
        name="fade" 
        mode="out-in"
      >
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
/**
 * Componente raiz do módulo ChatFlow
 * @component
 * @description Fornece o layout base e transições para as rotas do ChatFlow
 */
</script>

<style lang="scss" scoped>
.chat-flow {
  height: 100%;
  width: 100%;
}

// Animações de transição
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
