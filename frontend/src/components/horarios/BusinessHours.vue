<template>
  <div class="business-hours">
    <!-- Cabeçalho -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Horário de Atendimento</div>
      <div class="row q-gutter-sm">
        <q-btn
          color="primary"
          icon="add"
          label="Novo Horário"
          @click="openScheduleDialog()"
        />
      </div>
    </div>

    <!-- Calendário Semanal -->
    <div class="schedule-calendar q-mb-lg">
      <div v-for="day in weekDays" :key="day.value" class="day-column">
        <div class="day-header" :class="{ 'day-active': isDayActive(day.value) }">
          <div class="day-name">{{ day.label }}</div>
          <q-toggle
            v-model="activeDays"
            :val="day.value"
            dense
            class="day-toggle"
          />
        </div>
        
        <div class="time-slots" :class="{ 'time-slots--disabled': !isDayActive(day.value) }">
          <template v-if="isDayActive(day.value)">
            <div
              v-for="(schedule, index) in getDaySchedules(day.value)"
              :key="index"
              class="time-slot"
            >
              <div class="time-range">
                {{ formatTime(schedule.start) }} - {{ formatTime(schedule.end) }}
              </div>
              <div class="time-actions">
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="edit"
                  @click="openScheduleDialog(schedule, day.value)"
                >
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  @click="confirmDelete(schedule, day.value)"
                >
                  <q-tooltip>Excluir</q-tooltip>
                </q-btn>
              </div>
            </div>

            <q-btn
              flat
              color="primary"
              class="full-width q-mt-sm"
              icon="add"
              label="Adicionar Horário"
              @click="openScheduleDialog(null, day.value)"
            />
          </template>
          <div v-else class="closed-message">
            Fechado
          </div>
        </div>
      </div>
    </div>

    <!-- Exceções -->
    <div class="exceptions-section q-mb-lg">
      <div class="text-subtitle1 q-mb-sm">Exceções</div>
      <q-list bordered separator>
        <q-item v-for="exception in exceptions" :key="exception.id">
          <q-item-section>
            <q-item-label>{{ formatDate(exception.date) }}</q-item-label>
            <q-item-label caption>
              <template v-if="exception.type === 'closed'">
                Fechado
              </template>
              <template v-else>
                {{ formatTime(exception.start) }} - {{ formatTime(exception.end) }}
              </template>
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="row q-gutter-sm">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="edit"
                @click="openExceptionDialog(exception)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                @click="confirmDeleteException(exception)"
              >
                <q-tooltip>Excluir</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>

        <q-item clickable @click="openExceptionDialog()">
          <q-item-section avatar>
            <q-icon name="add" color="primary" />
          </q-item-section>
          <q-item-section>
            Adicionar Exceção
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Configurações Gerais -->
    <div class="settings-section">
      <div class="text-subtitle1 q-mb-sm">Configurações</div>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-select
            v-model="settings.timezone"
            :options="timezoneOptions"
            label="Fuso Horário"
            outlined
            dense
          />
        </div>
        <div class="col-12 col-md-6">
          <q-input
            v-model="settings.breakTime"
            type="number"
            label="Intervalo entre Atendimentos (min)"
            outlined
            dense
          />
        </div>
        <div class="col-12">
          <q-input
            v-model="settings.closedMessage"
            type="textarea"
            label="Mensagem Fora do Horário"
            outlined
            autogrow
          />
        </div>
      </div>
    </div>

    <!-- Dialogs -->
    <schedule-dialog
      v-model="showScheduleDialog"
      :schedule="selectedSchedule"
      :day="selectedDay"
      @save="saveSchedule"
    />

    <exception-dialog
      v-model="showExceptionDialog"
      :exception="selectedException"
      @save="saveException"
    />

    <!-- Dialog de Confirmação -->
    <q-dialog v-model="showConfirmDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span class="q-ml-sm">
            {{ confirmMessage }}
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn
            flat
            label="Excluir"
            color="negative"
            @click="handleConfirmDelete"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { date } from 'quasar'
import { useWorkHours } from '../../composables/data-hora/useWorkHours'
import { useNotificationSystem } from '../../composables/sistema/useNotificationSystem'
import ScheduleDialog from './ScheduleDialog.vue'
import ExceptionDialog from './ExceptionDialog.vue'

// Composables
const { notifySuccess, notifyError } = useNotificationSystem()
const {
  schedules,
  exceptions,
  settings,
  saveSchedule: saveScheduleData,
  saveException: saveExceptionData,
  deleteSchedule: deleteScheduleData,
  deleteException: deleteExceptionData
} = useWorkHours()

