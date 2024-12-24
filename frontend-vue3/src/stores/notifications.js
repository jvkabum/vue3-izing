import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    notifications_p: []
  }),

  actions: {
    updateNotifications(payload) {
      this.notifications = payload
    },

    updateNotificationsP(payload) {
      this.notifications_p = payload
    }
  },

  getters: {
    getNotifications: (state) => state.notifications,
    getNotificationsP: (state) => state.notifications_p
  }
})
