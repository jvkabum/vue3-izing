<template>
  <div id="q-app" class="app-root">
    <!-- Loading -->
    <div v-if="loading" class="app-loader">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <!-- Conteúdo -->
    <template v-else>
      <!-- Router View -->
      <router-view v-slot="{ Component }">
        <transition
          name="fade"
          mode="out-in"
          appear
        >
          <component :is="Component" />
        </transition>
      </router-view>

      <!-- Idle Timer Alert -->
      <q-dialog v-model="showIdleAlert" persistent>
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar icon="timer" color="warning" text-color="white" />
            <span class="q-ml-sm">Sua sessão está prestes a expirar por inatividade.</span>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Continuar" color="primary" @click="resetIdleCounter" />
            <q-btn flat label="Sair" color="negative" @click="handleLogout" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useApp } from './composables/app/useApp'
import { useRouter } from 'vue-router'

// Router
const router = useRouter()

// Estado
const loading = ref(false)
const showIdleAlert = ref(false)

// Composables
const {
  idleSecondsCounter,
  idleTimeout,
  setupDarkMode,
  startIdleMonitoring,
  stopIdleMonitoring,
  resetIdleCounter
} = useApp()

// Métodos
const handleLogout = () => {
  // Implementar lógica de logout
  router.push('/login')
}
</script>

<style lang="scss">
.app-root {
  // Loading
  .app-loader {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(255, 255, 255, 0.9);
    z-index: 9999;
  }

  // Transições
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  // Scrollbars
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: var(--q-primary);
    border-radius: 4px;
    
    &:hover {
      background: var(--q-primary-dark);
    }
  }

  // Seleção de texto
  ::selection {
    background: var(--q-primary);
    color: white;
  }
}

// Tema escuro
:deep(.body--dark) {
  .app-root {
    .app-loader {
      background: rgba(0, 0, 0, 0.9);
    }

    ::-webkit-scrollbar-thumb {
      background: var(--q-primary-light);
      
      &:hover {
        background: var(--q-primary);
      }
    }
  }
}
</style>
