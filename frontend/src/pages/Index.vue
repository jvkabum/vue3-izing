<template>
  <q-page class="home-page">
    <!-- Loading -->
    <template v-if="loading">
      <div class="loader-container">
        <q-spinner-dots size="50px" color="primary" />
      </div>
    </template>

    <!-- Conteúdo -->
    <template v-else>
      <div class="content-container">
        <!-- Logo -->
        <div class="logo-container">
          <q-img
            src="logo.png"
            alt="Izing Flow Logo"
            width="200px"
            :ratio="1"
            class="logo"
          >
            <template #loading>
              <q-skeleton type="QImg" />
            </template>
            <template #error>
              <div class="text-h2 text-primary">
                Izing Flow
              </div>
            </template>
          </q-img>
        </div>

        <!-- Mensagem de Boas-vindas -->
        <div class="welcome-container">
          <h1 class="text-h4 text-weight-bold text-primary">
            {{ welcomeMessage }}
          </h1>
          <p class="text-subtitle1 text-grey-7 q-mt-md">
            Gerencie seus atendimentos de forma eficiente e profissional
          </p>
        </div>

        <!-- Cards de Atalho -->
        <div class="shortcuts-container q-mt-xl">
          <div class="row q-col-gutter-md justify-center">
            <!-- Atendimento -->
            <div class="col-xs-12 col-sm-6 col-md-4">
              <q-card class="shortcut-card" @click="$router.push('/atendimento')">
                <q-card-section class="text-center">
                  <q-icon name="headset_mic" size="4rem" color="primary" />
                  <div class="text-h6 q-mt-sm">Atendimento</div>
                  <div class="text-caption q-mt-xs">Gerencie seus tickets</div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Contatos -->
            <div class="col-xs-12 col-sm-6 col-md-4">
              <q-card class="shortcut-card" @click="$router.push('/contatos')">
                <q-card-section class="text-center">
                  <q-icon name="people" size="4rem" color="primary" />
                  <div class="text-h6 q-mt-sm">Contatos</div>
                  <div class="text-caption q-mt-xs">Gerencie seus contatos</div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Relatórios -->
            <div class="col-xs-12 col-sm-6 col-md-4">
              <q-card class="shortcut-card" @click="$router.push('/relatorios')">
                <q-card-section class="text-center">
                  <q-icon name="assessment" size="4rem" color="primary" />
                  <div class="text-h6 q-mt-sm">Relatórios</div>
                  <div class="text-caption q-mt-xs">Visualize suas métricas</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { useHome } from '../composables/home/useHome'

// Composables
const {
  welcomeMessage,
  userName,
  loading
} = useHome()
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  padding: 24px;

  // Loading
  .loader-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  // Conteúdo
  .content-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
  }

  // Logo
  .logo-container {
    display: flex;
    justify-content: center;
    margin-bottom: 48px;

    .logo {
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.05);
      }
    }
  }

  // Boas-vindas
  .welcome-container {
    text-align: center;
    margin-bottom: 48px;

    h1 {
      margin: 0;
      line-height: 1.2;
    }
  }

  // Cards de Atalho
  .shortcuts-container {
    .shortcut-card {
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .q-icon {
        transition: all 0.3s ease;
      }

      &:hover .q-icon {
        transform: scale(1.1);
      }
    }
  }
}

// Tema escuro
:deep(.body--dark) {
  .home-page {
    .shortcut-card {
      &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }
    }
  }
}

// Responsividade
@media (max-width: 599px) {
  .home-page {
    padding: 16px;

    .content-container {
      padding: 16px;
    }

    .welcome-container {
      h1 {
        font-size: 1.5rem;
      }
    }
  }
}
</style>
