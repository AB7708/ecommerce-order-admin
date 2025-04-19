import { mount, VueWrapper } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { Component } from 'vue'

interface TestData {
  id: string
  [key: string]: any
}

interface OrderData extends TestData {
  orderNo: string
  customerName: string
  totalAmount: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  createTime: string
}

interface MarketingData extends TestData {
  name: string
  type: 'discount' | 'coupon' | 'flash_sale'
  status: 'draft' | 'active' | 'ended'
  startTime: string
  endTime: string
}

/**
 * 创建一个带有 Element Plus 和路由的测试环境
 * @param component - Vue 组件
 * @param options - 挂载选项
 * @returns 包装器实例
 */
export function mountWithPlugins(
  component: Component,
  options: Record<string, any> = {}
): VueWrapper {
  const router = createRouter({
    history: createWebHistory(),
    routes: []
  })

  const pinia = createPinia()

  return mount(component, {
    global: {
      plugins: [ElementPlus, router, pinia],
      ...options.global
    },
    ...options
  })
}

/**
 * 模拟异步操作
 * @param ms - 延迟时间（毫秒）
 * @returns 延迟后的 Promise
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 模拟 API 响应
 * @param data - 响应数据
 * @param success - 是否成功
 * @param delay - 延迟时间（毫秒）
 * @returns 模拟的 API 响应
 */
export function mockApiResponse<T>(
  data: T,
  success = true,
  delay = 200
): Promise<{ data: T }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (success) {
        resolve({ data })
      } else {
        reject(new Error('API request failed'))
      }
    }, delay)
  })
}

/**
 * 生成测试数据
 * @param type - 数据类型
 * @param count - 数据数量
 * @returns 测试数据数组
 */
export function generateTestData<T extends 'order' | 'marketing'>(
  type: T,
  count = 1
): T extends 'order' ? OrderData[] : MarketingData[] {
  const data: (OrderData | MarketingData)[] = []
  for (let i = 0; i < count; i++) {
    switch (type) {
      case 'order':
        data.push({
          id: `order_${i + 1}`,
          orderNo: `ORD${String(i + 1).padStart(6, '0')}`,
          customerName: `Customer ${i + 1}`,
          totalAmount: (Math.random() * 1000).toFixed(2),
          status: ['pending', 'processing', 'completed', 'cancelled'][
            Math.floor(Math.random() * 4)
          ] as OrderData['status'],
          createTime: new Date().toISOString()
        })
        break
      case 'marketing':
        data.push({
          id: `marketing_${i + 1}`,
          name: `Activity ${i + 1}`,
          type: ['discount', 'coupon', 'flash_sale'][
            Math.floor(Math.random() * 3)
          ] as MarketingData['type'],
          status: ['draft', 'active', 'ended'][
            Math.floor(Math.random() * 3)
          ] as MarketingData['status'],
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        break
      default:
        throw new Error(`Unknown data type: ${type}`)
    }
  }
  return data as T extends 'order' ? OrderData[] : MarketingData[]
} 