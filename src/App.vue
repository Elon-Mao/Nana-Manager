<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import { useSystemStore } from '@/stores/system'

const systemStore = useSystemStore()
</script>

<template>
  <AppHeader v-loading.fullscreen.lock="systemStore.loading"></AppHeader>
  <RouterView />
</template>

<style scoped>
</style>