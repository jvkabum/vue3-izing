<template>
  <div 
    class="moldura-celular"
    :class="{ 
      'moldura-dark': theme === 'dark',
      'moldura-compact': compact
    }"
    :style="styles"
  >
    <div class="moldura-inner">
      <div class="moldura-top">
        <div class="camera"></div>
        <div class="speaker"></div>
        <div v-if="showTime" class="time">{{ currentTime }}</div>
      </div>
      <div 
        ref="scrollRef"
        class="moldura-screen"
        :class="{ 'moldura-screen-dark': theme === 'dark' }"
        @scroll="handleScroll"
      >
        <div class="moldura-content">
          <slot></slot>
        </div>
        <div v-if="loading" class="loading-indicator">
          <q-spinner color="primary" size="2em" />
        </div>
      </div>
      <div v-if="showControls" class="moldura-controls">
        <q-btn
          flat
          round
          dense
          icon="keyboard_arrow_up"
          @click="scrollToTop"
        />
        <q-btn
          flat
          round
          dense
          icon="keyboard_arrow_down"
          @click="scrollToBottom"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMolduraCelular } from '../../composables/useMolduraCelular'
import { format } from 'date-fns'

const props = defineProps({
  width: {
    type: Number,
    default: 400
  },
  height: {
    type: Number,
    default: 430
  },
  backgroundColor: {
    type: String,
    default: '#fff'
  },
  theme: {
    type: String,
    default: 'light',
    validator: (value) => ['light', 'dark'].includes(value)
  },
  compact: {
    type: Boolean,
    default: false
  },
  showTime: {
    type: Boolean,
    default: false
  },
  showControls: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['scroll'])

const {
  scrollRef,
  styles,
  scrollToBottom,
  scrollToTop
} = useMolduraCelular(props)

// Time display
const currentTime = ref(format(new Date(), 'HH:mm'))
let timeInterval

onMounted(() => {
  if (props.showTime) {
    timeInterval = setInterval(() => {
      currentTime.value = format(new Date(), 'HH:mm')
    }, 1000)
  }
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

// Scroll handling
const handleScroll = (event) => {
  const { scrollTop, scrollHeight, clientHeight } = event.target
  emit('scroll', {
    scrollTop,
    scrollHeight,
    clientHeight,
    isAtBottom: Math.ceil(scrollTop + clientHeight) >= scrollHeight,
    isAtTop: scrollTop === 0
  })
}

// Expose methods
defineExpose({
  scrollToTop,
  scrollToBottom
})
</script>

<style lang="scss" scoped>
.moldura-celular {
  padding: 30px;
  background: #000;
  border-radius: 2em;
  transition: all 0.3s ease;

  &.moldura-dark {
    background: #1a1a1a;
    .moldura-inner {
      background: #2c2c2c;
    }
  }

  &.moldura-compact {
    padding: 20px;
    .moldura-inner {
      margin: -16px 0 0 -16px;
    }
  }
}

.moldura-inner {
  height: v-bind('props.height + "px"');
  background: v-bind('props.backgroundColor');
  padding: 10px;
  margin: -24px 0 0 -25px;
  border-radius: 2em;
  transition: all 0.3s ease;
}

.moldura-top {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  position: relative;

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

  .time {
    position: absolute;
    right: 20px;
    font-size: 14px;
    font-weight: bold;
  }
}

.moldura-screen {
  background: #eeecec;
  width: calc(100% - 10px);
  height: calc(100% - 80px);
  margin-top: 10px;
  margin-left: -5px;
  overflow: auto;
  position: relative;
  border-radius: 0.5em;
  transition: background-color 0.3s ease;

  &.moldura-screen-dark {
    background: #1a1a1a;
    color: #fff;
  }

  .moldura-content {
    padding: 10px;
    
    div {
      white-space: normal;
      word-wrap: break-word;
    }
  }

  .loading-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }
}

.moldura-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}
</style>
