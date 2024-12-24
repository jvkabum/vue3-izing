<template>
  <div class="login-page">
    <!-- Background Video -->
    <div class="bg-video">
      <video autoplay muted loop class="video-background">
        <source src="../assets/110694.mp4" type="video/mp4" />
      </video>
      <div class="overlay" />
    </div>

    <!-- Login Form -->
    <q-layout class="vertical-center">
      <q-page-container>
        <q-page class="flex justify-end items-center">
          <!-- Loading Bar -->
          <q-ajax-bar position="top" color="primary" size="5px" />

          <!-- Login Card -->
          <q-card bordered class="login-card q-pa-md shadow-10">
            <!-- Header -->
            <q-card-section class="text-primary text-center">
              <div class="text-h6">Bem-vindo!</div>
            </q-card-section>

            <!-- Form -->
            <q-card-section>
              <!-- Email -->
              <q-input 
                v-model="form.email"
                class="q-mb-md"
                outlined
                clearable
                placeholder="meu@email.com"
                :error="v$.form.email.$error"
                :error-message="v$.form.email.$errors[0]?.$message"
                @keypress.enter="fazerLogin"
              >
                <template #prepend>
                  <q-icon name="mdi-email-outline" class="cursor-pointer" color="primary">
                    <q-tooltip>E-mail</q-tooltip>
                  </q-icon>
                </template>
              </q-input>

              <!-- Password -->
              <q-input 
                v-model="form.password"
                outlined
                :type="isPwd ? 'password' : 'text'"
                :error="v$.form.password.$error"
                :error-message="v$.form.password.$errors[0]?.$message"
                @keypress.enter="fazerLogin"
              >
                <template #prepend>
                  <q-icon name="mdi-shield-key-outline" class="cursor-pointer" color="primary">
                    <q-tooltip>Senha</q-tooltip>
                  </q-icon>
                </template>
                <template #append>
                  <q-icon
                    :name="isPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwd = !isPwd"
                  >
                    <q-tooltip>{{ isPwd ? 'Mostrar senha' : 'Ocultar senha' }}</q-tooltip>
                  </q-icon>
                </template>
              </q-input>
            </q-card-section>

            <!-- Actions -->
            <q-card-actions>
              <q-space />
              
              <!-- Login Button -->
              <q-btn
                color="primary"
                :loading="loading"
                class="q-mr-sm q-my-lg action-btn"
                @click="fazerLogin"
              >
                <template #default>Login</template>
                <template #loading>
                  <q-spinner-puff class="on-left" />
                  Logando...
                </template>
              </q-btn>

              <!-- Clear Cache Button -->
              <q-btn
                color="primary"
                class="q-my-lg action-btn"
                @click="clearCache"
              >
                Limpar Cache
                <q-tooltip>Limpar dados do navegador</q-tooltip>
              </q-btn>
            </q-card-actions>

            <!-- Loading -->
            <q-inner-loading :showing="loading">
              <q-spinner-dots size="50px" color="primary" />
            </q-inner-loading>
          </q-card>
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script setup>
import { useAuth } from '../composables/auth/useAuth'

// Composables
const {
  form,
  isPwd,
  loading,
  v$,
  fazerLogin,
  clearCache
} = useAuth()
</script>

<style lang="scss" scoped>
.login-page {
  // Background
  .bg-video {
    position: relative;
    height: 100vh;
    overflow: hidden;

    .video-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: -1;
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1;
    }
  }

  // Layout
  .q-layout {
    position: relative;
    z-index: 2;
  }

  // Card
  .login-card {
    width: 100%;
    max-width: 430px;
    background-color: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(10px);
    border-top: 5px solid #3E72AF;
    border-radius: 20px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }

    // Inputs
    .q-input {
      .q-field__control {
        transition: all 0.3s ease;

        &:hover {
          border-color: var(--q-primary);
        }
      }

      .q-icon {
        transition: all 0.3s ease;

        &:hover {
          transform: scale(1.1);
        }
      }
    }

    // Botões
    .action-btn {
      min-width: 150px;
      opacity: 0.9;
      transition: all 0.3s ease;

      &:hover {
        opacity: 1;
        transform: scale(1.05);
      }
    }
  }
}

// Tema escuro
:deep(.body--dark) {
  .login-page {
    .login-card {
      background-color: rgba(30, 30, 30, 0.75);
    }
  }
}

// Responsividade
@media (max-width: 599px) {
  .login-page {
    .login-card {
      margin: 16px;
      max-width: calc(100% - 32px);

      .q-card-actions {
        flex-direction: column;

        .action-btn {
          width: 100%;
          margin: 8px 0;
        }
      }
    }
  }
}
</style>
