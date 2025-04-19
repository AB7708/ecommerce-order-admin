<script lang="ts" setup>
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

// 新增：计算平均订单金额
const averageOrderValue = computed(() => {
  const totalOrders = statistics.value.find(stat => stat.title === '总订单数')?.value || 0
  const totalSales = statistics.value.find(stat => stat.title === '总销售额')?.value || 0
  if (!totalOrders || !totalSales) return 0
  return totalSales / totalOrders
})

// 新增：计算转化率
const conversionRate = computed(() => {
  const totalVisitors = statistics.value.find(stat => stat.title === '总访客数')?.value || 0
  const totalOrders = statistics.value.find(stat => stat.title === '总订单数')?.value || 0
  if (!totalVisitors || !totalOrders) return 0
  return (totalOrders / totalVisitors) * 100
})

// 新增：计算客单价
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

<template>
  <div class="dashboard">
    <!-- 标题与时间筛选 -->
    <header class="dashboard-header">
      <h1 class="page-title">数据看板</h1>
      <div class="date-picker">
        <select v-model="selectedRange">
          <option value="today">今日</option>
          <option value="7">近7天</option>
          <option value="30">近30天</option>
        </select>
      </div>
    </header>

    <!-- 核心指标卡片 -->
    <div class="stats-grid">
      <div 
        v-for="stat in statistics" 
        :key="stat.title"
        class="stat-card"
        :style="{ borderLeft: `4px solid ${stat.color}` }"
      >
        <div class="stat-icon" :style="{ backgroundColor: stat.color + '20' }">
          {{ stat.icon }}
        </div>
        <div class="stat-info">
          <div class="stat-title">{{ stat.title }}</div>
          <div class="stat-value">
            <template v-if="loading">--</template>
            <span v-else>
              {{ stat.unit === '元' ? formatUtils.formatCurrency(stat.value) : formatUtils.formatNumber(stat.value) }}
              <TrendArrow :value="stat.trend" />
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增：次要指标卡片 -->
    <div class="secondary-stats">
      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-title">平均订单金额</div>
          <div class="stat-value">
            <template v-if="loading">--</template>
            <span v-else>{{ formatUtils.formatCurrency(averageOrderValue) }}</span>
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-title">转化率</div>
          <div class="stat-value">
            <template v-if="loading">--</template>
            <span v-else>{{ formatUtils.formatPercentage(conversionRate) }}</span>
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-title">客单价</div>
          <div class="stat-value">
            <template v-if="loading">--</template>
            <span v-else>{{ formatUtils.formatCurrency(customerValue) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-area">
      <div class="chart-card">
        <h3>销售额趋势</h3>
        <div class="chart-placeholder">
          <template v-if="loading">
            <div class="chart-skeleton"></div>
          </template>
          <template v-else>
            <div class="chart-content">
              <div v-for="(value, index) in chartData.sales" :key="chartData.labels[index]" class="chart-bar">
                <div class="bar-container">
                  <div class="bar-label">{{ chartData.labels[index] }}</div>
                  <div class="bar-value" :style="{ height: `${30 + (value / maxSalesValue) * 30}%` }">
                    <span class="bar-tooltip">{{ formatUtils.formatCurrency(value) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="chart-card">
        <h3>订单分布</h3>
        <div class="chart-placeholder">
          <template v-if="loading">
            <div class="chart-skeleton"></div>
          </template>
          <template v-else>
            <div class="chart-content">
              <div v-for="(value, index) in chartData.orders" :key="chartData.labels[index]" class="chart-bar">
                <div class="bar-container">
                  <div class="bar-label">{{ chartData.labels[index] }}</div>
                  <div class="bar-value" :style="{ height: `${30 + (value / maxOrdersValue) * 30}%` }">
                    <span class="bar-tooltip">{{ formatUtils.formatNumber(value) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 设计系统变量 */
:root {
  --primary-color: #6366f1;
  --secondary-color: #4f46e5;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --bg-color: #f8fafc;
  --border-radius: 8px;
  --chart-primary: #3b82f6;  /* 新增：图表主色 */
  --chart-secondary: #2563eb;  /* 新增：图表次色 */
}

/* 整体布局优化 */
.dashboard {
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
  select {
    padding: 8px 16px;
    border: 1px solid #e2e8f0;
    border-radius: var(--border-radius);
    background-color: white;
    font-size: 0.875rem;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: var(--primary-color);
    }

    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }
  }
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

/* 新增：次要指标卡片样式 */
.secondary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* 图表区域 */
.chart-area {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.chart-card {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 16px;
  }
}

.chart-placeholder {
  height: 300px;
  position: relative;
}

.chart-skeleton {
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.06) 25%,
    rgba(0, 0, 0, 0.08) 37%,
    rgba(0, 0, 0, 0.06) 63%
  );
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
  border-radius: var(--border-radius);
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
}

.bar-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 8px;
}

.bar-value {
  width: 24px;
  background-color: var(--chart-primary);
  border-radius: 2px;
  position: relative;
  transition: height 0.3s ease;

  &:hover {
    background-color: var(--chart-secondary);

    .bar-tooltip {
      opacity: 1;
      transform: translateY(0);
    }
  }
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

@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .secondary-stats {
    grid-template-columns: 1fr;
  }

  .chart-area {
    grid-template-columns: 1fr;
  }

  .chart-card {
    padding: 16px;
  }

  .chart-placeholder {
    height: 240px;
  }
}
</style> 