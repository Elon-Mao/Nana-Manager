import { defineStore } from 'pinia'

let loadingTimeoutId: number

export const useSystemStore = defineStore('system', {
  state: () => {
    return {
      loading: true
    }
  },
  actions: {
    setLoading(loading: boolean) {
      clearTimeout(loadingTimeoutId);
      loadingTimeoutId = setTimeout(() => {
        this.loading = loading
      }, 300)
    }
  }
})