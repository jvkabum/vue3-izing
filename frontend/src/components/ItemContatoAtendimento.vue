<template>
  <q-item
    clickable
    v-ripple
    :active="isActive"
    @click="handleClick"
    active-class="my-menu-link"
  >
    <q-item-section avatar v-if="icon">
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  routeName: {
    type: String,
    default: 'dashboard'
  }
})

const router = useRouter()
const route = useRoute()

const isActive = computed(() => route.name === props.routeName)

const handleClick = () => {
  if (!isActive.value) {
    router.push({ name: props.routeName })
  }
}
</script>

<style lang="scss" scoped>

</style>
