import { ref, onMounted } from 'vue'
import type { Ref } from 'vue'
import { formatCurrency, formatNumber } from '@/utils/format'

interface StatItem {
  title: string
  value: number
  unit: string
  trend: number
  icon: string
  color: string
  formattedValue?: string
}

interface ChartData {
  labels: string[]
  sales: number[]
  orders: number[]
}

export function useDataDashboard() {
  const loading = ref(false)
  const statistics: Ref<StatItem[]> = ref([])
  const chartData: Ref<ChartData> = ref({
    labels: [],
    sales: [],
    orders: []
  })
  const timeRange = ref('today')

  // 获取统计数据
  const fetchStatistics = async () => {
    loading.value = true
    try {
      // 根据时间范围调整基础数据
      let baseSales = 126560
      let baseOrders = 1234
      let baseVisitors = 8846
      let baseCustomers = 256
      
      // 根据时间范围调整数据
      if (timeRange.value === 'month') {
        // 30天数据
        baseSales = baseSales * 4
        baseOrders = baseOrders * 4
        baseVisitors = baseVisitors * 4
        baseCustomers = baseCustomers * 2
      } else if (timeRange.value === 'week') {
        // 7天数据
        baseSales = baseSales * 1.5
        baseOrders = baseOrders * 1.5
        baseVisitors = baseVisitors * 1.5
        baseCustomers = baseCustomers * 1.2
      }
      
      statistics.value = [
        {
          title: '总销售额',
          value: baseSales,
          unit: '元',
          trend: 0.12,
          icon: 'Money',
          color: '#409EFF',
          formattedValue: formatCurrency(baseSales)
        },
        {
          title: '总订单数',
          value: baseOrders,
          unit: '单',
          trend: -0.05,
          icon: 'ShoppingCart',
          color: '#67C23A',
          formattedValue: formatNumber(baseOrders)
        },
        {
          title: '总访客数',
          value: baseVisitors,
          unit: '人',
          trend: 0.15,
          icon: 'View',
          color: '#E6A23C',
          formattedValue: formatNumber(baseVisitors)
        },
        {
          title: '总客户数',
          value: baseCustomers,
          unit: '人',
          trend: 0.08,
          icon: 'User',
          color: '#F56C6C',
          formattedValue: formatNumber(baseCustomers)
        }
      ]
    } catch (error) {
      console.error('获取统计数据失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 生成日期数组
  const generateDates = (days: number): string[] => {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
    }).reverse()
  }

  // 生成固定数据
  const generateFixedData = (base: number, days: number): number[] => {
    // 生成固定模式的数据
    return Array.from({ length: days }, (_, i) => {
      // 使用正弦函数生成波动，增加波动幅度
      const wave = Math.sin(i * 0.5) * 0.3 + 1 // 从0.1增加到0.3
      return Math.floor(base * wave)
    })
  }

  // 模拟获取图表数据
  const fetchChartData = async () => {
    try {
      const days = timeRange.value === 'month' ? 30 : 7
      const dates = generateDates(days)
      
      const baseSales = timeRange.value === 'month' ? 400000 : 150000
      const baseOrders = timeRange.value === 'month' ? 4000 : 1500
      
      const sales = generateFixedData(baseSales, days)
      const orders = generateFixedData(baseOrders, days)

      // 如果是30天数据，只保留每隔4天的数据
      if (days === 30) {
        chartData.value = {
          labels: dates.filter((_, i) => i % 4 === 0),
          sales: sales.filter((_, i) => i % 4 === 0),
          orders: orders.filter((_, i) => i % 4 === 0)
        }
      } else {
        chartData.value = {
          labels: dates,
          sales,
          orders
        }
      }
    } catch (error) {
      console.error('获取图表数据失败:', error)
    }
  }

  // 处理时间范围变化
  const handleTimeRangeChange = async (range: string) => {
    timeRange.value = range
    await Promise.all([fetchStatistics(), fetchChartData()])
  }

  // 初始化数据
  onMounted(async () => {
    await handleTimeRangeChange('today')
  })

  return {
    loading,
    statistics,
    chartData,
    timeRange,
    handleTimeRangeChange
  }
} 