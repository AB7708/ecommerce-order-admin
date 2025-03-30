import { ref } from 'vue'
import { formatCurrency, formatNumber } from '../utils/format'

export function useData() {
  const statsData = ref([
    { value: 0, trend: 0 },
    { value: 0, trend: 0 },
    { value: 0, trend: 0 },
    { value: 0, trend: 0 }
  ])
  const chartData = ref({
    sales: [],
    orders: []
  })
  const loading = ref(false)

  const fetchData = async (days = 7) => {
    loading.value = true
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 生成日期数组
      const dates = Array.from({ length: days }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
      }).reverse()

      // 生成随机数据
      const baseSales = 100000
      const baseOrders = 1000
      const salesData = dates.map(date => ({
        date,
        value: Math.floor(baseSales + Math.random() * (days === 30 ? baseSales * 0.5 : 50000))
      }))
      const dailyOrdersData = dates.map(date => ({
        date,
        value: Math.floor(baseOrders + Math.random() * (days === 30 ? baseOrders * 0.5 : 200))
      }))

      // 如果是30天数据，只保留每隔4天的数据
      if (days === 30) {
        const filteredSalesData = salesData.filter((_, index) => index % 4 === 0)
        const filteredOrdersData = dailyOrdersData.filter((_, index) => index % 4 === 0)
        
        if (filteredSalesData[filteredSalesData.length - 1].date !== dates[dates.length - 1]) {
          filteredSalesData.push(salesData[salesData.length - 1])
          filteredOrdersData.push(dailyOrdersData[dailyOrdersData.length - 1])
        }

        chartData.value = {
          sales: filteredSalesData,
          orders: filteredOrdersData
        }
      } else {
        chartData.value = {
          sales: salesData,
          orders: dailyOrdersData
        }
      }

      // 更新统计数据（使用固定值）
      statsData.value = [
        {
          value: 78450,  // 总订单数
          trend: 15.2
        },
        {
          value: 2348,  // 今日订单数
          trend: 2.0
        },
        {
          value: 1568900,  // 总销售额
          trend: 12.5
        },
        {
          value: 318999,  // 用户数量
          trend: 8.3
        }
      ]
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    statsData,
    chartData,
    loading,
    fetchData
  }
} 