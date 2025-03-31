<template>
  <!-- 营销活动管理页面主容器 -->
  <div class="marketing-container">
    <!-- 页面标题和新建按钮区域 -->
    <div class="header">
      <h2>营销活动</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新建活动
      </el-button>
    </div>

    <!-- 搜索筛选区域 -->
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

    <!-- 活动列表表格区域 -->
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

      <!-- 分页组件 -->
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

// 筛选表单数据
const filterForm = ref({
  name: '', // 活动名称搜索关键词
  status: '' // 活动状态筛选条件
})

// 表格数据相关
const loading = ref(false) // 加载状态
const marketingList = ref([ // 营销活动列表数据
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

// 原始数据备份，用于搜索筛选
const originalList = ref([...marketingList.value])

// 分页相关
const currentPage = ref(1) // 当前页码
const pageSize = ref(10) // 每页显示数量
const total = ref(100) // 总数据量

// 对话框相关
const dialogVisible = ref(false) // 对话框显示状态
const dialogType = ref('add') // 对话框类型：add-新建，edit-编辑，view-查看
const formRef = ref(null) // 表单引用
const form = ref({ // 表单数据
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

/**
 * 获取状态对应的标签类型
 * @param {string} status - 活动状态
 * @returns {string} 标签类型
 */
const getStatusType = (status) => {
  const types = {
    '未开始': 'info',
    '进行中': 'success',
    '已结束': 'danger'
  }
  return types[status] || 'info'
}

/**
 * 处理搜索操作
 * 根据活动名称和状态进行筛选
 */
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

// 监听筛选条件变化，自动触发搜索
watch(
  () => filterForm.value,
  () => {
    handleSearch()
  },
  { deep: true }
)

/**
 * 处理新建活动
 * 打开对话框并重置表单
 */
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

/**
 * 处理编辑活动
 * @param {Object} row - 活动数据
 */
const handleEdit = (row) => {
  dialogType.value = 'edit'
  form.value = {
    ...row,
    time: [row.startTime, row.endTime]
  }
  dialogVisible.value = true
}

/**
 * 处理查看活动详情
 * @param {Object} row - 活动数据
 */
const handleView = (row) => {
  dialogType.value = 'view'
  form.value = {
    ...row,
    time: [row.startTime, row.endTime]
  }
  dialogVisible.value = true
}

/**
 * 处理删除活动
 * @param {Object} row - 活动数据
 */
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

/**
 * 处理表单提交
 * 包含表单验证和提交逻辑
 */
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

/**
 * 处理每页显示数量变化
 * @param {number} val - 新的每页显示数量
 */
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  handleSearch()
}

/**
 * 处理页码变化
 * @param {number} val - 新的页码
 */
const handleCurrentChange = (val) => {
  currentPage.value = val
  handleSearch()
}

// 组件挂载时初始化数据
onMounted(() => {
  // TODO: 初始化数据
})
</script>

<style scoped>
/* 营销活动管理页面主容器样式 */
.marketing-container {
  padding: 20px;
}

/* 页面标题和新建按钮区域样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* 筛选卡片样式 */
.filter-card {
  margin-bottom: 20px;
}

/* 表格卡片样式 */
.table-card {
  margin-bottom: 20px;
}

/* 分页区域样式 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* Element Plus 对话框样式覆盖 */
:deep(.el-dialog) {
  display: flex;
  flex-direction: column;
  margin: 0 !important;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Element Plus 选择器样式覆盖 */
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