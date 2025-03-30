<script setup>
import { ref, onMounted, watch } from 'vue'
import { useData } from '../composables/useDashboard'
import TrendArrow from '../components/ui/TrendArrow.vue'
import { formatCurrency, formatNumber } from '../utils/format'

const { statsData, chartData, loading, fetchData } = useData()

const selectedRange = ref('7')

// 监听时间范围变化
watch(selectedRange, async (newValue) => {
  await fetchData(parseInt(newValue))
  // 更新统计数据
  stats.value.forEach((item, index) => {
    const baseValue = statsData.value[index]
    // 如果是30天，则数据为7天的130%
    const targetValue = newValue === '30' 
      ? { value: baseValue.value * 1.3, trend: baseValue.trend }
      : baseValue
    animateNumber(item, targetValue)
  })
})

// 统计卡片数据
const stats = ref([
  { 
    title: '总订单数', 
    value: 0,
    icon: '📦',
    color: '#6366f1',
    trend: null,
    formatter: formatNumber
  },
  { 
    title: '今日订单', 
    value: 0,
    icon: '📅',
    color: '#10b981',
    trend: null,
    formatter: formatNumber
  },
  { 
    title: '总销售额', 
    value: 0,
    icon: '💰',
    color: '#f59e0b',
    trend: null,
    formatter: formatCurrency
  },
  { 
    title: '用户数量', 
    value: 0,
    icon: '👥',
    color: '#8b5cf6',
    trend: null,
    formatter: formatNumber
  }
])

// 动态数字递增效果
const animateNumber = (item, target) => {
  const duration = 1000
  const start = 0
  const increment = target.value / (duration / 16)
  let current = start

  const animate = () => {
    current += increment
    if (current < target.value) {
      item.value = Math.floor(current)
      requestAnimationFrame(animate)
    } else {
      item.value = target.value
      item.trend = target.trend
    }
  }

  animate()
}

onMounted(async () => {
  await fetchData()
  stats.value.forEach((item, index) => {
    animateNumber(item, statsData.value[index])
  })
})
</script>

<template>
  <div class="dashboard">
    <!-- 标题与时间筛选 -->
    <header class="dashboard-header">
      <h1 class="page-title">数据看板</h1>
      <div class="date-picker">
        <select v-model="selectedRange">
          <option value="7">近7天</option>
          <option value="30">近30天</option>
        </select>
      </div>
    </header>

    <!-- 核心指标卡片 -->
    <div class="stats-grid">
      <div 
        v-for="stat in stats" 
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
              {{ stat.formatter(stat.value) }}
              <TrendArrow :value="stat.trend" />
            </span>
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
              <div v-for="item in chartData.sales" :key="item.date" class="chart-bar">
                <div class="bar-container">
                  <div class="bar-label">{{ item.date }}</div>
                  <div class="bar-value" :style="{ height: `${30 + (item.value / Math.max(...chartData.sales.map(d => d.value))) * 30}%` }">
                    <span class="bar-tooltip">{{ formatCurrency(item.value) }}</span>
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
              <div v-for="item in chartData.orders" :key="item.date" class="chart-bar">
                <div class="bar-container">
                  <div class="bar-label">{{ item.date }}</div>
                  <div class="bar-value" :style="{ height: `${30 + (item.value / Math.max(...chartData.orders.map(d => d.value))) * 30}%` }">
                    <span class="bar-tooltip">{{ formatNumber(item.value) }}</span>
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

<style scoped>
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
  background-color: #f5f7fa;  /* 只修改背景颜色 */
  position: relative;
  overflow-x: hidden;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.date-picker select {
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  border: 1px solid #e2e8f0;
  background: white;
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s;
}

.date-picker select:hover {
  border-color: var(--primary-color);
}

/* 统计卡片升级 */
.stats-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  transition: all 0.3s;
  min-height: 120px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  font-size: 1.5rem;
  padding: 0.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
}

.stat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-title {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 图表区域布局 */
.chart-area {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-top: 24px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  height: 400px;  /* 固定高度 */
  display: flex;
  flex-direction: column;
}

.chart-card h3 {
  margin: 0 0 24px 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

.chart-placeholder {
  flex: 1;
  position: relative;
  min-height: 300px;  /* 确保最小高度 */
}

.chart-skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--border-radius);
}

.chart-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 100%;
  padding: 0 20px;
  position: relative;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: 0 4px;
}

.bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
  justify-content: flex-end;
}

.bar-value {
  background-color: #3b82f6;
  width: 40px;
  border-radius: 4px 4px 0 0;
  transition: all 0.3s;
  position: relative;
  min-height: 1px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.bar-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  text-align: center;
  width: 100%;
  padding: 4px 0;
}

.bar-tooltip {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  z-index: 4;  /* 添加：确保tooltip在最上层 */
}

.chart-bar:hover .bar-value {
  background-color: #2563eb;  /* 使用更深的蓝色 */
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.chart-bar:hover .bar-tooltip {
  opacity: 1;
}

/* 移动端适配优化 */
@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .chart-area {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .chart-card {
    padding: 16px;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .bar-value {
    width: 30px;
  }

  .bar-tooltip {
    font-size: 10px;
    padding: 2px 4px;
  }
}

/* 加载动画 */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style> 