<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudentStore } from '@/stores/students'
import type { FormInstance, FormRules } from 'element-plus'
import { addUnloadConfirm, removeUnloadConfirm } from '@/common/beforeunload'

const route = useRoute()
const router = useRouter()
const studentStore = useStudentStore()
const grades = ['G3', 'G2', 'G1', 'C3', 'C2', 'C1', 'X6', 'X5', 'X4', 'X3', 'X2', 'X1']

watch(
  () => route.params.id,
  async (newId) => {
    await studentStore.getStudent(newId as string)
    editingStudent.value = studentStore.student
  },
  { immediate: true }
)
watch(
  () => studentStore.students,
  () => {
    if (!route.params.id && studentStore.students.length > 0) {
      router.push(`/students/${studentStore.students[0].id}`)
    }
  },
  { immediate: true }
)
const editingStudent = ref()
const studentForm = ref<FormInstance>()
const rules = reactive<FormRules<typeof editingStudent>>({
  name: [
    { required: true, message: 'Please input name', trigger: 'blur' },
    { min: 2, max: 16, message: 'Length should be 2 to 16', trigger: 'blur' },
  ],
  grade: [{ required: true, message: 'Please select grade' }],
})

const mode = ref('view')
const addStudent = () => {
  addUnloadConfirm()
  mode.value = 'add'
  editingStudent.value = {
    name: '',
    nextCourseTime: '',
    totalHours: 0,
    remainHours: 0,
    totalCourses: [],
    remainCourses: [],
    scoreRecords: []
  }
}

const editStudent = () => {
  mode.value = 'edit'
}
const saveStudent = async () => {
  if (mode.value === 'add') {
    await studentStore.addStudent(editingStudent.value)
    router.push(`/students/${studentStore.students[0].id}`)
  } else {
    await studentStore.setStudent(editingStudent.value)
  }
  mode.value = 'view'
  removeUnloadConfirm()
}
const cancelEdit = () => {
  addUnloadConfirm()
  mode.value = 'view'
}
</script>

<template>
  <div class="container">
    <div class="left">
      <el-button type="primary" @click="addStudent">Add Student</el-button>
      <el-menu :default-active="route.path" router>
        <el-menu-item v-for="student in studentStore.students" :key="student.id" :index="`/students/${student.id}`">
          {{ student.name }}
        </el-menu-item>
      </el-menu>
    </div>
    <div class="main">
      <div v-if="editingStudent" class="student-info">
        <div class="button-group">
          <el-button v-if="mode === 'view'" type="primary" @click="editStudent">Edit</el-button>
          <template v-else>
            <el-button type="primary" @click="saveStudent">Save</el-button>
            <el-button @click="cancelEdit">Cancel</el-button>
          </template>
        </div>
        <el-form ref="studentForm" :model="editingStudent" :disabled="mode === 'view'" status-icon :rules="rules"
          label-width="120px">
          <el-form-item label="Name" prop="name">
            <el-input v-model="editingStudent.name" />
          </el-form-item>
          <el-form-item label="Grade" prop="grade">
            <el-select v-model="editingStudent.grade">
              <el-option v-for="(grade, index) in grades" :key="grade" :label="grade" :value="12 - index" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <el-empty v-else />
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  padding: 50px 5vw;
}

.left {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.left ul {
  margin-top: 20px;
}

.main {
  flex-grow: 1;
}

.student-info {
  display: flex;
  flex-direction: column;
  position: relative;
}

.button-group {
  position: absolute;
  left: 650px;
}

form {
  display: flex;
}

form>div {
  width: 300px;
}
</style>
