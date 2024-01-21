import { defineStore } from 'pinia'
import { collection, deleteDoc, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import customPromise from '@/common/customPromise'
import { useStudentStore } from './students'

export interface Course {
  date: string
  startTime: string
  endTime: string
  grade: number
  studentIds: string[]
  summary: string
  remark: string
}

interface CourseNav {
  id: string
  date: string
}

const useCourseStore = defineStore('courses', {
  state: () => {
    return {
      courses: [] as CourseNav[],
      courseMap: {} as Record<string, Course>
    }
  },
  actions: {
    getCourse(id: string) {
      if (this.courseMap[id]) {
        return
      }
      onSnapshot(doc(coursesCollection, id), (newDoc) => {
        this.courseMap[id] = newDoc.data() as Course
      })
    },
    async setCourse(id: string, course: Course) {
      const newCourses = [...this.courses]
      newCourses[newCourses.findIndex((courseItem) => courseItem.id === id)] = {
        id,
        date: course.date
      }
      const studentStore = useStudentStore()
      const oldCourse = this.courseMap[id]
      await customPromise(Promise.all([setDoc(doc(coursesCollection, id), course), updateDoc(coursesNav, {
        courses: newCourses.map((course) => `${course.id},${course.date}`)
      }), ...course.studentIds.filter((studentId) => !oldCourse.studentIds.includes(studentId))
        .map((studentId) => studentStore.addCourse(studentId, id)
        ), ...oldCourse.studentIds.filter((studentId) => !course.studentIds.includes(studentId))
          .map((studentId) => studentStore.deleteCourse(studentId, id)
          )]))
    },
    async addCourse(course: Course) {
      const courseDoc = doc(coursesCollection)
      this.getCourse(courseDoc.id)
      const newCourses = [...this.courses]
      newCourses.unshift({
        id: courseDoc.id,
        date: course.date
      })
      const studentStore = useStudentStore()
      await customPromise(Promise.all([setDoc(courseDoc, course), updateDoc(coursesNav, {
        courses: newCourses.map((course) => `${course.id},${course.date}`)
      }), ...course.studentIds.map((studentId) => studentStore.addCourse(studentId, courseDoc.id))]))
    },
    async deleteCourse(id: string) {
      const newCourses = [...this.courses]
      newCourses.splice(newCourses.findIndex((course) => course.id === id), 1)
      const studentStore = useStudentStore()
      await customPromise(Promise.all([deleteDoc(doc(coursesCollection, id)), updateDoc(coursesNav, {
        courses: newCourses.map((course) => `${course.id},${course.date}`)
      }), ...this.courseMap[id].studentIds.map((studentId) => studentStore.deleteCourse(studentId, id))]))
      delete this.courseMap[id]
    }
  },
})

const courseStore = useCourseStore()
const coursesCollection = collection(db, 'courses')
const coursesNav = doc(coursesCollection, 'nav')
onSnapshot(coursesNav, (newDoc) => {
  courseStore.courses = newDoc.data()!.courses.map((courseStr: string) => {
    const [id, date] = courseStr.split(',')
    return { id, date }
  })
})
await customPromise(getDoc(coursesNav))

export { useCourseStore }