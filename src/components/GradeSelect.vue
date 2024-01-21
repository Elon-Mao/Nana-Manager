<script setup lang="ts">
import { computed } from 'vue'

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
const grades = ['G3', 'G2', 'G1', 'C3', 'C2', 'C1', 'X6', 'X5', 'X4', 'X3', 'X2', 'X1']
</script>

<template>
  <el-select v-bind="$attrs" v-model="value">
    <el-option v-for="(grade, index) in grades" :key="grade" :label="grade" :value="11 - index" />
  </el-select>
</template>

<style scoped>
</style>