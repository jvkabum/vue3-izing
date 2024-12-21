<template>
  <div class="moldura-celular">
    <div class="moldura-inner">
      <div class="moldura-top">
        <div class="camera"></div>
        <div class="speaker"></div>
      </div>
      <div class="moldura-screen">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
// Componente puramente visual, não necessita lógica
</script>

<style lang="scss" scoped>
.moldura-celular {
  width: 400px;
  padding: 30px;
  background: #000;
  border-radius: 2em;
}

.moldura-inner {
  width: 390px;
  height: 430px;
  background: #fff;
  padding: 10px;
  margin: -24px 0 0 -25px;
  border-radius: 2em;
}

.moldura-top {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;

  .camera {
    width: 20px;
    height: 20px;
    background: black;
    border-radius: 50%;
    margin-right: 20px;
  }

  .speaker {
    width: 40px;
    height: 10px;
    background: linear-gradient(90deg, grey 20%, white 30%, black 40%);
    border-radius: 0.5em;
  }
}

.moldura-screen {
  background: #eeecec;
  width: 380px;
  height: 370px;
  margin-top: 10px;
  margin-left: -5px;
  overflow: auto;

  div {
    white-space: normal;
    word-wrap: break-word;
  }
}
</style> 