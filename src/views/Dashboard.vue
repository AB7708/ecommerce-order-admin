<template>
  <div class="dashboard-container">
    <!-- 标题与时间筛选 -->
    <header class="dashboard-header">
      <h1 class="page-title">数据看板</h1>
      <div class="date-picker">
        <el-select v-model="selectedRange" placeholder="选择时间范围" @change="handleTimeRangeChange">
          <el-option label="今日" value="today" />
          <el-option label="近7天" value="week" />
          <el-option label="近30天" value="month" />
        </el-select>
      </div>
    </header>

    <!-- 核心指标卡片 -->
    <el-row :gutter="20" class="stats-grid">
      <el-col :span="6" v-for="stat in statistics" :key="stat.title">
        <el-card shadow="hover" :style="{ borderLeft: `4px solid ${stat.color}` }">
          <template #header>
            <div class="card-header">
              <span>{{ stat.title }}</span>
              <el-icon :style="{ color: stat.color }">{{ stat.icon }}</el-icon>
            </div>
          </template>
          <div class="card-content">
            <div class="number">
              <template v-if="loading">--</template>
              <span v-else>
                {{ stat.unit === '元' ? formatUtils.formatCurrency(stat.value) : formatUtils.formatNumber(stat.value) }}
                <trend-arrow :value="stat.trend" />
              </span>
            </div>
            <div class="description">
              <template v-if="loading">加载中...</template>
              <span v-else>较上期</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 次要指标卡片 -->
    <el-row :gutter="20" class="secondary-stats">
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>平均订单金额</span>
            </div>
          </template>
          <div class="card-content">
            <div class="number">
              <template v-if="loading">--</template>
              <span v-else>{{ formatUtils.formatCurrency(averageOrderValue) }}</span>
            </div>
            <div class="description">每笔订单平均价值</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>转化率</span>
            </div>
          </template>
          <div class="card-content">
            <div class="number">
              <template v-if="loading">--</template>
              <span v-else>{{ formatUtils.formatPercentage(conversionRate) }}</span>
            </div>
            <div class="description">访客转化为订单的比例</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>客单价</span>
            </div>
          </template>
          <div class="card-content">
            <div class="number">
              <template v-if="loading">--</template>
              <span v-else>{{ formatUtils.formatCurrency(customerValue) }}</span>
            </div>
            <div class="description">每位客户平均消费</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-area">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>销售额趋势</span>
            </div>
          </template>
          <div class="chart-placeholder" v-loading="loading">
            <div v-if="!loading" class="chart-content">
              <div v-for="(value, index) in chartData.sales" :key="chartData.labels[index]" class="chart-bar">
                <div class="bar-container">
                  <div class="bar-label">{{ chartData.labels[index] }}</div>
                  <div class="bar-value" :style="{ height: `${30 + (value / maxSalesValue) * 30}%` }">
                    <span class="bar-tooltip">{{ formatUtils.formatCurrency(value) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>订单分布</span>
            </div>
          </template>
          <div class="chart-placeholder" v-loading="loading">
            <div v-if="!loading" class="chart-content">
              <div v-for="(value, index) in chartData.orders" :key="chartData.labels[index]" class="chart-bar">
                <div class="bar-container">
                  <div class="bar-label">{{ chartData.labels[index] }}</div>
                  <div class="bar-value" :style="{ height: `${30 + (value / maxOrdersValue) * 30}%` }">
                    <span class="bar-tooltip">{{ formatUtils.formatNumber(value) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useDataDashboard } from '@/composables/useDataDashboard'
import TrendArrow from '@/components/ui/TrendArrow.vue'
import * as formatUtils from '@/utils/format'
import { ElMessage } from 'element-plus'

const { statistics, chartData, loading, handleTimeRangeChange } = useDataDashboard()

const selectedRange = ref<string>('today')

// 添加计算属性优化性能
const maxSalesValue = computed(() => {
  if (!chartData.value.sales.length) return 0
  return Math.max(...chartData.value.sales)
})

const maxOrdersValue = computed(() => {
  if (!chartData.value.orders.length) return 0
  return Math.max(...chartData.value.orders)
})

// 计算平均订单金额
const averageOrderValue = computed(() => {
  const totalOrders = statistics.value.find(stat => stat.title === '总订单数')?.value || 0
  const totalSales = statistics.value.find(stat => stat.title === '总销售额')?.value || 0
  if (!totalOrders || !totalSales) return 0
  return totalSales / totalOrders
})

// 计算转化率
const conversionRate = computed(() => {
  const totalVisitors = statistics.value.find(stat => stat.title === '总访客数')?.value || 0
  const totalOrders = statistics.value.find(stat => stat.title === '总订单数')?.value || 0
  if (!totalVisitors || !totalOrders) return 0
  return (totalOrders / totalVisitors) * 100
})

// 计算客单价
const customerValue = computed(() => {
  const totalCustomers = statistics.value.find(stat => stat.title === '总客户数')?.value || 0
  const totalSales = statistics.value.find(stat => stat.title === '总销售额')?.value || 0
  if (!totalCustomers || !totalSales) return 0
  return totalSales / totalCustomers
})

// 监听时间范围变化
watch(selectedRange, async (newValue: string) => {
  try {
    await handleTimeRangeChange(newValue)
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    ElMessage.error('获取数据失败')
  }
})

onMounted(async () => {
  await handleTimeRangeChange('today')
})
</script>

<style lang="scss" scoped>
/* 设计系统变量 */
:root {
  --primary-color: #6366f1;
  --secondary-color: #4f46e5;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --bg-color: #f8fafc;
  --border-radius: 8px;
  --chart-primary: #3b82f6;
  --chart-secondary: #2563eb;
}

/* 整体布局优化 */
.dashboard-container {
  min-height: 100%;
  padding: 24px;
  background-color: #f5f7fa;
  position: relative;
  overflow-x: hidden;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.date-picker {
  .el-select {
    width: 150px;
  }
}

/* 统计卡片网格 */
.stats-grid {
  margin-bottom: 24px;
}

/* 次要指标卡片样式 */
.secondary-stats {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
}

.number {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.description {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 图表区域 */
.chart-area {
  margin-bottom: 24px;
}

.chart-card {
  height: 100%;
}

.chart-placeholder {
  height: 300px;
  position: relative;
}

.chart-content {
  height: 100%;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  padding-bottom: 24px;
}

.chart-bar {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.bar-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
}

.bar-value {
  width: 24px;
  background-color: #409EFF;
  border-radius: 2px;
  position: relative;
  transition: height 0.3s ease;
  min-height: 4px;
  margin-top: auto;

  &:hover {
    background-color: #337ecc;

    .bar-tooltip {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

.bar-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 8px;
}

.bar-tooltip {
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  transition: all 0.3s;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .stats-grid, .secondary-stats {
    .el-col {
      margin-bottom: 16px;
    }
  }

  .chart-area {
    .el-col {
      margin-bottom: 16px;
    }
  }

  .chart-placeholder {
    height: 240px;
  }
}
</style> 