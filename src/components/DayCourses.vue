<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCourseStore } from '@/stores/courses'
import { useStudentStore } from '@/stores/students'
import { useCourseStudentStore } from '@/stores/course-student'
import type { CourseBrief } from '@/stores/courses'
import type { StudentBrief } from '@/stores/students'

interface CourseInfo extends CourseBrief {
  id: string
  top: string
  height: string
  gradeText: string
  students: (StudentBrief & {
    id: string
  })[]
}

const router = useRouter()
const props = defineProps(['date', 'day'])
const eightAm = new Date(props.date + ' 08:00')
const hourScale = 60 * 60 * 1000 / 30
const courseStore = useCourseStore()
const studentStore = useStudentStore()
const courseStudentStore = useCourseStudentStore()

const grades = ['X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'C1', 'C2', 'C3', 'G1', 'G2', 'G3']
const courses = computed(() => courseStore.briefEntities
  .filter((course) => course.date === props.date)
  .map((briefEntity) => {
    const startTime = new Date(`${briefEntity.date} ${briefEntity.startTime}`)
    const endTime = new Date(`${briefEntity.date} ${briefEntity.endTime}`)
    return {
      top: (startTime.getTime() - eightAm.getTime()) / hourScale + 'px',
      height: (endTime.getTime() - startTime.getTime()) / hourScale + 'px',
      gradeText: grades[briefEntity.grade],
      students: courseStudentStore.briefEntities
        .filter((courseStudent) => courseStudent.courseId === briefEntity.id)
        .map((courseStudent) => {
          return {
            id: courseStudent.studentId,
            ...studentStore.briefEntityMap[courseStudent.studentId]
          }
        }),
      ...briefEntity
    } as CourseInfo
  }))

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