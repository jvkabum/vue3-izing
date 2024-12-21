<template>
  <div class="video-container">
    <video autoplay muted loop class="video-background">
      <source :src="videoSrc" type="video/mp4" />
    </video>
    <div class="overlay"></div>
  </div>
</template>

<script setup>
defineProps({
  videoSrc: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.video-container {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

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
</style>
