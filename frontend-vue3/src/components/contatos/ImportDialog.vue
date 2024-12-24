<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center">
        <div class="text-h6">Importar Contatos</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="column q-gutter-y-md">
          <!-- Área de Upload -->
          <q-uploader
            ref="uploader"
            :factory="uploadFile"
            accept=".csv, .xlsx, .xls"
            label="Arraste um arquivo ou clique para selecionar"
            color="primary"
            flat
            bordered
            :filter="checkFileType"
            @rejected="onRejected"
            style="width: 100%"
          >
            <template v-slot:header="scope">
              <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
                <q-btn
                  v-if="scope.queuedFiles.length > 0"
                  icon="clear_all"
                  @click="scope.removeQueuedFiles"
                  round
                  dense
                  flat
                >
                  <q-tooltip>Limpar</q-tooltip>
                </q-btn>
                <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
                <div class="col">
                  <div class="q-uploader__title">Upload de Arquivo</div>
                  <div class="q-uploader__subtitle">
                    {{ scope.uploadSizeLabel }}
                  </div>
                </div>
                <q-btn
                  v-if="scope.canAddFiles"
                  type="a"
                  icon="add_box"
                  round
                  dense
                  flat
                >
                  <q-uploader-add-trigger />
                  <q-tooltip>Selecionar Arquivo</q-tooltip>
                </q-btn>
              </div>
            </template>
          </q-uploader>

          <!-- Opções de Importação -->
          <div class="column q-gutter-y-sm">
            <div class="text-subtitle2">Opções de Importação</div>
            
            <q-select
              v-model="options.delimiter"
              :options="delimiterOptions"
              label="Delimitador (CSV)"
              outlined
              dense
            />

            <q-select
              v-model="options.encoding"
              :options="encodingOptions"
              label="Codificação"
              outlined
              dense
            />

            <q-checkbox
              v-model="options.headerRow"
              label="Primeira linha contém cabeçalhos"
            />

            <q-checkbox
              v-model="options.skipDuplicates"
              label="Ignorar contatos duplicados"
            />
          </div>

          <!-- Template de Exemplo -->
          <div>
            <q-btn
              outline
              color="primary"
              icon="download"
              label="Baixar Modelo"
              @click="downloadTemplate"
            />
            <div class="text-caption q-mt-sm">
              Baixe nosso modelo para garantir uma importação correta dos dados
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section v-if="previewData.length" class="q-pt-none">
        <div class="text-subtitle2 q-mb-sm">Preview dos Dados</div>
        <q-table
          :rows="previewData"
          :columns="previewColumns"
          dense
          flat
          :pagination="{ rowsPerPage: 5 }"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="primary" v-close-popup />
        <q-btn
          :loading="importing"
          :disable="!hasFile"
          label="Importar"
          color="primary"
          @click="startImport"
        />
      </q-card-actions>

      <!-- Progress Dialog -->
      <q-dialog v-model="showProgress">
        <q-card style="min-width: 300px">
          <q-card-section>
            <div class="text-h6">Importando Contatos</div>
          </q-card-section>

          <q-card-section>
            <div class="text-body1 q-mb-md">
              {{ progressStatus }}
            </div>
            <q-linear-progress
              :value="progress"
              color="primary"
              class="q-mt-md"
            />
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useNotificationSystem } from '../../composables/sistema/useNotificationSystem'
import * as XLSX from 'xlsx'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'import'])

// Composables
const $q = useQuasar()
const { notifyError, notifyWarning } = useNotificationSystem()

// Estado
const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const uploader = ref(null)
const importing = ref(false)
const showProgress = ref(false)
const progress = ref(0)
const progressStatus = ref('')
const previewData = ref([])
const currentFile = ref(null)

const options = ref({
  delimiter: ',',
  encoding: 'UTF-8',
  headerRow: true,
  skipDuplicates: true
})

// Opções
const delimiterOptions = [
  { label: 'Vírgula (,)', value: ',' },
  { label: 'Ponto e vírgula (;)', value: ';' },
  { label: 'Tabulação (\\t)', value: '\t' }
]

const encodingOptions = [
  { label: 'UTF-8', value: 'UTF-8' },
  { label: 'ISO-8859-1', value: 'ISO-8859-1' },
  { label: 'Windows-1252', value: 'Windows-1252' }
]

const previewColumns = [
  { name: 'name', label: 'Nome', field: 'name', align: 'left' },
  { name: 'phone', label: 'Telefone', field: 'phone', align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' }
]

// Computed
const hasFile = computed(() => currentFile.value !== null)

// Métodos
const checkFileType = (files) => {
  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  return files.filter(file => allowedTypes.includes(file.type))
}

const onRejected = (rejectedEntries) => {
  notifyWarning('Arquivo inválido. Use apenas arquivos CSV ou Excel.')
}

const uploadFile = async (files) => {
  if (files.length === 0) return

  const file = files[0]
  currentFile.value = file

  try {
    if (file.name.endsWith('.csv')) {
      await handleCSV(file)
    } else {
      await handleExcel(file)
    }
  } catch (error) {
    notifyError('Erro ao processar arquivo')
    console.error('Erro ao processar arquivo:', error)
  }
}

const handleCSV = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const rows = text.split('\n')
      
      if (rows.length > 0) {
        const preview = rows
          .slice(options.value.headerRow ? 1 : 0, 6)
          .map(row => {
            const [name, phone, email] = row.split(options.value.delimiter)
            return { name, phone, email }
          })
        previewData.value = preview
      }
      resolve()
    }
    reader.readAsText(file, options.value.encoding)
  })
}

const handleExcel = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
      
      if (rows.length > 0) {
        const preview = rows
          .slice(options.value.headerRow ? 1 : 0, 6)
          .map(row => ({
            name: row[0],
            phone: row[1],
            email: row[2]
          }))
        previewData.value = preview
      }
      resolve()
    }
    reader.readAsArrayBuffer(file)
  })
}

const startImport = async () => {
  if (!currentFile.value) return

  importing.value = true
  showProgress.value = true
  progress.value = 0
  progressStatus.value = 'Iniciando importação...'

  try {
    const formData = new FormData()
    formData.append('file', currentFile.value)
    formData.append('options', JSON.stringify(options.value))

    emit('import', formData)
    
    showDialog.value = false
    resetForm()
  } catch (error) {
    notifyError('Erro ao importar contatos')
    console.error('Erro na importação:', error)
  } finally {
    importing.value = false
    showProgress.value = false
  }
}

const downloadTemplate = () => {
  const link = document.createElement('a')
  link.href = '/templates/contacts-import-template.xlsx'
  link.download = 'modelo-importacao-contatos.xlsx'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const resetForm = () => {
  currentFile.value = null
  previewData.value = []
  options.value = {
    delimiter: ',',
    encoding: 'UTF-8',
    headerRow: true,
    skipDuplicates: true
  }
  if (uploader.value) {
    uploader.value.reset()
  }
}

defineExpose({
  resetForm
})
</script>

<style lang="scss" scoped>
.preview-table {
  max-height: 200px;
  overflow-y: auto;
}
</style>
