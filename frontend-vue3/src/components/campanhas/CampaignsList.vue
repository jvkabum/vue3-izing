<template>
  <q-list separator>
    <q-item
      v-for="campaign in campaigns"
      :key="campaign.id"
      clickable
      @click="onCampaignClick(campaign)"
    >
      <q-item-section>
        <q-item-label>{{ campaign.name }}</q-item-label>
        <q-item-label caption>{{ campaign.status }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn
          flat
          icon="edit"
          @click.stop="onEdit(campaign)"
        />
        <q-btn
          flat
          icon="delete"
          color="negative"
          @click.stop="onDelete(campaign)"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  campaigns: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'click'])

const onEdit = (campaign) => {
  emit('edit', campaign)
}

const onDelete = (campaign) => {
  emit('delete', campaign)
}

const onCampaignClick = (campaign) => {
  emit('click', campaign)
}
</script>
