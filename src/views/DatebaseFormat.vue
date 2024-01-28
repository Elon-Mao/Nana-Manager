<script setup lang="ts">
import {
  doc,
  setDoc
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useCourseStore, type CourseWithId } from '@/stores/courses'
import { useStudentStore, type StudentWithId } from '@/stores/students'
import { useCourseStudentStore, type CourseStudentWithId } from '@/stores/course-student'

const studentStore = useStudentStore()
const courseStore = useCourseStore()
const courseStudentStore = useCourseStudentStore()

const exportDatebase = async () => {
  const students = await studentStore.getAll()
  const courses = await courseStore.getAll()
  const courseStudentList = await courseStudentStore.getAll()
  const blob = new Blob([JSON.stringify({
    students, courses, courseStudentList
  })], { type: "application/octet-stream" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "Nana-manager-firebase.txt"
  a.style.display = "none"
  document.body.appendChild(a)
  a.click()
  URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

const onFileChange = (event: Event) => {
  const reader = new FileReader()
  reader.onload = async function (e) {
    await Promise.all(['students', 'courses', 'course-student']
      .map((storeId) => setDoc(doc(db, storeId, 'briefEntities'), {})))
    const fileContent = e.target!.result as string
    const { students, courses, courseStudentList } = JSON.parse(fileContent)
    students.forEach((student: StudentWithId) => {
      studentStore.setById(student.id, student)
    })
    courses.forEach((course: CourseWithId) => {
      courseStore.setById(course.id, course)
    })
    courseStudentList.forEach((courseStudent: CourseStudentWithId) => {
      courseStudentStore.setById(courseStudent.id, courseStudent)
    })
  }
  const inputElement = event.target as HTMLInputElement
  reader.readAsText(inputElement.files![0])
}
</script>

<template>
  <el-button @click="exportDatebase" type="primary" style="width: 200px;">Export Datebase</el-button>
  <input v-on:change="onFileChange" type="file" accept=".txt" />
</template>

<style scoped></style>
