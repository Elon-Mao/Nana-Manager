import { elonStore } from './elonStore'

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
  name: string
  grade: number
}

const useStudentStore = elonStore<StudentNav, Student>('students')

export { useStudentStore }