<template>
  <div class="marketing-container">
    <div class="header">
      <h2>营销活动</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新建活动
      </el-button>
    </div>

    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="活动名称">
          <el-input v-model="filterForm.name" placeholder="请输入活动名称" clearable />
        </el-form-item>
        <el-form-item label="活动状态">
          <el-select 
            v-model="filterForm.status" 
            placeholder="请选择状态" 
            clearable
            style="width: 180px"
          >
            <el-option label="已结束" value="已结束" />
            <el-option label="进行中" value="进行中" />
            <el-option label="未开始" value="未开始" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="marketingList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="活动ID" width="100" />
        <el-table-column prop="name" label="活动名称" min-width="200" />
        <el-table-column prop="type" label="活动类型" width="120" />
        <el-table-column prop="startTime" label="开始时间" width="180" />
        <el-table-column prop="endTime" label="结束时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="participants" label="参与人数" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="success" size="small" @click="handleView(row)">查看</el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 活动表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新建活动' : dialogType === 'edit' ? '编辑活动' : '活动详情'"
      width="600px"
      :close-on-click-modal="false"
      center
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        :disabled="dialogType === 'view'"
      >
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择活动类型">
            <el-option label="满减优惠" value="满减优惠" />
            <el-option label="折扣活动" value="折扣活动" />
            <el-option label="限时特价" value="限时特价" />
            <el-option label="积分活动" value="积分活动" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动时间" prop="time">
          <el-date-picker
            v-model="form.time"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item label="活动规则" prop="rules">
          <el-input
            v-model="form.rules"
            type="textarea"
            :rows="3"
            placeholder="请输入活动规则"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button v-if="dialogType !== 'view'" type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 筛选表单
const filterForm = ref({
  name: '',
  status: ''
})

// 表格数据
const loading = ref(false)
const marketingList = ref([
  {
    id: 1,
    name: '618大促',
    type: '满减优惠',
    startTime: '2024-06-18 00:00:00',
    endTime: '2024-06-20 23:59:59',
    status: '已结束',
    participants: 0,
    rules: '满300减50，满500减100'
  },
  {
    id: 2,
    name: '双11购物节',
    type: '折扣活动',
    startTime: '2024-11-11 00:00:00',
    endTime: '2024-11-11 23:59:59',
    status: '已结束',
    participants: 0,
    rules: '全场商品8折，部分商品5折'
  }
])

// 原始数据
const originalList = ref([...marketingList.value])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const form = ref({
  name: '',
  type: '',
  time: [],
  rules: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入活动名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择活动类型', trigger: 'change' }
  ],
  time: [
    { required: true, message: '请选择活动时间', trigger: 'change' }
  ],
  rules: [
    { required: true, message: '请输入活动规则', trigger: 'blur' }
  ]
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    '未开始': 'info',
    '进行中': 'success',
    '已结束': 'danger'
  }
  return types[status] || 'info'
}

// 搜索
const handleSearch = () => {
  loading.value = true
  try {
    let filteredData = [...originalList.value]
    
    // 按活动名称筛选
    if (filterForm.value.name) {
      filteredData = filteredData.filter(item => 
        item.name.toLowerCase().includes(filterForm.value.name.toLowerCase())
      )
    }
    
    // 按状态筛选
    if (filterForm.value.status) {
      filteredData = filteredData.filter(item => 
        item.status === filterForm.value.status
      )
    }
    
    // 更新总数
    total.value = filteredData.length
    
    // 分页处理
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    marketingList.value = filteredData.slice(start, end)
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败')
  } finally {
    loading.value = false
  }
}

// 监听筛选条件变化
watch(
  () => filterForm.value,
  () => {
    handleSearch()
  },
  { deep: true }
)

// 新建活动
const handleAdd = () => {
  dialogType.value = 'add'
  form.value = {
    name: '',
    type: '',
    time: [],
    rules: ''
  }
  dialogVisible.value = true
}

// 编辑活动
const handleEdit = (row) => {
  dialogType.value = 'edit'
  form.value = {
    ...row,
    time: [row.startTime, row.endTime]
  }
  dialogVisible.value = true
}

// 查看活动
const handleView = (row) => {
  dialogType.value = 'view'
  form.value = {
    ...row,
    time: [row.startTime, row.endTime]
  }
  dialogVisible.value = true
}

// 删除活动
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除该活动吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // TODO: 实现删除逻辑
    ElMessage.success('删除成功')
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      // TODO: 实现提交逻辑
      dialogVisible.value = false
      ElMessage.success(dialogType.value === 'add' ? '创建成功' : '更新成功')
    }
  })
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  handleSearch()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  handleSearch()
}

onMounted(() => {
  // TODO: 初始化数据
})
</script>

<style scoped>
.marketing-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-dialog) {
  display: flex;
  flex-direction: column;
  margin: 0 !important;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

:deep(.el-select) {
  width: 180px;
}

:deep(.el-select .el-input__wrapper) {
  width: 180px;
}

:deep(.el-select .el-input__inner) {
  width: 180px;
}
</style> 