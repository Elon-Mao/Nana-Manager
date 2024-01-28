import { elonStore } from './elonStore'

export interface CourseStudentBrief {
  courseId: string
  studentId: string
}

export interface CourseStudent extends CourseStudentBrief {
  lastCompletion: string
  lastCorrect: string
  personalReview: string
}

export interface CourseStudentWithId extends CourseStudent {
  id: string
}

const useCourseStudentStore = elonStore<CourseStudentBrief, CourseStudent>('course-student',
  ['courseId', 'studentId'], ['lastCompletion', 'lastCorrect', 'personalReview'])

export { useCourseStudentStore }