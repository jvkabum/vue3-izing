<template>
  <div class="file-upload-field">
    <q-file
      ref="fileInputRef"
      :loading="loading"
      :disable="disabled"
      v-model="filesModel"
      class="col-grow q-mx-xs file-upload"
      bg-color="blue-grey-1"
      input-style="max-height: 30vh"
      outlined
      use-chips
      multiple
      autogrow
      dense
      rounded
      append
      :max-files="5"
      :max-file-size="uploadConfig.maxFileSize"
      :max-total-size="uploadConfig.maxTotalSize"
      :accept="uploadConfig.acceptedFormats"
      @rejected="onRejected"
      hide-bottom-space
    >
      <!-- Área de Drop -->
      <template #prepend>
        <div class="row items-center">
          <q-icon 
            name="mdi-upload" 
            size="24px" 
            class="q-mr-sm upload-icon"
            :class="{ 'rotating': loading }"
          />
          <span class="upload-text text-grey-7">
            Arraste arquivos ou clique para selecionar
          </span>
        </div>
      </template>

      <!-- Template para cada arquivo -->
      <template #file="{ file, index }">
        <q-chip
          removable
          @remove="onRemoveFile(index)"
          square
          class="q-my-xs file-chip"
        >
          <q-icon 
            :name="getFileIcon(file.type)" 
            left 
            :color="getFileColor(file.type)"
          />
          <div class="ellipsis">
            {{ file.name }}
            <span class="text-grey-7 text-weight-light">
              ({{ formatFileSize(file.size) }})
            </span>
          </div>
        </q-chip>
      </template>

      <!-- Tooltip Informativo -->
      <template #after>
        <q-tooltip class="bg-primary text-body2">
          <div class="text-weight-medium q-mb-sm">
            Formatos aceitos:
          </div>
          <div class="row q-gutter-md">
            <div>
              <div class="text-weight-medium text-green">Imagens</div>
              jpg, png, jpeg
            </div>
            <div>
              <div class="text-weight-medium text-blue">Documentos</div>
              pdf, doc, xls, ppt
            </div>
            <div>
              <div class="text-weight-medium text-purple">Mídia</div>
              mp3, mp4, ogg
            </div>
            <div>
              <div class="text-weight-medium text-brown">Compactados</div>
              zip, rar
            </div>
          </div>
          <q-separator dark class="q-my-sm" />
          <div class="text-weight-medium">
            Tamanho máximo: 15MB por arquivo
          </div>
        </q-tooltip>
      </template>

      <!-- Loading -->
      <template #loading>
        <q-spinner-dots color="primary" size="24px" />
      </template>
    </q-file>

    <!-- Preview de Imagens -->
    <div v-if="hasImagePreviews" class="image-previews q-mt-sm">
      <q-scroll-area horizontal style="height: 100px">
        <div class="row no-wrap q-gutter-sm">
          <div 
            v-for="(preview, index) in imagePreviews" 
            :key="index"
            class="preview-item"
          >
            <q-img
              :src="preview"
              spinner-color="primary"
              spinner-size="24px"
              class="rounded-borders"
              style="height: 80px; width: 80px"
            >
              <template #error>
                <div class="absolute-full flex flex-center bg-negative text-white">
                  Erro ao carregar
                </div>
              </template>
            </q-img>
          </div>
        </div>
      </q-scroll-area>
    </div>
  </div>
</template>

<script setup>
/**
 * Componente de upload de arquivos
 * @component
 * @description Permite upload de múltiplos arquivos com preview
 */

import { computed, watch } from 'vue'
import { useFileUpload } from '../../composables/atendimento/useFileUpload'

/**
 * Props do componente
 */
const props = defineProps({
  /** Arquivos selecionados */
  modelValue: {
    type: Array,
    default: () => []
  },
  /** Estado de carregamento */
  loading: {
    type: Boolean,
    default: false
  },
  /** Estado desabilitado */
  disabled: {
    type: Boolean,
    default: false
  }
})

/**
 * Eventos que o componente pode emitir
 */
const emit = defineEmits(['update:modelValue', 'rejected'])

/**
 * Composable de upload
 */
const {
  fileInputRef,
  uploadConfig,
  getFileIcon,
  getFileColor,
  formatFileSize,
  removeFile,
  handleRejectedFiles,
  pickFiles
} = useFileUpload()

/**
 * Model para os arquivos
 */
const filesModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

/**
 * Preview de imagens
 */
const imagePreviews = computed(() => {
  return filesModel.value
    .filter(file => file.type.includes('image'))
    .map(file => URL.createObjectURL(file))
})

const hasImagePreviews = computed(() => 
  imagePreviews.value.length > 0
)

/**
 * Manipuladores de eventos
 */
const onRemoveFile = (index) => {
  filesModel.value = removeFile(filesModel.value, index)
}

const onRejected = (rejectedEntries) => {
  emit('rejected', rejectedEntries)
  handleRejectedFiles(rejectedEntries)
}

// Limpa URLs de preview ao desmontar
watch(filesModel, (newFiles, oldFiles) => {
  if (oldFiles) {
    oldFiles
      .filter(file => file.type.includes('image'))
      .forEach(file => URL.revokeObjectURL(file))
  }
})

// Expõe métodos para o componente pai
defineExpose({
  pickFiles
})
</script>

<style lang="scss" scoped>
.file-upload-field {
  // Campo de upload
  .file-upload {
    :deep(.q-field__control) {
      border-radius: 8px;
      min-height: 56px;
      padding: 4px 8px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(0, 0, 0, 0.02);
      }

      // Estado de drop
      &.q-field__control--focused {
        border-color: var(--q-primary);
        background: rgba(var(--q-primary-rgb), 0.05);
      }
    }

    // Área de upload
    .upload-icon {
      transition: transform 0.3s ease;
      
      &.rotating {
        animation: rotate 1s linear infinite;
      }
    }

    .upload-text {
      font-size: 0.9em;
      transition: color 0.3s ease;
    }

    &:hover {
      .upload-text {
        color: var(--q-primary) !important;
      }
    }
  }

  // Chips de arquivo
  :deep(.file-chip) {
    background: var(--q-blue-grey-1);
    transition: all 0.3s ease;
    
    &:hover {
      background: var(--q-blue-grey-2);
      transform: translateY(-1px);
    }
    
    .q-icon {
      font-size: 20px;
    }
    
    .q-chip__content {
      padding: 4px 8px;
    }
    
    .q-chip__remove {
      margin-left: 4px;
      opacity: 0.7;
      transition: all 0.2s ease;
      
      &:hover {
        opacity: 1;
        transform: scale(1.1);
      }
    }
  }

  // Preview de imagens
  .image-previews {
    .preview-item {
      transition: all 0.3s ease;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }
    }
  }
}

// Texto truncado
.ellipsis {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// Animação de rotação
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// Tema escuro
:deep(.body--dark) {
  .file-upload-field {
    .file-upload {
      .q-field__control:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .file-chip {
        background: rgba(255, 255, 255, 0.1);
        
        &:hover {
          background: rgba(255, 255, 255, 0.15);
        }
      }
    }

    .image-previews .preview-item {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

      &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }
    }
  }
}

// Responsividade
@media (max-width: 599px) {
  .ellipsis {
    max-width: 150px;
  }

  .file-upload-field {
    .upload-text {
      display: none;
    }
  }
}
</style>
