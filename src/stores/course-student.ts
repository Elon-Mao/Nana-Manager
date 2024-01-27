import { elonStore } from './elonStore'

interface CourseStudentBrief {
  courseId: string
  studentId: string
}

export interface CourseStudent extends CourseStudentBrief {
}

const useCourseStudentStore = elonStore<CourseStudentBrief, CourseStudent>('course-student', ['courseId', 'studentId'])

export { useCourseStudentStore }