<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '@/stores/courses'
import { getFormatDate } from '@/common/dateTools'
import { addUnloadConfirm, removeUnloadConfirm } from '@/common/beforeunload'
import CourseSchedule from '@/components/CourseSchedule.vue'
import type { CarouselInstance, FormRules } from 'element-plus'

const route = useRoute()
const courseStore = useCourseStore()
const date = ref(getFormatDate(new Date()))
const carousel = ref<CarouselInstance>()
const editingCourse = ref()
const mondayDateList = computed(() => {
  const difDay = new Date(date.value).getDay() - 1
  return [...Array(5).keys()].map((i) => {
    const dateItem = new Date(date.value)
    dateItem.setDate(dateItem.getDate() - difDay - (2 - i) * 7)
    return getFormatDate(dateItem)
  })
})

watch(
  () => route.params.id,
  async (newId) => {
    await courseStore.getCourse(newId as string)
    if (!courseStore.course) {
      return
    }
    editingCourse.value = { ...courseStore.course }
    dialogVisible.value = true
  },
  { immediate: true }
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
  name: [
    { required: true, message: 'Please input name', trigger: 'blur' },
    { min: 2, max: 16, message: 'Length should be 2 to 16', trigger: 'blur' },
  ],
  grade: [{ required: true, message: 'Please select grade' }],
})
const onOpen = () => {
  addUnloadConfirm()
}
const onClose = () => {
  removeUnloadConfirm()
}
const addCourse = () => {
  editingCourse.value = {
    date: date.value,
    startTime: '',
    endTime: '',
    grade: 0,
    studentIds: [],
    summary: '',
    remark: '',
  }
  mode.value = 'add'
  dialogVisible.value = true
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
  <el-dialog v-model="dialogVisible" title="Tips" width="80%" @open="onOpen" @close="onClose">
    <el-form ref="courseForm" :model="editingCourse" :disabled="mode === 'view'" status-icon :rules="rules"
      label-width="120px">
      <el-form-item label="Date" prop="date">
        <el-date-picker v-model="editingCourse.date" placeholder="Pick a day" />
      </el-form-item>
      <el-form-item label="Time" prop="grade" class="time-select">
        <el-time-select v-model="editingCourse.startTime" :max-time="editingCourse.endTime" placeholder="Start time"
          start="08:00" step="00:30" end="21:30" />
        <el-time-select v-model="editingCourse.endTime" :min-time="editingCourse.startTime" placeholder="End time"
          start="08:00" step="00:30" end="21:30" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogVisible = false">
          Confirm
        </el-button>
      </span>
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

.time-select .el-select {
  width: 40%;
  margin-right: 10px;
}
</style>
