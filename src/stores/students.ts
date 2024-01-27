import { elonStore } from './elonStore'

interface ScoreRecord {
  date: Date
  title: string
  score: number
}

export interface StudentBrief {
  name: string
  grade: number
}

export interface Student extends StudentBrief {
  courseIds: string[]
  scoreRecords: ScoreRecord[]
}

const useStudentStore = elonStore<StudentBrief, Student>('students', ['name', 'grade'])

export { useStudentStore }