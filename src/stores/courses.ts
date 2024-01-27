import { elonStore } from './elonStore'

export interface CourseBrief {
  date: string
  startTime: string
  endTime: string
  grade: number
}

export interface Course extends CourseBrief {
  summary: string
  remark: string
}

const useCourseStore = elonStore<CourseBrief, Course>('courses', ['date', 'startTime', 'endTime', 'grade'])

export { useCourseStore }