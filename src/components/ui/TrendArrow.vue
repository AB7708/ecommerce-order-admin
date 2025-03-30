<template>
  <span class="trend-arrow" :class="{ 
    'trend-up': value > 0, 
    'trend-down': value < 0,
    'trend-flat': value === 0 
  }">
    <el-icon :class="{ 'rotate-icon': value < 0 }">
      <component :is="value === 0 ? 'Minus' : 'ArrowUp'" />
    </el-icon>
    <span class="trend-value">{{ formatPercentage(Math.abs(value)) }}</span>
  </span>
</template>

<script setup>
import { formatPercentage } from '../../utils/format'
import { ArrowUp, Minus } from '@element-plus/icons-vue'

defineProps({
  value: {
    type: Number,
    required: true
  }
})
</script>

<style scoped>
.trend-arrow {
  font-size: 0.875rem;
  padding: 2px 6px;  /* 添加内边距 */
  border-radius: 4px;  /* 圆角 */
  background-color: rgba(0, 0, 0, 0.04);  /* 背景色 */
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s;  /* 添加过渡效果 */
}

.trend-up {
  color: #10b981;
  background-color: rgba(16, 185, 129, 0.1);  /* 成功状态背景 */
}

.trend-down {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);  /* 警告状态背景 */
}

.trend-flat {
  color: #9ca3af;
  background-color: rgba(156, 163, 175, 0.1);  /* 中性状态背景 */
}

.rotate-icon {
  transform: rotate(180deg);  /* 向下箭头 */
}

.trend-value {
  font-size: 0.75rem;
  font-weight: 500;
}

/* 添加悬停效果 */
.trend-arrow:hover {
  opacity: 0.8;
}
</style> 