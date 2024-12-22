import { defineStore } from 'pinia'

export const useWhatsAppStore = defineStore('whatsapp', {
  state: () => ({
    whatsApps: []
  }),

  actions: {
    loadWhatsApps(payload) {
      this.whatsApps = payload
    },

    updateWhatsApps(whatsApp) {
      let newWhats = [...this.whatsApps]
      const whatsAppIndex = newWhats.findIndex(s => s.id === whatsApp.id)
      
      if (whatsAppIndex !== -1) {
        newWhats[whatsAppIndex] = whatsApp
      } else {
        newWhats = [whatsApp, ...newWhats]
      }
      
      this.whatsApps = [...newWhats]
    },

    updateSession(whatsApp) {
      const whatsAppIndex = this.whatsApps.findIndex(s => s.id === whatsApp.id)

      if (whatsAppIndex !== -1) {
        this.whatsApps[whatsAppIndex] = {
          ...this.whatsApps[whatsAppIndex],
          status: whatsApp.status,
          updatedAt: whatsApp.updatedAt,
          qrcode: whatsApp.qrcode,
          retries: whatsApp.retries
        }
      }
    },

    deleteWhatsApp(whatsAppId) {
      const whatsAppIndex = this.whatsApps.findIndex(s => s.id === whatsAppId)
      if (whatsAppIndex !== -1) {
        this.whatsApps.splice(whatsAppIndex, 1)
      }
    },

    resetWhatsApps() {
      this.whatsApps = []
    }
  },

  getters: {
    getAllWhatsApps: (state) => state.whatsApps,
    getWhatsAppById: (state) => (id) => state.whatsApps.find(w => w.id === id)
  }
})
