<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCourseStore } from '@/stores/courses'
import { getFormatDate } from '@/common/dateTools'
import { addUnloadConfirm, removeUnloadConfirm } from '@/common/beforeunload'
import { ElMessageBox } from 'element-plus'

const props = defineProps(['mondayDate', 'isCurrent'])
const courseStore = useCourseStore()

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const mondayDate = new Date(props.mondayDate)
const dayList = computed(() => [...Array(7).keys()].map((i) => {
  const date = new Date(mondayDate)
  date.setDate(mondayDate.getDate() + i)
  const formatDate = getFormatDate(date)
  return {
    date: formatDate,
    dayName: dayNames[date.getDay()],
    courses: courseStore.courses.filter((course) => course.date === formatDate)
  }
}))
// const handleClose = () => {
//   removeUnloadConfirm()
// }
// const handleClose = (done: () => void) => {
//   ElMessageBox.confirm('Are you sure to close this dialog?').then(() => {
//     done()
//   }).catch(() => {
//     // catch error
//   })
// }
</script>

<template>
  <div :class="props.isCurrent ? 'course-shedule' : 'course-shedule shedule-disabled'">
    <div v-for="day in dayList" :key="day.date" class="day">
      <div>{{ day.date }}</div>
      <div>{{ day.dayName }}</div>
      <div class="course" v-for="course in day.courses" :key="course.id">

      </div>
    </div>
  </div>
</template>

<style scoped>
.course-shedule {
  height: 100%;
  background-color: lightblue;
  display: flex;
  justify-content: space-between;
}

.shedule-disabled {
  pointer-events: none;
  cursor: default;
}

.day {
  height: 100%;
  flex-shrink: 0;
  position: relative;
}
</style>