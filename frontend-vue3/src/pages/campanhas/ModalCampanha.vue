<template>
  <q-dialog
    persistent
    :value="modalCampanha"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      class="q-pa-sm"
      style="min-width: 70vw;"
    >
      <q-card-section class="q-pa-none q-px-md">
        <div class="text-h6 text-bold">{{ campanhaEdicao.id ? 'Editar' : 'Criar' }} Campanha</div>
        <div class="row">
          As mensagens sempre serão enviadas em horário comercial e dias úteis.
        </div>
      </q-card-section>
      <q-card-section class="q-pb-none">
        <div class="row q-gutter-sm">
          <q-input
            outlined
            dense
            rounded
            style="width: 500px"
            v-model="campanha.name"
            label="Nome da Campanha"
            @blur="v$.campanha.name.$touch"
            :error="v$.campanha.name.$error"
            error-message="Obrigatório"
          />
          <q-datetime-picker
            style="width: 200px"
            dense
            rounded
            hide-bottom-space
            outlined
            stack-label
            bottom-slots
            label="Data/Hora início"
            mode="datetime"
            color="primary"
            format24h
            v-model="campanha.start"
            @blur="v$.campanha.start.$touch"
            :error="v$.campanha.start.$error"
            error-message="Não pode ser inferior ao dia atual"
          />
          <q-select
            rounded
            dense
            outlined
            emit-value
            map-options
            label="Enviar por"
            color="primary"
            v-model="campanha.sessionId"
            :options="cSessions"
            :input-debounce="700"
            option-value="id"
            option-label="name"
            input-style="width: 280px; max-width: 280px;"
            @blur="v$.campanha.sessionId.$touch"
            :error="v$.campanha.sessionId.$error"
            error-message="Obrigatório"
            style="width: 250px"
          />
          <q-file
            dense
            rounded
            v-if="!campanha.mediaUrl"
            :loading="loading"
            label="Mídia composição mensagem"
            ref="PickerFileMessage"
            v-model="arquivos"
            class="col-grow"
            bg-color="blue-grey-1"
            input-style="max-height: 30vh"
            outlined
            clearable
            autogrow
            append
            :max-files="1"
            counter
            :max-file-size="10485760"
            :max-total-size="30485760"
            accept=".jpg, .png, image/jpeg, .pdf, .doc, .docx, .mp4, .xls, .xlsx, .jpeg, .zip, .ppt, .pptx, image/*"
            @rejected="onRejectedFiles"
            style="width: 350px"
          />
          <q-input
            v-if="campanha.mediaUrl"
            readonly
            rounded
            label="Mídia composição mensagem"
            :value="cArquivoName"
            class="col-grow"
            bg-color="blue-grey-1"
            input-style="max-height: 30vh"
            outlined
            autogrow
            append
            counter
            style="width: 350px"
          >
            <template v-slot:append>
              <q-btn
                round
                dense
                flat
                icon="close"
                @click="campanha.mediaUrl = null; arquivos = []"
              />
            </template>
          </q-input>
        </div>
      </q-card-section>
      <q-card-section class="row q-pt-sm q-gutter-sm justify-center">
        <div style="min-width: 400px;">
          <div class="row items-center q-pt-none">
            <label class="text-heading text-bold">1ª Mensagem</label>
            <div class="col-xs-3 col-sm-2 col-md-1">
              <q-btn
                round
                flat
                class="q-ml-sm"
              >
                <q-icon
                  size="2em"
                  name="mdi-emoticon-happy-outline"
                />
                <q-tooltip>
                  Emoji
                </q-tooltip>
                <q-menu
                  anchor="top right"
                  self="bottom middle"
                  :offset="[5, 40]"
                >
                  <Picker
                    :data="emojiData"
                    :native="true"
                    @select="emoji => onInsertSelectEmoji(emoji, 'message1')"
                    title="Escolha um emoji..."
                  />
                </q-menu>
              </q-btn>
            </div>
            <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
              <textarea
                ref="message1"
                style="min-height: 12.5vh; max-height: 12.5vh;"
                class="q-pa-sm bg-white full-width rounded-all"
                :class="{
                  'bg-red-1': v$.campanha.message1.$error
                }"
                @blur="v$.campanha.message1.$touch"
                placeholder="Digite a mensagem"
                autogrow
                dense
                outlined
                @input="e => campanha.message1 = e.target.value"
                :value="campanha.message1"
              />
              <q-btn
                round
                flat
                dense
              >
                <q-icon
                  size="2em"
                  name="mdi-variable"
                />
                <q-tooltip>
                  Variáveis
                </q-tooltip>
                <q-menu touch-position>
                  <q-list dense style="min-width: 100px">
                    <q-item
                      v-for="variavel in variaveis"
                      :key="variavel.label"
                      clickable
                      @click="() => onInsertSelectVariable(variavel.value, 'message1', 'message1')"
                      v-close-popup
                    >
                      <q-item-section>{{ variavel.label }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row justify-center">
          <q-btn
            label="Cancelar"
            color="negative"
            v-close-popup
            class="q-mr-md"
            rounded
          />
          <q-btn
            rounded
            label="Salvar"
            color="positive"
            icon="save"
            @click="handleCampanha"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
// ... resto do script igual ao anterior ...
</script>

<style lang="scss">
.border-error {
  border: 3px solid red;
  background: red !important;
}
</style>
