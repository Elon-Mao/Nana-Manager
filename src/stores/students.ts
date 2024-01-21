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
  name: string
  grade: number
  courseIds: string[]
  scoreRecords: ScoreRecord[]
}

export interface StudentNav {
  id: string
  name: string
  grade: number
}

const saveStudents = async (students: StudentNav[], newStudent: Student) => {
  await customPromise(Promise.all([setDoc(studentDoc!, newStudent), updateDoc(studentsNav, {
    students: students.map((student) => `${student.id},${student.name},${student.grade}`)
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
        grade: student.grade
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
        grade: student.grade
      })
      await saveStudents(newStudents, student)
    },
    async addCourse(studentId: string, courseId: string) {
      const studentDoc = doc(studentsCollection, studentId)
      const student = (await getDoc(studentDoc)).data() as Student
      if (student.courseIds.includes(courseId)) {
        return
      }
      student.courseIds.push(courseId)
      await updateDoc(doc(studentsCollection, studentId), {
        courseIds: student.courseIds
      })
    },
    async deleteCourse(studentId: string, courseId: string) {
      const studentDoc = doc(studentsCollection, studentId)
      const student = (await getDoc(studentDoc)).data() as Student
      student.courseIds.splice(student.courseIds.findIndex((id) => id === courseId), 1)
      await updateDoc(doc(studentsCollection, studentId), {
        courseIds: student.courseIds
      })
    }
  },
})

const studentStore = useStudentStore()
const studentsCollection = collection(db, 'students')
const studentsNav = doc(studentsCollection, 'nav')
onSnapshot(studentsNav, (newDoc) => {
  studentStore.students = newDoc.data()!.students.map((studentStr: string) => {
    const [id, name, grade] = studentStr.split(',')
    return {id, name, grade: Number(grade)}
  })
})
await customPromise(getDoc(studentsNav))

export { useStudentStore }