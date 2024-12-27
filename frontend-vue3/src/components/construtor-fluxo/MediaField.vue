<template>
  <div class="media-field">
    <div class="field-header">
      <div class="field-title">{{ title }}</div>
      <q-btn
        flat
        round
        dense
        icon="add"
        @click="handleAddMedia"
      />
    </div>

    <div class="media-list">
      <div
        v-for="(media, index) in modelValue"
        :key="index"
        class="media-item"
      >
        <div class="media-preview">
          <img
            v-if="media.type.startsWith('image')"
            :src="media.url"
            alt="Preview"
          />
          <q-icon
            v-else-if="media.type.startsWith('video')"
            name="movie"
            size="32px"
          />
          <q-icon
            v-else-if="media.type.startsWith('audio')"
            name="music_note"
            size="32px"
          />
          <q-icon
            v-else
            name="insert_drive_file"
            size="32px"
          />
        </div>

        <div class="media-info">
          <div class="media-name">{{ media.name }}</div>
          <div class="media-type">{{ media.type }}</div>
        </div>

        <q-btn
          flat
          round
          dense
          icon="delete"
          @click="handleRemoveMedia(index)"
        />
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      multiple
      hidden
      @change="handleFileChange"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Mídia'
  },
  accept: {
    type: String,
    default: 'image/*,video/*,audio/*'
  }
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)

const handleAddMedia = () => {
  fileInput.value?.click()
}

const handleFileChange = (event) => {
  const files = Array.from(event.target.files || [])
  
  const newMedia = files.map(file => ({
    name: file.name,
    type: file.type,
    size: file.size,
    url: URL.createObjectURL(file),
    file
  }))

  emit('update:modelValue', [...props.modelValue, ...newMedia])
  event.target.value = ''
}

const handleRemoveMedia = (index) => {
  const newValue = [...props.modelValue]
  newValue.splice(index, 1)
  emit('update:modelValue', newValue)
}
</script>

<style lang="scss" scoped>
.media-field {
  .field-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .field-title {
      font-weight: 500;
    }
  }

  .media-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .media-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;

    .media-preview {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 4px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .media-info {
      flex: 1;
      min-width: 0;

      .media-name {
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .media-type {
        font-size: 12px;
        color: #666;
      }
    }
  }
}
</style>
