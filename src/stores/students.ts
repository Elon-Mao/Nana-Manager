import { defineStore } from 'pinia'
import { DocumentReference, collection, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import customPromise from '@/common/customPromise'
import type { Unsubscribe } from 'firebase/auth'

interface ScoreRecord {
  date: Date
  title: string
  score: number
}

export interface Student {
  updateDate: Date
  name: string
  grade: number
  nextCourseTime: Date
  totalHours: number
  remainHours: number
  totalCourses: string[]
  remainCourses: string[]
  scoreRecords: ScoreRecord[]
}

export interface StudentNav {
  id: string
  name: string
  grade: number
  nextCourseTime: Date
}

const saveStudents = async (students: StudentNav[], newStudent: Student) => {
  await customPromise(Promise.all([setDoc(studentDoc!, newStudent), updateDoc(studentsNav, {
    students: students.map((student) => `${student.id},${student.name},${student.grade},${student.nextCourseTime}`)
  })]))
}
let studentDoc: DocumentReference | null = null
let studentSnapshot: Unsubscribe | null = null

const useStudentStore = defineStore('students', {
  state: () => {
    return {
      students: [] as StudentNav[],
      student: null as Student | null
    }
  },
  actions: {
    subscribe() {
      if (studentSnapshot) {
        studentSnapshot()
      }
      studentSnapshot = onSnapshot(studentDoc!, (newDoc) => {
        this.student = newDoc.data() as Student
      })
    },
    async getStudent(id: string) {
      if (!id) {
        if (studentSnapshot) {
          studentSnapshot()
        }
        this.student = null
        studentSnapshot = null
        return
      }
      studentDoc = doc(studentsCollection, id)
      this.subscribe()
      await customPromise(getDoc(studentDoc))
    },
    async setStudent(student: Student) {
      const id = studentDoc!.id
      const newStudents = [...this.students]
      newStudents[newStudents.findIndex((studentItem) => studentItem.id === id)] = {
        id,
        name: student.name,
        grade: student.grade,
        nextCourseTime: student.nextCourseTime
      }
      await saveStudents(newStudents, student)
    },
    async addStudent(student: Student) {
      studentDoc = doc(studentsCollection)
      this.subscribe()
      const newStudents = [...this.students]
      newStudents.unshift({
        id: studentDoc.id,
        name: student.name,
        grade: student.grade,
        nextCourseTime: student.nextCourseTime
      })
      await saveStudents(newStudents, student)
    }
  },
})

const studentStore = useStudentStore()
const studentsCollection = collection(db, 'students')
const studentsNav = doc(studentsCollection, 'nav')
onSnapshot(studentsNav, (newDoc) => {
  studentStore.students = newDoc.data()!.students.map((studentStr: string) => {
    const [id, name, grade, nextCourseTime] = studentStr.split(',')
    return {id, name, grade: Number(grade), nextCourseTime}
  })
})
await customPromise(getDoc(studentsNav))

export { useStudentStore }