<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import { useSystemStore } from '@/stores/system'

const systemStore = useSystemStore()
</script>

<template>
  <AppHeader></AppHeader>
  <RouterView v-loading.fullscreen.lock="systemStore.loading"/>
</template>

<style scoped>
</style>