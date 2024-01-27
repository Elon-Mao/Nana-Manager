import { elonStore } from './elonStore'

export interface Course {
  date: string
  startTime: string
  endTime: string
  grade: number
  studentIds: string[]
  summary: string
  remark: string
}

interface CourseBrief {
  date: string
}

const useCourseStore = elonStore<CourseBrief, Course>('courses', ['date'])

export { useCourseStore }