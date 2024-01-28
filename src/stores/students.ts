import { elonStore } from './elonStore'

interface ScoreRecord {
  date: Date
  title: string
  score: number
}

export interface StudentBrief {
  name: string
  grade: number
  sex: boolean
  school: string
  character: string
}

export interface Student extends StudentBrief {
  scoreRecords: ScoreRecord[]
}

export interface StudentWithId extends Student {
  id: string
}

const useStudentStore = elonStore<StudentBrief, Student>('students',
  ['name', 'grade', 'sex', 'school', 'character'], ['scoreRecords'])

export { useStudentStore }