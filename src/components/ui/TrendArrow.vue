<!-- 趋势箭头组件 -->
<script lang="ts">
import { computed, defineComponent } from 'vue'
import { formatPercentage } from '@/utils/format'

export default defineComponent({
  name: 'TrendArrow',
  props: {
    value: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const isPositive = computed(() => props.value > 0)
    const isNegative = computed(() => props.value < 0)
    const arrowClass = computed(() => ({
      'trend-arrow': true,
      'trend-up': isPositive.value,
      'trend-down': isNegative.value,
      'trend-neutral': props.value === 0
    }))

    return {
      isPositive,
      isNegative,
      arrowClass,
      formatPercentage
    }
  }
})
</script>

<template>
  <span :class="arrowClass">
    {{ isPositive ? '↑' : isNegative ? '↓' : '→' }}
    {{ formatPercentage(Math.abs(value)) }}
  </span>
</template>

<style scoped>
.trend-arrow {
  display: inline-flex;
  align-items: center;
  font-size: 0.875rem;
  margin-left: 0.5rem;
}

.trend-up {
  color: #10b981;
}

.trend-down {
  color: #ef4444;
}

.trend-neutral {
  color: #9ca3af;
}
</style> 