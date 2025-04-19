<template>
  <!-- 营销活动管理页面主容器 -->
  <div class="marketing-container">
    <!-- 页面标题和新建按钮区域 -->
    <div class="header">
      <h2>营销活动</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon class="el-icon-plus"></el-icon>新建活动
      </el-button>
    </div>

    <!-- 搜索筛选区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="活动名称">
          <el-input v-model="filterForm.name" placeholder="请输入活动名称" clearable />
        </el-form-item>
        <el-form-item label="活动类型">
          <el-select 
            v-model="filterForm.type" 
            placeholder="请选择活动类型" 
            clearable
            style="width: 180px"
          >
            <el-option label="折扣活动" value="discount" />
            <el-option label="优惠券" value="coupon" />
            <el-option label="限时抢购" value="flash_sale" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动状态">
          <el-select 
            v-model="filterForm.status" 
            placeholder="请选择状态" 
            clearable
            style="width: 180px"
          >
            <el-option label="未开始" value="pending" />
            <el-option label="进行中" value="active" />
            <el-option label="已结束" value="ended" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 活动列表表格区域 -->
    <el-card class="table-card">
      <el-table :data="marketingList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="活动ID" width="100" />
        <el-table-column prop="name" label="活动名称" min-width="200" />
        <el-table-column prop="type" label="活动类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeType(row.type)">{{ row.type === 'discount' ? '折扣活动' : row.type === 'coupon' ? '优惠券' : '限时抢购' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180" />
        <el-table-column prop="endTime" label="结束时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status === 'pending' ? '未开始' : row.status === 'active' ? '进行中' : '已结束' }}
            </el-tag>
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
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 活动表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="50%"
    >
      <el-form
        v-if="currentActivity"
        ref="formRef"
        :model="currentActivity"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="currentActivity.name" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动类型" prop="type">
          <el-select v-model="currentActivity.type" placeholder="请选择活动类型">
            <el-option label="折扣活动" value="discount" />
            <el-option label="优惠券" value="coupon" />
            <el-option label="限时抢购" value="flash_sale" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动时间" required>
          <el-col :span="11">
            <el-form-item prop="startTime">
              <el-date-picker
                v-model="currentActivity.startTime"
                type="datetime"
                placeholder="开始时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="2" class="text-center">
            <span class="text-gray-500">-</span>
          </el-col>
          <el-col :span="11">
            <el-form-item prop="endTime">
              <el-date-picker
                v-model="currentActivity.endTime"
                type="datetime"
                placeholder="结束时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="活动描述" prop="description">
          <el-input
            v-model="currentActivity.description"
            type="textarea"
            :rows="3"
            placeholder="请输入活动描述"
          />
        </el-form-item>
        <el-form-item label="活动规则" prop="rules">
          <el-input
            v-model="currentActivity.rules"
            type="textarea"
            :rows="3"
            placeholder="请输入活动规则"
          />
        </el-form-item>
        <el-form-item label="目标人群" prop="target">
          <el-input
            v-model="currentActivity.target"
            type="textarea"
            :rows="2"
            placeholder="请输入目标人群"
          />
        </el-form-item>
        <el-form-item label="活动预算" prop="budget">
          <el-input-number
            v-model="currentActivity.budget"
            :min="0"
            :precision="2"
            :step="100"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

interface MarketingActivity {
  id: string
  name: string
  type: 'discount' | 'coupon' | 'flash_sale'
  status: 'pending' | 'active' | 'ended'
  startTime: string
  endTime: string
  description: string
  rules: string
  target: string
  budget: number
  actualCost: number
  createTime: string
  updateTime: string
  participants?: number
}

interface FilterForm {
  name: string
  type: string
  status: string
}

const loading = ref(false)
const marketingList = ref<MarketingActivity[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const dialogType = ref('add')
const currentActivity = ref<MarketingActivity | null>(null)

// 搜索表单
const filterForm = ref<FilterForm>({
  name: '',
  type: '',
  status: ''
})

// 表单引用
const formRef = ref<FormInstance>()

// 表单验证规则
const rules = ref<FormRules>({
  name: [
    { required: true, message: '请输入活动名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择活动类型', trigger: 'change' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' },
    {
      validator: (_: unknown, value: string, callback: (error?: Error) => void) => {
        if (value && currentActivity.value?.startTime && new Date(value) <= new Date(currentActivity.value.startTime)) {
          callback(new Error('结束时间必须晚于开始时间'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  description: [
    { required: true, message: '请输入活动描述', trigger: 'blur' }
  ],
  budget: [
    { required: true, message: '请输入活动预算', trigger: 'blur' },
    { type: 'number', min: 0, message: '预算必须大于0', trigger: 'blur' }
  ]
})

// 获取本地存储的活动数据
const getLocalActivitiesData = (): MarketingActivity[] => {
  const data = localStorage.getItem('marketingActivities')
  if (data) {
    return JSON.parse(data)
  }
  
  // 默认数据
  const defaultActivities: MarketingActivity[] = [
    {
      id: '1',
      name: '618大促',
      type: 'discount',
      status: 'pending',
      startTime: '2025-06-01 00:00:00',
      endTime: '2025-06-18 23:59:59',
      description: '618购物节全场商品低至5折',
      rules: '1. 全场商品5折起\n2. 部分商品限时特价\n3. 满300减50',
      target: '所有用户',
      budget: 100000,
      actualCost: 0,
      createTime: '2024-05-01 10:00:00',
      updateTime: '2024-05-01 10:00:00',
      participants: 0
    },
    {
      id: '2',
      name: '新人专享券',
      type: 'coupon',
      status: 'active',
      startTime: '2024-05-01 00:00:00',
      endTime: '2099-12-31 23:59:59',
      description: '新用户注册即送100元优惠券',
      rules: '1. 新用户注册即可领取\n2. 满200可用\n3. 有效期30天',
      target: '新注册用户',
      budget: 50000,
      actualCost: 20000,
      createTime: '2024-04-15 14:30:00',
      updateTime: '2024-04-15 14:30:00',
      participants: 800
    },
    {
      id: '3',
      name: '限时秒杀',
      type: 'flash_sale',
      status: 'pending',
      startTime: '2025-05-20 20:00:00',
      endTime: '2025-05-20 22:00:00',
      description: '精选商品限时秒杀，低至1折',
      rules: '1. 每人限购1件\n2. 秒杀商品不支持退换\n3. 库存有限，先到先得',
      target: '所有用户',
      budget: 30000,
      actualCost: 0,
      createTime: '2024-05-10 09:00:00',
      updateTime: '2024-05-10 09:00:00',
      participants: 0
    },
    {
      id: '4',
      name: '会员日特惠',
      type: 'discount',
      status: 'ended',
      startTime: '2024-04-15 00:00:00',
      endTime: '2024-04-15 23:59:59',
      description: '会员专享折扣，额外95折',
      rules: '1. 仅限会员参与\n2. 可与优惠券叠加使用\n3. 部分商品除外',
      target: '会员用户',
      budget: 20000,
      actualCost: 15000,
      createTime: '2024-04-01 11:00:00',
      updateTime: '2024-04-16 00:00:00',
      participants: 500
    }
  ]
  
  // 保存默认数据到本地存储
  localStorage.setItem('marketingActivities', JSON.stringify(defaultActivities))
  return defaultActivities
}

// 保存活动数据到本地存储
const saveActivitiesData = (data: MarketingActivity[]) => {
  localStorage.setItem('marketingActivities', JSON.stringify(data))
}

// 获取活动列表
const fetchActivitiesList = async () => {
  loading.value = true
  try {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const localData = getLocalActivitiesData()
    const filteredData = localData.filter(activity => {
      const matchName = !filterForm.value.name || 
        activity.name.includes(filterForm.value.name)
      const matchType = !filterForm.value.type || 
        activity.type === filterForm.value.type
      const matchStatus = !filterForm.value.status || 
        activity.status === filterForm.value.status
      return matchName && matchType && matchStatus
    })
    
    total.value = filteredData.length
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    marketingList.value = filteredData.slice(start, end)
  } catch (error) {
    console.error('获取活动列表失败:', error)
    ElMessage.error('获取活动列表失败')
  } finally {
    loading.value = false
  }
}

// 处理每页显示数量变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchActivitiesList()
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchActivitiesList()
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchActivitiesList()
}

// 重置搜索
const resetSearch = () => {
  filterForm.value = {
    name: '',
    type: '',
    status: ''
  }
  currentPage.value = 1
  fetchActivitiesList()
}

// 新增活动
const handleAdd = () => {
  dialogType.value = 'add'
  currentActivity.value = {
    id: Date.now().toString(),
    name: '',
    type: 'discount',
    status: 'pending',
    startTime: '',
    endTime: '',
    description: '',
    rules: '',
    target: '',
    budget: 0,
    actualCost: 0,
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
    participants: 0
  }
  dialogVisible.value = true
}

// 编辑活动
const handleEdit = (activity: MarketingActivity) => {
  dialogType.value = 'edit'
  currentActivity.value = { ...activity }
  dialogVisible.value = true
}

// 查看活动详情
const handleView = (row: MarketingActivity) => {
  dialogType.value = 'view'
  currentActivity.value = { ...row }
  dialogVisible.value = true
}

// 删除活动
const handleDelete = async (activity: MarketingActivity) => {
  try {
    await ElMessageBox.confirm('确认删除该活动？', '提示', {
      type: 'warning'
    })
    
    const localData = getLocalActivitiesData()
    const newData = localData.filter(item => item.id !== activity.id)
    saveActivitiesData(newData)
    await fetchActivitiesList()
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 保存活动
const handleSave = async () => {
  if (!formRef.value || !currentActivity.value) return
  
  try {
    await formRef.value.validate()
    
    const localData = getLocalActivitiesData()
    if (dialogType.value === 'add') {
      // 设置创建时间和更新时间
      currentActivity.value.createTime = new Date().toISOString()
      currentActivity.value.updateTime = new Date().toISOString()
      currentActivity.value.participants = 0
      localData.push(currentActivity.value)
    } else {
      const index = localData.findIndex(item => item.id === currentActivity.value?.id)
      if (index !== -1) {
        // 更新修改时间
        currentActivity.value.updateTime = new Date().toISOString()
        localData[index] = currentActivity.value
      }
    }
    
    saveActivitiesData(localData)
    dialogVisible.value = false
    await fetchActivitiesList()
    ElMessage.success(dialogType.value === 'add' ? '创建成功' : '更新成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

// 获取状态对应的标签类型
const getStatusType = (status: MarketingActivity['status']): 'info' | 'success' | 'danger' => {
  switch (status) {
    case 'pending':
      return 'info'
    case 'active':
      return 'success'
    case 'ended':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取类型对应的标签类型
const getTypeType = (type: MarketingActivity['type']): 'primary' | 'warning' | 'success' => {
  switch (type) {
    case 'discount':
      return 'primary'
    case 'coupon':
      return 'warning'
    case 'flash_sale':
      return 'success'
    default:
      return 'primary'
  }
}

// 对话框标题
const dialogTitle = computed(() => {
  if (!currentActivity.value) return ''
  return currentActivity.value.id ? '编辑活动' : '新建活动'
})

// 组件挂载时初始化数据
onMounted(() => {
  fetchActivitiesList()
})

// 监听筛选条件变化
watch([() => filterForm.value.name, () => filterForm.value.type, () => filterForm.value.status], () => {
  // 当筛选条件变化时，自动执行搜索
  handleSearch()
}, { deep: true })
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

/* 按钮间距 */
.el-button + .el-button {
  margin-left: 10px;
}
</style> 