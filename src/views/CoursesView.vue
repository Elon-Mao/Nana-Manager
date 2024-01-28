<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore, type Course } from '@/stores/courses'
import { useStudentStore } from '@/stores/students'
import { useCourseStudentStore, type CourseStudent, type CourseStudentBrief } from '@/stores/course-student'
import { getFormatDate } from '@/common/dateTools'
import { addUnloadConfirm, removeUnloadConfirm } from '@/common/beforeunload'
import CourseSchedule from '@/components/CourseSchedule.vue'
import GradeSelect from '@/components/GradeSelect.vue'
import { ElMessage } from 'element-plus'
import type { CarouselInstance, FormInstance, FormRules } from 'element-plus'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const studentStore = useStudentStore()
const courseStudentStore = useCourseStudentStore()
const date = ref(getFormatDate(new Date()))
const carousel = ref<CarouselInstance>()
const courseForm = ref<FormInstance>()
const initCourse = {
  date: date.value,
  startTime: '',
  endTime: '',
  grade: 0,
  content: '',
  homework: '',
  studentIds: []
}
const editingCourse = ref<Course & {
  studentIds: string[]
}>({ ...initCourse })

type EditingStudent = Omit<CourseStudent, keyof CourseStudentBrief>
const editingStudents = ref<Record<string, EditingStudent>>({})
watch(() => editingCourse.value.studentIds, (newIds) => {
  const courseId = route.params.id as string
  newIds.forEach((studentId) => {
    if (editingStudents.value[studentId]) {
      return
    }
    const courseStudent = courseStudentStore.briefEntities.find((briefEntity) =>
      briefEntity.studentId === studentId && briefEntity.courseId === courseId)
    if (courseStudent) {
      courseStudentStore.getById(courseStudent.id, (entity) => {
        editingStudents.value[studentId] = {
          lastCompletion: entity.lastCompletion || '',
          lastCorrect: entity.lastCorrect || '',
          personalReview: entity.personalReview || ''
        }
      })
    } else {
      editingStudents.value[studentId] = {
        lastCompletion: '',
        lastCorrect: '',
        personalReview: ''
      }
    }
  })
}, { immediate: true })

const mondayDateList = computed(() => {
  const difDay = (new Date(date.value).getDay() + 6) % 7
  return [...Array(5).keys()].map((i) => {
    const dateItem = new Date(date.value)
    dateItem.setDate(dateItem.getDate() - difDay - (2 - i) * 7)
    return getFormatDate(dateItem)
  })
})

const getStudentIds = (courseId: string, newCourse: Course) => {
  return {
    studentIds: courseStudentStore.briefEntities.filter((courseStudent) => courseStudent.courseId === courseId)
      .map((courseStudent) => courseStudent.studentId),
    ...newCourse
  }
}
watch(
  () => route.params.id,
  async (newId) => {
    courseStore.getById(newId as string, (entity) => {
      mode.value = 'view'
      courseForm.value?.resetFields()
      editingCourse.value = getStudentIds(newId as string, entity)
      dialogVisible.value = true
    })
  }, { immediate: true }
)

onMounted(() => {
  watch(mondayDateList, () => {
    nextTick(() => {
      carousel.value!.setActiveItem(2)
    })
  }, { immediate: true })
})
const onChange = (index: number) => {
  if (index === 0) {
    return
  }
  date.value = mondayDateList.value[index]
}

const dialogVisible = ref(false)
const mode = ref('view')
const rules = reactive<FormRules<typeof editingCourse>>({
  date: [{ required: true, message: 'Please select date' }],
  startTime: [{ required: true, message: 'Please select start time' }],
  endTime: [{ required: true, message: 'Please select end time' }],
  grade: [{ required: true, message: 'Please select grade' }],
  studentIds: [{ required: true, message: 'Please select students' }]
})
const gradeStudents = computed(() => {
  return studentStore.briefEntities
    .filter((student) => editingCourse.value && student.grade === editingCourse.value.grade)
})

const addCourse = () => {
  addUnloadConfirm()
  mode.value = 'add'
  courseForm.value?.resetFields()
  editingCourse.value = { ...initCourse }
  dialogVisible.value = true
}
const editCourse = () => {
  addUnloadConfirm()
  mode.value = 'edit'
}

const saveCourse = async () => {
  await courseForm.value!.validate()
  let courseId = route.params.id as string
  const sameDateCourses = courseStore.briefEntities
    .filter((course) => course.date === editingCourse.value.date && course.id !== courseId)
  for (const course of sameDateCourses) {
    if (editingCourse.value.startTime < course.endTime && editingCourse.value.endTime > course.startTime) {
      ElMessage.error('Time conflict with other course')
      return
    }
  }
  if (mode.value === 'add') {
    courseId = await courseStore.addEntity(editingCourse.value)
  } else {
    await Promise.all([
      courseStore.setById(courseId, editingCourse.value),
      ...courseStudentStore.briefEntities.filter((courseStudent) => courseStudent.courseId === courseId)
        .map((courseStudent) => courseStudentStore.deleteById(courseStudent.id))
    ])
  }
  await Promise.all(editingCourse.value.studentIds
    .map((studentId) => courseStudentStore.addEntity({
      courseId, studentId,
      ...editingStudents.value[studentId]
    })))
  dialogVisible.value = false
  removeUnloadConfirm()
}
const cancelEdit = () => {
  dialogVisible.value = false
  removeUnloadConfirm()
}
const deleteCourse = async () => {
  const courseId = route.params.id as string
  await Promise.all([
    courseStore.deleteById(courseId),
    ...courseStudentStore.briefEntities.filter((courseStudent) => courseStudent.courseId === courseId)
      .map((courseStudent) => courseStudentStore.deleteById(courseStudent.id))
  ])
  dialogVisible.value = false
}
const onClose = () => {
  router.push('/courses/')
}
const BASE_URL = import.meta.env.BASE_URL
const copySummary = (studentId: string) => {
  const courseStudent = editingStudents.value[studentId]
  navigator.clipboard.writeText(`家长您好，给您反馈一下孩子1月26日英语上课情况
上节课作业反馈：
${courseStudent.lastCompletion}
作业完成情况和正确率反馈：
${courseStudent.lastCorrect}

📝课堂内容
${editingCourse.value.content}

课堂综评
${courseStudent.personalReview}

课后作业
${editingCourse.value.homework}`)
}
</script>

