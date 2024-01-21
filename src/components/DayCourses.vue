<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCourseStore } from '@/stores/courses'
import { useStudentStore } from '@/stores/students'
import type { Course } from '@/stores/courses'
import type { StudentNav } from '@/stores/students'

interface CourseInfo extends Course {
  id: string
  top: string
  height: string
  gradeText: string
  students: StudentNav[]
}

const router = useRouter()
const props = defineProps(['date', 'day'])
const eightAm = new Date(props.date + ' 08:00')
const hourScale = 60 * 60 * 1000 / 30
const courseStore = useCourseStore()
const studentStore = useStudentStore()

const courseNavs = computed(() => {
  return courseStore.courses.filter((course) => course.date === props.date)
})
watch(courseNavs, () => {
  courseNavs.value.forEach((courseNav) => {
    courseStore.getCourse(courseNav.id)
  })
}, { immediate: true })

const grades = ['X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'C1', 'C2', 'C3', 'G1', 'G2', 'G3']
const courses = computed(() => {
  const result: CourseInfo[] = []
  for (const courseNav of courseNavs.value) {
    const course = courseStore.courseMap[courseNav.id]
    if (!course) {
      return []
    }
    const startTime = new Date(`${course.date} ${course.startTime}`)
    const endTime = new Date(`${course.date} ${course.endTime}`)
    result.push({
      id: courseNav.id,
      top: (startTime.getTime() - eightAm.getTime()) / hourScale + 'px',
      height: (endTime.getTime() - startTime.getTime()) / hourScale + 'px',
      gradeText: grades[course.grade],
      students: course.studentIds.map((studentId) => studentStore.students.find((student) => student.id === studentId)!),
      ...course
    })
  }
  return result
})

const courseDetail = (courseId: string) => {
  router.push(`/courses/${courseId}`)
}
</script>

<template>
  <div class="day-courses">
    <div>{{ props.date }}</div>
    <div>{{ props.day }}</div>
    <div class="courses-wrapper">
      <div class="course" v-for="course in courses" :key="course.id" :style="{ top: course.top, height: course.height }"
        @click="courseDetail(course.id)">
        <span>{{ `${course.startTime}~${course.endTime}` }}</span>
        <span>{{ `${course.gradeText}` }}</span>
        <span v-for="student in course.students" :key="student.id">
          {{ student.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.day-courses {
  height: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: small;
}

.courses-wrapper {
  position: relative;
  flex-grow: 1;
  width: 100%;
}

.course {
  position: absolute;
  width: 100%;
  box-sizing: border-box;
  padding: 4px;
  overflow: hidden;
}

.course span {
  margin-right: 5px;
  white-space: nowrap;
}

.course:hover {
  cursor: pointer;
  background-color: #ecf5ff;
}
</style>