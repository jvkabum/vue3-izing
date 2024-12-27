<template>
  <div>
    <div
      class="formatHTML"
      v-html="formattedString"
      v-if="!renderPre"
    >
    </div>
    <pre v-else>
      {{ formattedString }}
    </pre>

    <div
      v-show="text.length > maxChars"
      class="text-right q-mr-md q-mt-md"
    >
      <q-btn
        dense
        no-caps
        class="no-border-radius"
        outline
        ripple
        color="info"
        v-show="!isReadMore && mostrarBotao"
        @click="triggerReadMore($event, true)"
      >
        <div class="blobs-container">
          <div class="blob blue"></div>
          <div class="blob blue"></div>
          <div class="blob blue"></div>
        </div> Ler mais
      </q-btn>

      <q-btn
        dense
        no-caps
        class="no-border-radius"
        outline
        ripple
        color="yellow-10"
        v-show="isReadMore"
        v-scroll-to="`#${link}`"
        @click="triggerReadMore($event, false, link)"
      >
        <div class="blobs-container">
          <div class="blob yellow"></div>
          <div class="blob yellow"></div>
          <div class="blob yellow"></div>
        </div> Resumir
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  text: string
  renderPre?: boolean
  link?: string | number
  maxChars?: number
}

const props = withDefaults(defineProps<Props>(), {
  renderPre: false,
  link: '#',
  maxChars: 400
})

const emit = defineEmits<{
  (e: 'read-more:focar-ref', link: string | number): void
}>()

const isReadMore = ref(false)
const mostrarBotao = ref(false)

const formattedString = computed(() => {
  let maxChars = props.maxChars
  let text = props.text
  
  if (!props.renderPre) {
    text = text.replace(/<(\w+)\b(?:\s+[\w\-.:]+(?:\s*=\s*(?:"[^"]*"|"[^"]*"|[\w\-.:]+))?)*\s*\/?>\s*<\/\1\s*>/igm, '')
    text = text.replace(/<p/g, '<p class="formatP" ')
    text = text.replace(/(\r\n|\n|\r)/g, '')
    text = text.replace(/<br>/g, '')
    maxChars = maxChars + 1000
  }

  if (!isReadMore.value && props.text.length > maxChars) {
    text = text.substring(0, maxChars) + ' ...'
    mostrarBotao.value = true
  }

  return text
})

const triggerReadMore = (e: Event, b: boolean, link?: string | number) => {
  if (link === '#') {
    e.preventDefault()
  }
  isReadMore.value = b

  if (!isReadMore.value && link !== undefined) {
    emit('read-more:focar-ref', link)
  }
}
</script>

<style>
.formatP,
pre {
  white-space: pre-wrap !important;
  white-space: -moz-pre-wrap !important;
  white-space: -pre-wrap !important;
  white-space: -o-pre-wrap !important;
  word-wrap: break-word !important;
}

.formatP {
  line-height: 24px;
}

.hrButtom {
  display: flex;
  justify-content: center;
  align-items: center;
}

.ReadMore {
  flex: 1;
  border: none;
  height: 2px;
  background: rgba(52, 172, 224, 0.178);
}

.ReadLess {
  flex: 1;
  border: none;
  height: 2px;
  background: rgba(255, 177, 66, 1);
}

.blobs-container {
  display: flex;
}

.blob {
  background: black;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 1);
  margin: 10px;
  height: 5px;
  width: 5px;
  transform: scale(1);
  animation: pulse-black 2s infinite;
}

.blob.blue {
  background: rgba(52, 172, 224, 1);
  box-shadow: 0 0 0 0 rgba(52, 172, 224, 1);
  animation: pulse-blue 2s infinite;
}

@keyframes pulse-blue {
  0% {
    transform: scale(0.5);
    box-shadow: 0 0 0 0 rgba(52, 172, 224, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(52, 172, 224, 0);
  }

  100% {
    transform: scale(0.55);
    box-shadow: 0 0 0 0 rgba(52, 172, 224, 0);
  }
}

.blob.yellow {
  background: rgba(255, 177, 66, 1);
  box-shadow: 0 0 0 0 rgba(255, 177, 66, 1);
  animation: pulse-yellow 2s infinite;
}

@keyframes pulse-yellow {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 177, 66, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(255, 177, 66, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 177, 66, 0);
  }
}
</style>
