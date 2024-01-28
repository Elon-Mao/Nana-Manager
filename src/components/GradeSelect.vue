<script setup lang="ts">
import { computed } from 'vue'
import { grades } from '@/common/grades'

const props = defineProps(['modelvalue'])
const emit = defineEmits(['update:modelvalue'])
const value = computed({
  get() {
    return props.modelvalue
  },
  set(value) {
    emit('update:modelvalue', value)
  }
})
</script>

<template>
  <el-select v-bind="$attrs" v-model="value">
    <el-option v-for="(grade, index) in grades" :key="grade" :label="grade" :value="index" />
  </el-select>
</template>

<style scoped>
</style>