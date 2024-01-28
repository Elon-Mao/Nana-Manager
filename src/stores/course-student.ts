import { elonStore } from './elonStore'

interface CourseStudentBrief {
  courseId: string
  studentId: string
}

export interface CourseStudent extends CourseStudentBrief {
  lastCompletionRate: string
  lastCorrectRate: string
  personalReview: string
}

export interface CourseStudentWithId extends CourseStudent {
  id: string
}

const useCourseStudentStore = elonStore<CourseStudentBrief, CourseStudent>('course-student',
  ['courseId', 'studentId'], ['lastCompletionRate', 'lastCorrectRate', 'personalReview'])

export { useCourseStudentStore }