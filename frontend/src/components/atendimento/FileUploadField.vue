<template>
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
    :max-file-size="maxFileSize"
    :max-total-size="maxTotalSize"
    :accept="acceptedFormats"
    @rejected="handleRejectedFiles"
  >
    <template #file="{ file, index }">
      <q-chip
        removable
        @remove="removeFile(index)"
        square
        class="q-my-xs"
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

    <template #after>
      <q-tooltip content-class="bg-primary text-body2">
        Formatos aceitos: imagens, documentos, áudio e vídeo.<br>
        Tamanho máximo por arquivo: 15MB
      </q-tooltip>
    </template>
  </q-file>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

// Constantes
const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB
const MAX_TOTAL_SIZE = 15 * 1024 * 1024 // 15MB
const ACCEPTED_FORMATS = [
  '.txt', '.xml', '.jpg', '.png', 'image/jpeg', '.pdf',
  '.doc', '.docx', '.mp4', '.ogg', '.mp3', '.xls',
  '.xlsx', '.jpeg', '.rar', '.zip', '.ppt', '.pptx',
  'image/*'
].join(',')

// Props
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'rejected'])

// Composables
const $q = useQuasar()

// Refs
const fileInputRef = ref(null)

// Computed
const filesModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const maxFileSize = computed(() => MAX_FILE_SIZE)
const maxTotalSize = computed(() => MAX_TOTAL_SIZE)
const acceptedFormats = computed(() => ACCEPTED_FORMATS)

// Métodos
const getFileIcon = (type) => {
  if (type.includes('image')) return 'mdi-image'
  if (type.includes('audio')) return 'mdi-music'
  if (type.includes('video')) return 'mdi-video'
  if (type.includes('pdf')) return 'mdi-file-pdf'
  if (type.includes('word')) return 'mdi-file-word'
  if (type.includes('excel')) return 'mdi-file-excel'
  if (type.includes('zip') || type.includes('rar')) return 'mdi-zip-box'
  return 'mdi-file-document'
}

const getFileColor = (type) => {
  if (type.includes('image')) return 'green'
  if (type.includes('audio')) return 'purple'
  if (type.includes('video')) return 'red'
  if (type.includes('pdf')) return 'negative'
  if (type.includes('word')) return 'blue'
  if (type.includes('excel')) return 'positive'
  if (type.includes('zip') || type.includes('rar')) return 'brown'
  return 'grey'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

const removeFile = (index) => {
  const newFiles = [...props.modelValue]
  newFiles.splice(index, 1)
  emit('update:modelValue', newFiles)
}

const handleRejectedFiles = (rejectedEntries) => {
  emit('rejected', rejectedEntries)
  
  const reasons = new Set(rejectedEntries.map(entry => entry.failedPropValidation))
  let message = 'Arquivo(s) rejeitado(s):<br>'
  
  if (reasons.has('max-file-size')) {
    message += '• Arquivo muito grande (máx. 15MB)<br>'
  }
  if (reasons.has('max-total-size')) {
    message += '• Tamanho total excede 15MB<br>'
  }
  if (reasons.has('max-files')) {
    message += '• Máximo de 5 arquivos permitido<br>'
  }
  if (reasons.has('accept')) {
    message += '• Formato não suportado<br>'
  }

  $q.notify({
    type: 'negative',
    message,
    html: true,
    position: 'top',
    timeout: 3000
  })
}

// Métodos expostos
defineExpose({
  pickFiles: () => fileInputRef.value?.pickFiles()
})
</script>

<style lang="scss" scoped>
.file-upload {
  :deep(.q-field__control) {
    border-radius: 8px;
    min-height: 56px;
    padding: 4px 8px;
  }

  :deep(.q-chip) {
    background: var(--q-blue-grey-1);
    transition: all 0.3s ease;
    
    &:hover {
      background: var(--q-blue-grey-2);
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
      
      &:hover {
        opacity: 1;
      }
    }
  }
}

.ellipsis {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
