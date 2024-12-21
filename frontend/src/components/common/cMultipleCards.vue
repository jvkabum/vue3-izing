<template>
  <div class="multiple-cards">
    <div 
      v-for="(set, index) in sets" 
      :key="index"
      :class="contentClass"
    >
      <slot name="card" v-bind="{ items: set }"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  collection: {
    type: Array,
    required: true
  },
  sizes: {
    type: Object,
    default: () => ({
      lg: 4,
      md: 3,
      sm: 2,
      xs: 1
    }),
    validator(value) {
      return Object.entries(value).every(([size, count]) => 
        12 % count === 0
      )
    }
  }
})

const contentClass = computed(() => {
  let classes = ['col']
  
  Object.entries(props.sizes).forEach(([size, count]) => {
    if (count) {
      classes.push(`col-${size}-${12 / count}`)
    }
  })
  
  return classes.join(' ')
})

const sets = computed(() => {
  const result = []
  const itemsPerSet = Math.max(...Object.values(props.sizes))
  
  for (let i = 0; i < props.collection.length; i += itemsPerSet) {
    result.push(props.collection.slice(i, i + itemsPerSet))
  }
  
  return result
})
</script>

<style lang="scss" scoped>
.multiple-cards {
  display: flex;
  flex-wrap: wrap;
  margin: -8px;
  
  > div {
    padding: 8px;
  }
}
</style> 