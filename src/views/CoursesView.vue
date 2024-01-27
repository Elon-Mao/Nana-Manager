<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore, type Course } from '@/stores/courses'
import { useStudentStore } from '@/stores/students'
import { useCourseStudentStore } from '@/stores/course-student'
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
  studentIds: [],
  summary: '',
  remark: '',
}
const editingCourse = ref<Course & {
  studentIds: string[]
}>(initCourse)
const mondayDateList = computed(() => {
  const difDay = new Date(date.value).getDay() - 1
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
    courseStore.getById(newId as string)
  }, { immediate: true }
)
watch(
  () => courseStore.entityMap[route.params.id as string], (newCourse) => {
    if (newCourse) {
      editingCourse.value = getStudentIds(route.params.id as string, newCourse)
      dialogVisible.value = true
    }
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
  editingCourse.value = initCourse
  dialogVisible.value = true
}
const editCourse = () => {
  addUnloadConfirm()
  mode.value = 'edit'
}

const saveCourse = async () => {
  await courseForm.value!.validate()
  const courseId = route.params.id as string
  const sameDateCourses = courseStore.briefEntities
    .filter((course) => course.date === editingCourse.value.date && course.id !== courseId)
    .map((course) => courseStore.entityMap[course.id])
  for (const course of sameDateCourses) {
    if (editingCourse.value.startTime < course.endTime && editingCourse.value.endTime > course.startTime) {
      ElMessage.error('Time conflict with other course')
      return
    }
  }
  if (mode.value === 'add') {
    await courseStore.addEntity(editingCourse.value)
    router.push(`/courses/${courseStore.briefEntities[0].id}`)
  } else {
    await Promise.all([
      courseStore.setById(courseId, editingCourse.value),
      ...courseStudentStore.briefEntities.filter((courseStudent) => courseStudent.courseId === courseId)
        .map((courseStudent) => courseStudentStore.deleteById(courseStudent.id))
    ])
  }
  editingCourse.value.studentIds.map((studentId) => {
    courseStudentStore.addEntity({
      courseId, studentId
    })
  })
  mode.value = 'view'
  removeUnloadConfirm()
}
const cancelEdit = () => {
  courseForm.value!.resetFields()
  if (mode.value === 'add') {
    dialogVisible.value = false
  } else {
    const courseId = route.params.id as string
    editingCourse.value = getStudentIds(courseId, courseStore.entityMap[courseId])
  }
  mode.value = 'view'
  removeUnloadConfirm()
}
const deleteCourse = async () => {
  await courseStore.deleteById(route.params.id as string)
  dialogVisible.value = false
}
const onClose = () => {
  router.push('/courses/')
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
        <el-form-item label="Students" prop="studentIds">
          <template v-if="mode === 'view'">
            <el-link v-for="studentId in editingCourse.studentIds" :key="studentId" type="primary"
              :href="`/students/${studentId}`">{{ studentStore.briefEntityMap[studentId].name }}</el-link>
          </template>
          <el-select v-else v-model="editingCourse.studentIds" multiple :clearable="true"
            no-data-text="No students in current grade" :multiple-limit="3">
            <el-option v-for="student in gradeStudents" :key="student.id" :label="student.name" :value="student.id" />
          </el-select>
        </el-form-item>
      </div>
      <el-form-item class="form-textarea" label="Summary" prop="summary">
        <el-input v-model="editingCourse.summary" :rows="2" type="textarea" />
      </el-form-item>
      <el-form-item class="form-textarea" label="Remark" prop="remark">
        <el-input v-model="editingCourse.remark" :rows="2" type="textarea" />
      </el-form-item>
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
</style>
