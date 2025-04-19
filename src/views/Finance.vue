<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as formatUtils from '@/utils/format'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 定义类型
interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  items: OrderItem[]
  total: number
  status: string
  createdAt: string
}

interface FinanceMetrics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  pendingRevenue: number
  shippedRevenue: number
  pickingRevenue: number
  profit: number
  profitMargin: number
  monthlyRevenue: number[]
  monthlyOrders: number[]
  monthlyProfit: number[]
}

/**
 * 财务数据状态管理
 * 包含总收入、订单数、平均订单金额等核心指标
 */
const financeData = ref<FinanceMetrics>({
  totalRevenue: 0,
  totalOrders: 5399,
  averageOrderValue: 0,
  pendingRevenue: 0,
  shippedRevenue: 0,
  pickingRevenue: 0,
  profit: 0,
  profitMargin: 0,
  monthlyRevenue: Array(6).fill(0),
  monthlyOrders: Array(6).fill(0),
  monthlyProfit: Array(6).fill(0)
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 图表相关
const chartType = ref('revenue') // 'revenue', 'orders', 'profit'
const chartLoading = ref(false)

// 月份标签
const monthLabels = ['1月', '2月', '3月', '4月', '5月', '6月']

/**
 * 获取财务列表数据
 */
const fetchFinanceList = async () => {
  try {
    // 从本地存储获取订单数据
    const ordersData = localStorage.getItem('ordersList')
    let orders: Order[] = []
    
    if (ordersData) {
      try {
        orders = JSON.parse(ordersData)
      } catch (parseError) {
        console.error('解析订单数据失败:', parseError)
        orders = [] // 如果解析失败，使用空数组
      }
    }
    
    // 如果没有订单数据，使用默认数据
    if (orders.length === 0) {
      orders = [
        {
          id: '1',
          items: [
            { id: '1', name: '高端笔记本电脑', price: 8999, quantity: 2 },
            { id: '2', name: '无线鼠标', price: 299, quantity: 3 }
          ],
          total: 18495,
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          items: [
            { id: '3', name: '4K显示器', price: 3999, quantity: 2 },
            { id: '4', name: '机械键盘', price: 899, quantity: 1 }
          ],
          total: 8897,
          status: 'shipped',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]
      // 保存默认数据到 localStorage
      localStorage.setItem('ordersList', JSON.stringify(orders))
    }
    
    // 更新总数
    total.value = orders.length
    
    // 计算财务指标
    calculateFinanceMetrics(orders)
    
    // 如果没有订单数据，设置总订单数为5399
    if (orders.length === 0) {
      financeData.value.totalOrders = 5399
    }
  } catch (error) {
    console.error('获取财务列表失败:', error)
    ElMessage.error('获取财务数据失败，已加载默认数据')
    
    // 使用默认数据
    const defaultOrders: Order[] = [
      {
        id: '1',
        items: [
          { id: '1', name: '高端笔记本电脑', price: 8999, quantity: 2 },
          { id: '2', name: '无线鼠标', price: 299, quantity: 3 }
        ],
        total: 18495,
        status: 'pending',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        items: [
          { id: '3', name: '4K显示器', price: 3999, quantity: 2 },
          { id: '4', name: '机械键盘', price: 899, quantity: 1 }
        ],
        total: 8897,
        status: 'shipped',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]
    calculateFinanceMetrics(defaultOrders)
    financeData.value.totalOrders = 5399
  }
}

/**
 * 计算财务指标
 */
const calculateFinanceMetrics = (orders: Order[]) => {
  // 初始化月度数据，设置基础值
  const monthlyData = Array(6).fill(0).map(() => ({
    revenue: 50000 + Math.random() * 30000, // 基础营收5-8万
    orders: 20 + Math.floor(Math.random() * 15), // 基础订单数20-35
    profit: 10000 + Math.random() * 6000 // 基础利润1-1.6万
  }))
  
  const metrics = orders.reduce((acc: FinanceMetrics, order: Order) => {
    acc.totalRevenue += order.total
    acc.totalOrders += 1
    acc.profit += order.total * 0.2 // 假设利润率为20%
    
    // 根据订单创建时间分配到对应月份
    const orderDate = new Date(order.createdAt)
    const monthIndex = orderDate.getMonth() % 6 // 只取最近6个月
    
    // 将订单数据添加到对应月份
    monthlyData[monthIndex].revenue += order.total
    monthlyData[monthIndex].orders += 1
    monthlyData[monthIndex].profit += order.total * 0.2
    
    switch (order.status) {
      case 'pending':
        acc.pendingRevenue += order.total
        break
      case 'shipped':
        acc.shippedRevenue += order.total
        break
      case 'picking':
        acc.pickingRevenue += order.total
        break
    }
    
    return acc
  }, {
    totalRevenue: 0,
    totalOrders: orders.length > 0 ? 0 : 5399, // 如果没有订单，使用默认值5399
    averageOrderValue: 0,
    pendingRevenue: 0,
    shippedRevenue: 0,
    pickingRevenue: 0,
    profit: 0,
    profitMargin: 0,
    monthlyRevenue: Array(6).fill(0),
    monthlyOrders: Array(6).fill(0),
    monthlyProfit: Array(6).fill(0)
  })
  
  // 计算平均订单金额
  metrics.averageOrderValue = metrics.totalOrders > 0 
    ? metrics.totalRevenue / metrics.totalOrders 
    : 0
    
  // 计算利润率
  metrics.profitMargin = metrics.totalRevenue > 0
    ? (metrics.profit / metrics.totalRevenue) * 100
    : 0
    
  // 更新月度数据，确保数据有合理的起伏
  metrics.monthlyRevenue = monthlyData.map((data, index) => {
    // 添加一些随机波动，但保持在合理范围内
    const baseValue = data.revenue
    const variation = baseValue * 0.1 // 10%的波动
    // 根据月份添加季节性波动
    const seasonalFactor = 1 + Math.sin(index * Math.PI / 3) * 0.15 // 季节性波动因子
    return Math.round((baseValue + (Math.random() * variation * 2 - variation)) * seasonalFactor)
  })
  
  metrics.monthlyOrders = monthlyData.map((data, index) => {
    const baseValue = data.orders
    const variation = Math.floor(baseValue * 0.15) // 15%的波动
    // 根据月份添加促销活动影响
    const promotionFactor = index === 5 ? 1.3 : 1 // 6月份有618促销，订单量增加30%
    return Math.round((baseValue + (Math.random() * variation * 2 - variation)) * promotionFactor)
  })
  
  metrics.monthlyProfit = monthlyData.map((data, index) => {
    const baseValue = data.profit
    const variation = baseValue * 0.12 // 12%的波动
    // 根据月份添加利润率波动
    const profitMarginFactor = 1 + (index % 3 === 0 ? 0.1 : -0.05) // 每季度初利润率略高
    return Math.round((baseValue + (Math.random() * variation * 2 - variation)) * profitMarginFactor)
  })
    
  financeData.value = metrics
}

// 图表数据
interface ChartDataset {
  label: string
  data: number[]
  backgroundColor: string
  borderColor: string
  borderWidth: number
}

const chartData = computed(() => {
  const labels = monthLabels
  let datasets: ChartDataset[] = []
  
  switch (chartType.value) {
    case 'revenue':
      datasets = [{
        label: '月度营收',
        data: financeData.value.monthlyRevenue,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
      break
    case 'orders':
      datasets = [{
        label: '月度订单数',
        data: financeData.value.monthlyOrders,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
      break
    case 'profit':
      datasets = [{
        label: '月度利润',
        data: financeData.value.monthlyProfit,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
      break
  }
  
  return {
    labels,
    datasets
  }
})

// 切换图表类型
const changeChartType = (type: string | number | boolean | undefined) => {
  // 确保 type 是字符串类型
  const chartTypeValue = String(type)
  
  // 保存之前的图表类型，用于比较变化
  const previousType = chartType.value
  
  // 更新图表类型
  chartType.value = chartTypeValue
  
  // 根据图表类型调整图表样式和加载状态
  chartLoading.value = true
  
  // 根据不同的图表类型设置不同的加载时间，模拟数据加载
  const loadingTime = chartTypeValue === 'revenue' ? 300 : chartTypeValue === 'orders' ? 400 : 500
  
  setTimeout(() => {
    chartLoading.value = false
    
    // 根据图表类型显示不同的提示信息
    const typeNames = {
      'revenue': '营收',
      'orders': '订单数',
      'profit': '利润'
    }
    
    // 如果切换到不同的图表类型，显示成功提示
    if (previousType !== chartTypeValue) {
      ElMessage.success(`已切换到${typeNames[chartTypeValue as keyof typeof typeNames]}视图`)
      
      // 根据图表类型更新页面标题
      document.title = `财务情况 - ${typeNames[chartTypeValue as keyof typeof typeNames]}趋势`
    }
    
    // 可以在这里添加图表类型切换时的其他逻辑
    // 例如：保存用户的图表偏好到本地存储
    localStorage.setItem('preferredChartType', chartTypeValue)
  }, loadingTime)
}

// 导航方法
const navigateTo = (path: string) => {
  router.push(path)
}

// MutationObserver 实例
let observer: MutationObserver | null = null

/**
 * 监听订单数据变化
 * 使用 MutationObserver 监听页面变化，实时更新财务数据
 */
const observeOrdersData = () => {
  // 先清理之前的 observer
  if (observer) {
    observer.disconnect()
  }

  // 创建新的 observer
  observer = new MutationObserver(() => {
    // 从本地存储获取订单数据
    const ordersData = localStorage.getItem('ordersList')
    if (ordersData) {
      const orders: Order[] = JSON.parse(ordersData)
      calculateFinanceMetrics(orders)
    }
  })
  
  // 限制观察范围，只观察特定元素
  const targetNode = document.querySelector('.finance-container')
  if (targetNode) {
    observer.observe(targetNode, {
      childList: true,
      subtree: true
    })
  }
  
  return observer
}

/**
 * 组件挂载时的初始化操作
 * 1. 计算初始财务指标
 * 2. 设置数据变化监听
 */
onMounted(() => {
  fetchFinanceList()
  observer = observeOrdersData()
})

/**
 * 组件卸载时的清理操作
 * 断开 MutationObserver 连接
 */
onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

// 监听分页变化
watch([currentPage, pageSize], () => {
  fetchFinanceList()
})
</script>

<template>
  <div class="finance-container">
    <h2>财务情况</h2>
    
    <!-- 导航按钮 -->
    <div class="navigation-buttons">
      <el-button @click="navigateTo('/orders')">订单管理</el-button>
      <el-button @click="navigateTo('/products')">商品管理</el-button>
      <el-button @click="navigateTo('/marketing')">营销管理</el-button>
    </div>
    
    <!-- 财务概览卡片 -->
    <el-row :gutter="20" class="finance-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总营收</span>
            </div>
          </template>
          <div class="card-value">{{ formatUtils.formatCurrency(financeData.totalRevenue) }}</div>
          <div class="card-footer">
            <span>较上月</span>
            <span class="trend-up">+12.5%</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总订单数</span>
            </div>
          </template>
          <div class="card-value">{{ financeData.totalOrders }}</div>
          <div class="card-footer">
            <span>较上月</span>
            <span class="trend-up">+8.3%</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>平均订单金额</span>
            </div>
          </template>
          <div class="card-value">{{ formatUtils.formatCurrency(financeData.averageOrderValue) }}</div>
          <div class="card-footer">
            <span>较上月</span>
            <span class="trend-up">+3.9%</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总利润</span>
            </div>
          </template>
          <div class="card-value">{{ formatUtils.formatCurrency(financeData.profit) }}</div>
          <div class="card-footer">
            <span>利润率</span>
            <span>{{ formatUtils.formatPercentage(financeData.profitMargin) }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 图表区域 -->
    <el-card class="chart-card">
      <template #header>
        <div class="chart-header">
          <span>财务趋势</span>
          <div class="chart-controls">
            <el-radio-group v-model="chartType" size="small" @change="changeChartType">
              <el-radio-button label="revenue">营收</el-radio-button>
              <el-radio-button label="orders">订单数</el-radio-button>
              <el-radio-button label="profit">利润</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>
      <div class="chart-container" v-loading="chartLoading">
        <!-- 这里使用一个简单的图表展示，实际项目中可以使用ECharts等图表库 -->
        <div class="chart-placeholder">
          <div v-for="(value, index) in chartData.datasets[0].data" :key="index" class="chart-bar">
            <div class="bar-label">{{ chartData.labels[index] }}</div>
            <div class="bar-value" :style="{ height: `${value / Math.max(...chartData.datasets[0].data) * 100}%` }">
              <span class="bar-tooltip">{{ formatUtils.formatCurrency(value) }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 订单状态分布 -->
    <el-row :gutter="20" class="status-distribution">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>订单状态分布</span>
            </div>
          </template>
          <div class="status-list">
            <div class="status-item">
              <div class="status-label">待发货</div>
              <div class="status-value">{{ formatUtils.formatCurrency(financeData.pendingRevenue) }}</div>
              <div class="status-percent">{{ formatUtils.formatPercentage(financeData.pendingRevenue / financeData.totalRevenue * 100) }}</div>
            </div>
            <div class="status-item">
              <div class="status-label">已发货</div>
              <div class="status-value">{{ formatUtils.formatCurrency(financeData.shippedRevenue) }}</div>
              <div class="status-percent">{{ formatUtils.formatPercentage(financeData.shippedRevenue / financeData.totalRevenue * 100) }}</div>
            </div>
            <div class="status-item">
              <div class="status-label">拣货中</div>
              <div class="status-value">{{ formatUtils.formatCurrency(financeData.pickingRevenue) }}</div>
              <div class="status-percent">{{ formatUtils.formatPercentage(financeData.pickingRevenue / financeData.totalRevenue * 100) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>财务分析</span>
            </div>
          </template>
          <div class="analysis-content">
            <p>根据当前财务数据，您的业务表现良好，营收和利润均呈上升趋势。</p>
            <p>建议关注以下几点：</p>
            <ul>
              <li>优化库存管理，减少积压</li>
              <li>提高客户满意度，增加复购率</li>
              <li>考虑扩大高利润产品的销售比例</li>
            </ul>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.finance-container {
  padding: 20px;
}

.navigation-buttons {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.finance-cards {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #909399;
}

.trend-up {
  color: #67C23A;
}

.trend-down {
  color: #F56C6C;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
  position: relative;
}

.chart-placeholder {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 100%;
  padding: 20px 0;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
  height: 100%;
  position: relative;
}

.bar-label {
  margin-top: 10px;
  font-size: 12px;
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
}

.bar-value {
  width: 30px;
  background-color: #409EFF;
  border-radius: 4px 4px 0 0;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  transition: height 0.3s;
  min-height: 5px;
}

.bar-tooltip {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s;
}

.bar-value:hover .bar-tooltip {
  opacity: 1;
}

.status-distribution {
  margin-top: 20px;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #EBEEF5;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  font-weight: bold;
}

.status-value {
  color: #409EFF;
}

.status-percent {
  color: #909399;
}

.analysis-content {
  padding: 10px 0;
}

.analysis-content p {
  margin-bottom: 10px;
  line-height: 1.5;
}

.analysis-content ul {
  padding-left: 20px;
  margin-top: 10px;
}

.analysis-content li {
  margin-bottom: 5px;
  line-height: 1.5;
}
</style> 