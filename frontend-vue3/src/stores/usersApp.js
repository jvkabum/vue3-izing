import { defineStore } from 'pinia'

export const useUsersAppStore = defineStore('usersApp', {
  state: () => ({
    usersApp: []
  }),

  actions: {
    setUsersApp(payload) {
      this.usersApp = payload
    }
  },

  getters: {
    getUsersApp: (state) => state.usersApp
  }
})
