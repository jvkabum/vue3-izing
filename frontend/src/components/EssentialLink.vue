<template>
  <q-item
    clickable
    v-ripple
    :active="routeName === currentRoute"
    active-class="bg-blue-1 text-grey-8 text-bold menu-link-active-item-top"
    @click="handleClick"
    class="houverList"
    :class="{'text-negative text-bolder': color === 'negative'}"
  >
    <q-item-section v-if="icon" avatar>
      <q-icon :name="iconName" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption v-if="caption">
        {{ caption }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// Props
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: ''
  },
  routeName: {
    type: String,
    default: 'dashboard'
  },
  icon: {
    type: String,
    default: ''
  }
})

// Composables
const router = useRouter()
const route = useRoute()

// Computed
const currentRoute = computed(() => route.name)

const iconName = computed(() => 
  props.color === 'negative' ? 'mdi-cellphone-nfc-off' : props.icon
)

// Methods
const handleClick = () => {
  if (props.routeName !== currentRoute.value) {
    router.push({ name: props.routeName })
  }
}
</script>

<style lang="sass">
.menu-link-active-item-top
  border-left: 3px solid rgb(21, 120, 173)
  border-right: 3px solid rgb(21, 120, 173)
  border-top-right-radius: 20px
  border-bottom-right-radius: 20px
  position: relative
  height: 100%
</style>
