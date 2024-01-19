<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth'
import { auth, provider } from '@/config/firebase'

const route = useRoute()
const router = useRouter()
const defaultActive = computed(() => route.path.includes('students') ? '/students/' : '/courses/')
const userStore = useUserStore()
onAuthStateChanged(auth, (user) => {
  userStore.setUser(user)
})
const onSelect = (index: string) => {
  router.push(index)
}
</script>

<template>
  <header>
    <el-button v-if="!userStore.user" @click="signInWithPopup(auth, provider)">Sign In with Google</el-button>
    <el-menu v-else :default-active="defaultActive" mode="horizontal" @select="onSelect">
      <el-menu-item index="/students/">Student Manage</el-menu-item>
      <el-menu-item index="/courses/">Course Manage</el-menu-item>
    </el-menu>
  </header>
</template>

<style scoped>
header {
  position: sticky;
  top: 0;
  z-index: 1;
}

header ul {
  justify-content: center;
}
</style>