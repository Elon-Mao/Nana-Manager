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

interface CourseNav {
  date: string
}

const useCourseStore = elonStore<CourseNav, Course>('courses')

export { useCourseStore }