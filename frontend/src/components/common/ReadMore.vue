<template>
  <div class="read-more">
    <div 
      v-html="formattedContent"
      :class="{ 'pre-formatted': renderPre }"
    ></div>

    <div v-if="hasMoreContent" class="read-more-actions">
      <q-btn
        v-if="!expanded"
        flat
        color="primary"
        label="Ler mais"
        @click="toggleExpand"
      >
        <template #default>
          <div class="dots-container">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
          Ler mais
        </template>
      </q-btn>

      <q-btn
        v-else
        flat
        color="grey"
        label="Mostrar menos"
        @click="toggleExpand"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  maxChars: {
    type: Number,
    default: 300
  },
  renderPre: {
    type: Boolean,
    default: false
  }
})

const expanded = ref(false)

const hasMoreContent = computed(() => 
  props.text.length > props.maxChars
)

const formattedContent = computed(() => {
  let content = props.text

  if (!props.renderPre) {
    content = content
      .replace(/<(\w+)\b[^>]*>.*?<\/\1>/g, '')
      .replace(/<p/g, '<p class="paragraph"')
      .replace(/(\r\n|\n|\r)/g, '')
      .replace(/<br>/g, '')
  }

  if (!expanded.value && hasMoreContent.value) {
    content = content.substring(0, props.maxChars) + '...'
  }

  return content
})

const toggleExpand = () => {
  expanded.value = !expanded.value
}
</script>

<style lang="scss" scoped>
.read-more {
  .pre-formatted {
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .paragraph {
    line-height: 1.5;
    margin: 0.5em 0;
  }

  .read-more-actions {
    margin-top: 1em;
    text-align: right;
  }

  .dots-container {
    display: inline-flex;
    gap: 4px;
    margin-right: 8px;

    .dot {
      width: 4px;
      height: 4px;
      background: currentColor;
      border-radius: 50%;
      animation: pulse 1.5s infinite;

      &:nth-child(2) { animation-delay: 0.2s; }
      &:nth-child(3) { animation-delay: 0.4s; }
    }
  }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.5); }
  100% { transform: scale(1); }
}
</style> 