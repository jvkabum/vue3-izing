<template>
  <div class="tag-list">
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
    </div>

    <!-- Error State -->
    <q-banner v-else-if="error" class="bg-negative text-white">
      {{ error }}
      <template v-slot:action>
        <q-btn flat color="white" label="Tentar novamente" @click="$emit('retry')" />
      </template>
    </q-banner>

    <!-- Tags List -->
    <template v-else>
      <q-list separator>
        <q-item
          v-for="tag in tags"
          :key="tag.id"
          clickable
          v-ripple
          @click="$emit('edit', tag)"
          class="tag-item"
        >
          <q-item-section avatar>
            <q-avatar :color="tag.color" text-color="white">
              {{ tag.name.charAt(0).toUpperCase() }}
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="row items-center">
              {{ tag.name }}
              <q-badge
                v-if="!tag.isActive"
                color="grey"
                class="q-ml-sm"
              >
                Inativa
              </q-badge>
            </q-item-label>
            <q-item-label caption>
              {{ tag.description || 'Sem descrição' }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="row items-center q-gutter-x-sm">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="edit"
                @click.stop="$emit('edit', tag)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                @click.stop="$emit('delete', tag)"
              >
                <q-tooltip>Excluir</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Empty State -->
      <div 
        v-if="tags.length === 0" 
        class="flex flex-center column q-pa-lg text-grey-6"
      >
        <q-icon name="label_off" size="4em" />
        <div class="text-h6 q-mt-md">Nenhuma tag encontrada</div>
        <div class="text-caption">
          {{ searchTerm ? 'Tente uma busca diferente' : 'Comece criando uma nova tag' }}
        </div>
      </div>
    </template>

    <!-- Scroll to Top Button -->
    <q-page-sticky
      v-if="showScrollTop"
      position="bottom-right"
      :offset="[20, 20]"
    >
      <q-btn
        fab
        icon="keyboard_arrow_up"
        color="primary"
        @click="scrollToTop"
      />
    </q-page-sticky>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  tags: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  searchTerm: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['edit', 'delete', 'retry'])

// Scroll to Top functionality
const showScrollTop = ref(false)

const checkScroll = () => {
  const element = document.querySelector('.tag-list')
  if (!element) return
  showScrollTop.value = element.scrollTop > 300
}

const scrollToTop = () => {
  const element = document.querySelector('.tag-list')
  if (!element) return
  element.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  const element = document.querySelector('.tag-list')
  if (element) {
    element.addEventListener('scroll', checkScroll)
  }
})

onUnmounted(() => {
  const element = document.querySelector('.tag-list')
  if (element) {
    element.removeEventListener('scroll', checkScroll)
  }
})
</script>

<style lang="scss" scoped>
.tag-list {
  height: 100%;
  overflow-y: auto;
  position: relative;

  .tag-item {
    transition: all 0.3s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.03);

      .q-item__section--side {
        opacity: 1;
      }
    }

    .q-item__section--side {
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  }
}

// Dark mode support
.body--dark {
  .tag-list {
    .tag-item:hover {
      background: rgba(255, 255, 255, 0.07);
    }
  }
}

// Responsive
@media (max-width: 599px) {
  .tag-list {
    .tag-item {
      .q-item__section--side {
        opacity: 1;
      }

      &:hover {
        background: none;
      }
    }
  }
}
</style>
