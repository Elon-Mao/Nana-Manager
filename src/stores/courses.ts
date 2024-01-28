import { elonStore } from './elonStore'

export interface CourseBrief {
  date: string
  startTime: string
  endTime: string
  grade: number
}

export interface Course extends CourseBrief {
  content: string
  homework: string
}

export interface CourseWithId extends Course {
  id: string
}

const useCourseStore = elonStore<CourseBrief, Course>('courses',
  ['date', 'startTime', 'endTime', 'grade'], ['content', 'homework'])

export { useCourseStore }