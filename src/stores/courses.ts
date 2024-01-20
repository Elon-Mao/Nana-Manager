import { defineStore } from 'pinia'
import { DocumentReference, collection, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import customPromise from '@/common/customPromise'
import { useStudentStore } from '@/stores/students'
import type { Unsubscribe } from 'firebase/auth'

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

const saveCourses = async (courses: CourseNav[], newCourse: Course) => {
  await customPromise(Promise.all([setDoc(courseDoc!, newCourse), updateDoc(coursesNav, {
    courses: courses.map((course) => `${course.id},${course.date}`)
  })]))
}
let courseDoc: DocumentReference | null = null
let courseSnapshot: Unsubscribe | null = null

const useCourseStore = defineStore('courses', {
  state: () => {
    return {
      courses: [] as CourseNav[],
      course: null as Course | null
    }
  },
  actions: {
    subscribe() {
      if (courseSnapshot) {
        courseSnapshot()
      }
      courseSnapshot = onSnapshot(courseDoc!, (newDoc) => {
        this.course = newDoc.data() as Course
      })
    },
    async getCourse(id: string) {
      if (!id) {
        if (courseSnapshot) {
          courseSnapshot()
        }
        this.course = null
        courseSnapshot = null
        return
      }
      courseDoc = doc(coursesCollection, id)
      this.subscribe()
      await customPromise(getDoc(courseDoc))
    },
    async setCourse(course: Course) {
      const id = courseDoc!.id
      const newCourses = [...this.courses]
      newCourses[newCourses.findIndex((courseItem) => courseItem.id === id)] = {
        id,
        date: course.date
      }
      await saveCourses(newCourses, course)
    },
    async addCourse(course: Course) {
      courseDoc = doc(coursesCollection)
      this.subscribe()
      const newCourses = [...this.courses]
      newCourses.unshift({
        id: courseDoc.id,
        date: course.date
      })
      await saveCourses(newCourses, course)
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