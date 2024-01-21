<script setup lang="ts">
import { getFormatDate } from '@/common/dateTools'
import DayCourses from './DayCourses.vue'

const props = defineProps(['mondayDate', 'isCurrent'])

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const mondayDate = new Date(props.mondayDate)
const dayList = [...Array(7).keys()].map((i) => {
  const date = new Date(mondayDate)
  date.setDate(mondayDate.getDate() + i)
  const formatDate = getFormatDate(date)
  return {
    date: formatDate,
    dayName: dayNames[date.getDay()]
  }
})
</script>

<template>
  <el-card>
    <div :class="props.isCurrent ? 'course-shedule' : 'course-shedule shedule-disabled'">
      <day-courses v-for="day in dayList" :key="day.date" :date="day.date" :day="day.dayName" />
    </div>
  </el-card>
</template>

<style scoped>
.course-shedule {
  height: 450px;
  width: 100%;
  display: flex;
}

.shedule-disabled {
  pointer-events: none;
  cursor: default;
}
</style>