<template>
  <div class="container">
    <el-button type="primary" @click="addCourse">Add Course</el-button>
    <el-date-picker v-model="date" value-format="YYYY/MM/DD" :clearable="false" />
    <el-carousel ref="carousel" class="carousel" :interval="4000" type="card" height="500px" :loop="false" trigger="click"
      :autoplay="false" indicator-position="none" arrow="always" @change="onChange">
      <el-carousel-item v-for="(mondayDate, index) in mondayDateList" :key="mondayDate">
        <course-schedule :monday-date="mondayDate" :is-current="index === 2"></course-schedule>
      </el-carousel-item>
    </el-carousel>
  </div>
  <el-dialog v-model="dialogVisible" width="800" :close-on-click-modal="false" @close="onClose">
    <el-form ref="courseForm" :model="editingCourse" :disabled="mode === 'view'" status-icon :rules="rules"
      label-width="120px">
      <el-form-item label="Date" prop="date">
        <el-date-picker v-model="editingCourse.date" value-format="YYYY/MM/DD" placeholder="Pick a day" />
      </el-form-item>
      <div class="form-select">
        <el-form-item label="Start time" prop="startTime">
          <el-time-select v-model="editingCourse.startTime" :max-time="editingCourse.endTime" :clearable="false"
            start="08:00" step="00:30" end="21:30" />
        </el-form-item>
        <el-form-item label="Grade" prop="grade">
          <grade-select v-model="editingCourse.grade" @change="editingCourse.studentIds = []"></grade-select>
        </el-form-item>
      </div>
      <div class="form-select">
        <el-form-item label="End time" prop="endTime">
          <el-time-select v-model="editingCourse.endTime" :min-time="editingCourse.startTime" :clearable="false"
            start="08:00" step="00:30" end="21:30" />
        </el-form-item>
      </div>
      <el-form-item class="form-textarea" label="Content" prop="content">
        <el-input v-model="editingCourse.content" :rows="2" type="textarea" />
      </el-form-item>
      <el-form-item class="form-textarea" label="Homework" prop="homework">
        <el-input v-model="editingCourse.homework" :rows="2" type="textarea" />
      </el-form-item>
      <div class="form-select">
        <el-form-item label="Students" prop="studentIds">
          <el-select v-model="editingCourse.studentIds" multiple :clearable="true"
            no-data-text="No students in current grade" :multiple-limit="3">
            <el-option v-for="student in gradeStudents" :key="student.id" :label="student.name" :value="student.id" />
          </el-select>
        </el-form-item>
      </div>
      <template v-for="studentId in editingCourse.studentIds" :key="studentId">
        <el-form class="course-student">
          <el-link type="primary" :href="`${BASE_URL}/students/${studentId}`">{{
            studentStore.briefEntityMap[studentId].name }}</el-link>
          <el-button type="primary" @click="copySummary(studentId)">Copy Summary</el-button>
        </el-form>
        <template v-if="editingStudents[studentId]">
          <el-form-item class="form-textarea" label="Last Completion" prop="lastCompletion">
            <el-input v-model="editingStudents[studentId].lastCompletion" :rows="2" type="textarea" />
          </el-form-item>
          <el-form-item class="form-textarea" label="Last Correct" prop="lastCorrect">
            <el-input v-model="editingStudents[studentId].lastCorrect" :rows="2" type="textarea" />
          </el-form-item>
          <el-form-item class="form-textarea" label="Personal Review" prop="personalReview">
            <el-input v-model="editingStudents[studentId].personalReview" :rows="2" type="textarea" />
          </el-form-item>
        </template>
      </template>
    </el-form>
    <template #footer>
      <template v-if="mode === 'view'">
        <el-button type="primary" @click="editCourse">Edit</el-button>
        <el-popconfirm title="Are you sure to delete this?" @confirm="deleteCourse">
          <template #reference>
            <el-button type="danger">Delete</el-button>
          </template>
        </el-popconfirm>
      </template>
      <template v-else>
        <el-button type="primary" @click="saveCourse">Save</el-button>
        <el-button @click="cancelEdit">Cancel</el-button>
      </template>
    </template>
  </el-dialog>
</template>

<style scoped>
.container {
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 30px;
}

.container>button {
  position: absolute;
  left: calc(50% + 150px);
}

.carousel {
  margin-top: 30px;
  width: 100vw;
}

.form-select {
  display: flex;
  flex-wrap: wrap;
}

.form-select .el-select {
  width: 220px;
}

form a {
  margin-right: 10px;
}

.form-textarea {
  width: 680px;
}

.course-student {
  margin-bottom: 20px;
  display: flex;
}
</style>
