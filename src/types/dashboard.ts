/**
 * 统计卡片数据类型定义
 */
export interface StatisticCard {
  title: string
  value: number
  unit: string
  trend: number
  icon: string
  color: string
}

/**
 * 图表数据点类型定义
 */
export interface ChartDataPoint {
  date: string
  value: number
}

/**
 * 图表数据类型定义
 */
export interface ChartData {
  labels: string[]
  sales: number[]
  orders: number[]
}

/**
 * 仪表盘数据类型定义
 */
export interface DashboardData {
  statistics: StatisticCard[]
  orderTrend: ChartDataPoint[]
  salesDistribution: ChartDataPoint[]
} 