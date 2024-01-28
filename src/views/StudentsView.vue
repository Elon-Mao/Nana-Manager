<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudentStore, type StudentBrief, type Student } from '@/stores/students'
import { addUnloadConfirm, removeUnloadConfirm } from '@/common/beforeunload'
import GradeSelect from '@/components/GradeSelect.vue'
import { grades } from '@/common/grades'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useCourseStudentStore } from '@/stores/course-student'

type StudentBriefWithId = StudentBrief & {
  id: string
}

const initStudent = {
  name: '',
  grade: 0,
  sex: true,
  school: '',
  character: '',
  scoreRecords: []
}
const route = useRoute()
const router = useRouter()
const studentStore = useStudentStore()
const courseStudentStore = useCourseStudentStore()
const editingStudent = ref<Student>({ ...initStudent })
const mode = ref('view')

watch(
  () => route.params.id,
  async (newId) => {
    studentStore.getById(newId as string)
  }, { immediate: true }
)
watch(
  () => studentStore.entityMap[route.params.id as string], (newStudent) => {
    if (newStudent) {
      mode.value = 'view'
      studentForm.value?.resetFields()
      editingStudent.value = { ...newStudent }
      dialogVisible.value = true
    }
  }, { immediate: true }
)

const studentForm = ref<FormInstance>()
const rules = reactive<FormRules<typeof editingStudent>>({
  name: [
    { required: true, message: 'Please input name', trigger: 'blur' },
    { min: 2, max: 16, message: 'Length should be 2 to 16', trigger: 'blur' },
  ],
  grade: [{ required: true, message: 'Please select grade' }],
  sex: [{ required: true, message: 'Please select sex' }],
  school: [{ max: 16, message: 'Length should be 0 to 16', trigger: 'blur' }],
  character: [{ max: 16, message: 'Length should be 0 to 16', trigger: 'blur' }]
})

const addStudent = () => {
  addUnloadConfirm()
  mode.value = 'add'
  studentForm.value?.resetFields()
  editingStudent.value = {...initStudent}
  dialogVisible.value = true
}
const editStudent = () => {
  addUnloadConfirm()
  mode.value = 'edit'
}
const saveStudent = async () => {
  await studentForm.value?.validate()
  if (mode.value === 'add') {
    await studentStore.addEntity(editingStudent.value)
    router.push(`/students/${studentStore.briefEntities[0].id}`)
  } else {
    await studentStore.setById(route.params.id as string, editingStudent.value)
  }
  dialogVisible.value = false
  removeUnloadConfirm()
}
const cancelEdit = () => {
  dialogVisible.value = false
  removeUnloadConfirm()
}
const dialogVisible = ref(false)
const studentDetails = (student: StudentBriefWithId) => {
  router.push(`/students/${student.id}`)
}
const deleteStudent = async () => {
  const studentId = route.params.id as string
  if (courseStudentStore.briefEntities.find((courseStudent) => courseStudent.studentId === studentId)) {
    ElMessage.error('Please delete related courses first.')
    return
  }
  await studentStore.deleteById(studentId)
  dialogVisible.value = false
}
const onClose = () => {
  router.push('/students/')
}
</script>

<template>
  <div class="container">
    <el-button type="primary" @click="addStudent">Add Student</el-button>
    <el-table :data="studentStore.briefEntities" class="students-table"
      :default-sort="{ prop: 'grade', order: 'descending' }">
      <el-table-column prop="grade" label="Grade" sortable :filters="grades.map((grade, index) => {
        return {
          text: grade,
          value: index
        }
      })" :filter-method="(value: number, student: StudentBriefWithId) => student.grade === value">
        <template #default="scope">
          <span>{{ grades[scope.row.grade] }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="Name" />
      <el-table-column prop="sex" label="Sex" :filter-multiple="false" :filters="[
        { text: 'male', value: true },
        { text: 'female', value: false },
      ]" :filter-method="(value: boolean, student: StudentBriefWithId) => student.sex === value">
        <template #default="scope">
          <span>{{ scope.row.sex ? 'male' : 'female' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="school" label="School" />
      <el-table-column prop="character" label="Character" />
      <el-table-column label="Operations">
        <template #default="scope">
          <el-button size="small" type="primary" @click="studentDetails(scope.row)">Details</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <el-dialog v-model="dialogVisible" width="800" :close-on-click-modal="false" @close="onClose">
    <el-form ref="studentForm" :model="editingStudent" :disabled="mode === 'view'" status-icon :rules="rules"
      label-width="120px">
      <el-form-item label="Grade" prop="grade">
        <grade-select v-model="editingStudent.grade"></grade-select>
      </el-form-item>
      <el-form-item label="Name" prop="name">
        <el-input v-model="editingStudent.name" />
      </el-form-item>
      <el-form-item label="Sex" prop="sex">
        <el-select v-model="editingStudent.sex">
          <el-option label="male" :value="true" />
          <el-option label="female" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item label="School" prop="school">
        <el-input v-model="editingStudent.school" />
      </el-form-item>
      <el-form-item label="Character" prop="character">
        <el-input v-model="editingStudent.character" />
      </el-form-item>
    </el-form>
    <template #footer>
      <template v-if="mode === 'view'">
        <el-button type="primary" @click="editStudent">Edit</el-button>
        <el-popconfirm title="Are you sure to delete this?" @confirm="deleteStudent">
          <template #reference>
            <el-button type="danger">Delete</el-button>
          </template>
        </el-popconfirm>
      </template>
      <template v-else>
        <el-button type="primary" @click="saveStudent">Save</el-button>
        <el-button @click="cancelEdit">Cancel</el-button>
      </template>
    </template>
  </el-dialog>
</template>

<style scoped>
.container {
  padding: 50px 5vw;
}

.students-table {
  margin-top: 20px;
}

form {
  display: flex;
  flex-wrap: wrap;
}

form>div {
  width: 300px;
}
</style>
