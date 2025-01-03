<template>
  <div v-if="userProfile === 'admin'">
    <q-card bordered>
      <q-card-section>
        <div class="text-h6 q-px-sm">Relatório de Contatos</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <fieldset class="rounded-all">
          <legend class="q-px-sm">Filtros (Data criação do contato)</legend>
          <div class="row q-gutter-md items-end">
            <div class="col-grow">
              <label>Início</label>
              <DatePick
                dense
                rounded
                v-model="pesquisa.startDate"
              />
            </div>
            <div class="col-grow">
              <label>Final</label>
              <DatePick
                dense
                rounded
                v-model="pesquisa.endDate"
              />
            </div>
            <div class="col-grow text-center">
              <q-btn
                rounded
                class="q-mr-sm"
                color="primary"
                label="Gerar"
                icon="refresh"
                @click="gerarRelatorio"
              />
              <q-btn
                class="q-mr-sm"
                color="black"
                rounded
                icon="print"
                label="Imprimir"
                @click="printReport"
              />
              <q-btn
                color="warning"
                label="Excel"
                rounded
                @click="exportTable"
              />
            </div>
          </div>
        </fieldset>
      </q-card-section>
    </q-card>

    <div class="row">
      <div class="col-xs-12 q-mt-sm">
        <div
          class="tableLarge q-ma-sm q-markup-table q-table__container q-table__card q-table--cell-separator q-table--flat q-table--bordered q-table--no-wrap"
          id="tRelatorioContatos"
        >
          <table id="tableRelatorioContatos" class="q-pb-md q-table q-tabs--dense">
            <thead>
              <tr>
                <td
                  v-for="col in bl_sintetico ? columns.filter(c => c.name == opcoesRelatorio.agrupamento) : columns"
                  :key="col.name"
                >
                  {{ col.label }}
                </td>
              </tr>
            </thead>
            <tbody>
              <template v-if="!bl_sintetico">
                <tr v-for="row in contatos" :key="row.number">
                  <td
                    v-for="col in columns"
                    :key="col.name + '-' + row.id"
                    :class="col.class"
                    :style="col.style"
                  >
                    {{ col.format !== void 0 ? col.format(row[col.field], row) : row[col.field] }}
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <CcPrintModelLandscape
      id="slotTableRelatorioContatos"
      :imprimirRelatorio="imprimir"
      title="Relatório de Contatos"
      :styleP="`
      table { width: 100%; font-size: 10px; border-spacing: 1; border-collapse: collapse; }
      #tableReport tr td { border:1px solid #DDD; padding-left: 10px; padding-right: 10px; }
      #tableReport thead tr:nth-child(1) td { text-align: center; padding: 5px; font-weight: bold; color: #000; background: lightgrey; opacity: 1; }
      #lineGroup { background: #f8f8f8; line-height: 30px; }
      #quebraAgrupamentoRelatorio { border-bottom: 1px solid black !important; }
      #st_nome, #st_tipo_atendimento, #st_status_faturamento, #st_convenio, #st_nome_profissional, #st_status, #st_nome_unidade, #st_nome_profissional { width: 200px; word-wrap: normal !important; white-space: normal !important; }
      #dt_atendimento_unidade { width: 100px; text-align: center }
      `"
    >
      <template v-slot:body>
        <table class="q-pb-md q-table q-tabs--dense">
          <thead>
            <tr>
              <td
                v-for="col in bl_sintetico ? columns.filter(c => c.name == opcoesRelatorio.agrupamento) : columns"
                :key="col.name"
              >
                {{ col.label }}
              </td>
            </tr>
          </thead>
          <tbody>
            <template v-if="!bl_sintetico">
              <tr v-for="row in contatos" :key="row.number">
                <td
                  v-for="col in columns"
                  :key="col.name + '-' + row.id"
                  :class="col.class"
                  :style="col.style"
                >
                  {{ col.format !== void 0 ? col.format(row[col.field], row) : row[col.field] }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </template>
    </CcPrintModelLandscape>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted } from 'vue'
import { format, sub } from 'date-fns'
import CcPrintModelLandscape from './ccPrintModelLandscape.vue'
import XLSX from 'xlsx'
import { RelatorioContatos } from 'src/service/estatisticas'

export default defineComponent({
  name: 'RelatorioContatosGeral',
  components: { CcPrintModelLandscape },
  props: {
    moduloAtendimento: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const userProfile = ref('user')
    const data = ref(null)
    const bl_sintetico = ref(false)
    const contatos = ref([])
    const imprimir = ref(false)
    const ExibirTabela = ref(true)

    const pesquisa = reactive({
      startDate: format(sub(new Date(), { days: 30 }), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd')
    })

    const columns = [
      { 
        name: 'name', 
        label: 'Nome', 
        field: 'name', 
        align: 'left', 
        style: 'width: 300px', 
        format: v => replaceEmojis(v) 
      },
      { 
        name: 'number', 
        label: 'WhatsApp', 
        field: 'number', 
        align: 'center', 
        style: 'width: 300px' 
      },
      { 
        name: 'email', 
        label: 'Email', 
        field: 'email', 
        style: 'width: 500px', 
        align: 'left' 
      }
    ]

    const replaceEmojis = str => {
      const ranges = [
        '[\u00A0-\u269f]',
        '[\u26A0-\u329f]',
        '[🀄-🧀]'
      ]
      return str.replace(new RegExp(ranges.join('|'), 'ug'), '')
    }

    const sortObject = obj => Object.keys(obj)
      .sort()
      .reduce((a, v) => {
        a[v] = obj[v]
        return a
      }, {})

    const printReport = () => {
      imprimir.value = !imprimir.value
    }

    const exportTable = () => {
      const json = XLSX.utils.table_to_sheet(
        document.getElementById('tableRelatorioContatos'),
        { raw: true }
      )
      for (const col in json) {
        if (col[0] === 'J') {
          json[col].t = 'n'
          json[col].v = json[col].v.replace(/\./g, '').replace(',', '.')
        }
      }
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, json, 'Relatório Atendimentos')
      XLSX.writeFile(wb, 'Atendimentos-TESTE.xlsx')
    }

    const gerarRelatorio = async () => {
      const { data: contatosData } = await RelatorioContatos(pesquisa)
      contatos.value = contatosData.contacts
    }

    onMounted(() => {
      userProfile.value = localStorage.getItem('profile')
      gerarRelatorio()
    })

    return {
      userProfile,
      data,
      bl_sintetico,
      contatos,
      columns,
      pesquisa,
      ExibirTabela,
      imprimir,
      replaceEmojis,
      sortObject,
      printReport,
      exportTable,
      gerarRelatorio
    }
  }
})
</script>

<style scoped>
.text-right {
  text-align: right;
}

thead tr:nth-child(1) td {
  color: #000;
  background: lightgrey;
  position: sticky;
  opacity: 1;
  top: 0;
  z-index: 1000;
}

.tableSmall {
  max-height: calc(100vh - 130px);
  height: calc(100vh - 130px);
}

.tableLarge {
  max-height: calc(100vh - 220px);
  height: calc(100vh - 220px);
}
</style>
