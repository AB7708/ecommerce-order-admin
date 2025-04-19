import request from '@/utils/request'
import type { DashboardData } from '@/types/dashboard'
import type { ApiResponse } from '@/types/api'
import { API_ENDPOINTS } from '@/constants/api'

/**
 * 获取仪表盘数据
 * @param timeRange 时间范围（7或30）
 * @returns 仪表盘数据
 */
export const getDashboardData = (timeRange: string): Promise<ApiResponse<DashboardData>> => {
  return request({
    url: API_ENDPOINTS.DASHBOARD.STATISTICS,
    method: 'get',
    params: { timeRange }
  })
}

/**
 * 更新仪表盘数据
 * @param data 更新的数据
 * @returns 更新结果
 */
export const updateDashboardData = (data: Partial<DashboardData>): Promise<ApiResponse<void>> => {
  return request({
    url: API_ENDPOINTS.DASHBOARD.STATISTICS,
    method: 'post',
    data
  })
} 