// Estado
const activeDays = ref(['1', '2', '3', '4', '5']) // Segunda a Sexta
const showScheduleDialog = ref(false)
const showExceptionDialog = ref(false)
const showConfirmDialog = ref(false)
const selectedSchedule = ref(null)
const selectedException = ref(null)
const selectedDay = ref(null)
const itemToDelete = ref(null)
const deleteType = ref(null)
const confirmMessage = ref('')

// Constantes
const weekDays = [
  { label: 'Domingo', value: '0' },
  { label: 'Segunda', value: '1' },
  { label: 'Terça', value: '2' },
  { label: 'Quarta', value: '3' },
  { label: 'Quinta', value: '4' },
  { label: 'Sexta', value: '5' },
  { label: 'Sábado', value: '6' }
]

const timezoneOptions = [
  { label: 'Brasília (UTC-3)', value: 'America/Sao_Paulo' },
  { label: 'Fernando de Noronha (UTC-2)', value: 'America/Noronha' },
  { label: 'Manaus (UTC-4)', value: 'America/Manaus' },
  { label: 'Acre (UTC-5)', value: 'America/Rio_Branco' }
]

// Métodos
const isDayActive = (day) => {
  return activeDays.value.includes(day)
}

const getDaySchedules = (day) => {
  return schedules.value.filter(s => s.day === day)
}

const formatTime = (time) => {
  return date.formatDate(time, 'HH:mm')
}

const formatDate = (dateStr) => {
  return date.formatDate(dateStr, 'DD/MM/YYYY')
}

const openScheduleDialog = (schedule = null, day = null) => {
  selectedSchedule.value = schedule
  selectedDay.value = day
  showScheduleDialog.value = true
}

const openExceptionDialog = (exception = null) => {
  selectedException.value = exception
  showExceptionDialog.value = true
}

const confirmDelete = (schedule, day) => {
  itemToDelete.value = { schedule, day }
  deleteType.value = 'schedule'
  confirmMessage.value = 'Deseja realmente excluir este horário?'
  showConfirmDialog.value = true
}

const confirmDeleteException = (exception) => {
  itemToDelete.value = exception
  deleteType.value = 'exception'
  confirmMessage.value = 'Deseja realmente excluir esta exceção?'
  showConfirmDialog.value = true
}

const handleConfirmDelete = async () => {
  try {
    if (deleteType.value === 'schedule') {
      await deleteScheduleData(itemToDelete.value.schedule.id)
      notifySuccess('Horário excluído com sucesso')
    } else {
      await deleteExceptionData(itemToDelete.value.id)
      notifySuccess('Exceção excluída com sucesso')
    }
  } catch (err) {
    notifyError('Erro ao excluir item')
  }
}

const saveSchedule = async (scheduleData) => {
  try {
    await saveScheduleData(scheduleData)
    showScheduleDialog.value = false
    notifySuccess('Horário salvo com sucesso')
  } catch (err) {
    notifyError('Erro ao salvar horário')
  }
}

const saveException = async (exceptionData) => {
  try {
    await saveExceptionData(exceptionData)
    showExceptionDialog.value = false
    notifySuccess('Exceção salva com sucesso')
  } catch (err) {
    notifyError('Erro ao salvar exceção')
  }
}
</script>

<style lang="scss" scoped>
.business-hours {
  padding: 20px;

  .schedule-calendar {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 16px;
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);

    .day-column {
      .day-header {
        text-align: center;
        padding: 8px;
        border-radius: 4px 4px 0 0;
        background: rgba(0, 0, 0, 0.03);

        &.day-active {
          background: var(--q-primary);
          color: white;
        }

        .day-name {
          font-weight: 500;
          margin-bottom: 4px;
        }
      }

      .time-slots {
        padding: 8px;
        min-height: 100px;
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-top: none;
        border-radius: 0 0 4px 4px;

        &--disabled {
          background: rgba(0, 0, 0, 0.02);
        }

        .time-slot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px;
          margin-bottom: 4px;
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.03);

          .time-range {
            font-size: 12px;
          }

          .time-actions {
            display: flex;
            gap: 4px;
          }
        }

        .closed-message {
          text-align: center;
          color: rgba(0, 0, 0, 0.4);
          padding: 16px 0;
        }
      }
    }
  }

  .exceptions-section,
  .settings-section {
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
  }
}

.dark {
  .schedule-calendar,
  .exceptions-section,
  .settings-section {
    background: $dark;
  }

  .day-column {
    .day-header {
      background: rgba(255, 255, 255, 0.05);
    }

    .time-slots {
      border-color: rgba(255, 255, 255, 0.12);

      &--disabled {
        background: rgba(255, 255, 255, 0.03);
      }

      .time-slot {
        background: rgba(255, 255, 255, 0.05);
      }

      .closed-message {
        color: rgba(255, 255, 255, 0.4);
      }
    }
  }
}
</style>
