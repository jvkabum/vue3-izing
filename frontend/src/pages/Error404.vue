<template>
  <div class="fullscreen bg-negative text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">
        404
      </div>

      <div class="text-h2 text-white" style="opacity:.4">
        Oooooops... Nada por aqui...
      </div>

      <q-btn
        class="q-mt-xl q-pa-sm"
        color="white"
        text-color="blue"
        unelevated
        label="Voltar"
        no-caps
        @click="goBack"
      />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.fullscreen {
  height: 100vh;
}
</style>
