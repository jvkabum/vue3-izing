<template>
  <q-form @submit="onSubmit" class="tag-form">
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-input
          v-model="form.name"
          label="Nome da Tag"
          :rules="[val => !!val || 'Nome é obrigatório']"
          outlined
          dense
          :disable="loading"
        />
      </div>

      <div class="col-12">
        <q-select
          v-model="form.color"
          :options="availableColors"
          label="Cor"
          outlined
          dense
          emit-value
          map-options
          :disable="loading"
        >
          <template v-slot:option="{ opt }">
            <q-item v-bind="opt">
              <q-item-section avatar>
                <div 
                  class="color-preview" 
                  :style="{ backgroundColor: opt.value }"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ opt.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>

          <template v-slot:selected>
            <div class="row items-center">
              <div 
                class="color-preview q-mr-sm" 
                :style="{ backgroundColor: form.color }"
              />
              {{ availableColors.find(c => c.value === form.color)?.label }}
            </div>
          </template>
        </q-select>
      </div>

      <div class="col-12">
        <q-input
          v-model="form.description"
          label="Descrição"
          type="textarea"
          outlined
          dense
          :disable="loading"
          :rules="[
            val => !val || val.length <= 255 || 'Máximo de 255 caracteres'
          ]"
          hint="Opcional - Máximo 255 caracteres"
        />
      </div>

      <div class="col-12">
        <q-toggle
          v-model="form.isActive"
          label="Tag Ativa"
          :disable="loading"
        >
          <template v-slot:label>
            <span class="row items-center">
              Tag Ativa
              <q-icon
                name="info"
                size="xs"
                class="q-ml-sm cursor-pointer"
              >
                <q-tooltip>
                  Tags inativas não aparecem nas seleções,
                  mas mantêm seu histórico
                </q-tooltip>
              </q-icon>
            </span>
          </template>
        </q-toggle>
      </div>
    </div>

    <div class="row justify-end q-gutter-sm q-mt-md">
      <q-btn
        label="Cancelar"
        color="negative"
        flat
        :disable="loading"
        @click="$emit('cancel')"
      />
      <q-btn
        :label="isEditing ? 'Salvar' : 'Criar'"
        type="submit"
        color="primary"
        :loading="loading"
      />
    </div>
  </q-form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  tag: {
    type: Object,
    default: () => ({
      name: '',
      color: '#000000',
      description: '',
      isActive: true
    })
  },
  availableColors: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

const form = ref({ ...props.tag })

const isEditing = computed(() => !!props.tag.id)

watch(() => props.tag, (newTag) => {
  form.value = { ...newTag }
}, { deep: true })

const onSubmit = () => {
  emit('submit', { ...form.value })
}
</script>

<style lang="scss" scoped>
.tag-form {
  .color-preview {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
}

// Dark mode support
.body--dark {
  .tag-form {
    .color-preview {
      border-color: rgba(255, 255, 255, 0.2);
    }
  }
}
</style>
