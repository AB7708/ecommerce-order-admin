import axios from 'axios'
import { getToken, isTokenExpired } from './jwt'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // 开发环境下模拟响应
    if (import.meta.env.DEV) {
      const url = error.config.url
      
      // 模拟登录接口
      if (url === '/auth/login') {
        return Promise.resolve({
          code: 200,
          data: {
            token: 'mock-token',
            refreshToken: 'mock-refresh-token',
            user: {
              id: 1,
              username: 'admin',
              email: 'admin@example.com',
              role: 'admin',
              permissions: ['dashboard', 'orders', 'marketing']
            }
          },
          message: '登录成功'
        })
      }
      
      // 模拟会话验证接口
      if (url === '/auth/validate') {
        return Promise.resolve({
          code: 200,
          data: { valid: true },
          message: '会话验证成功'
        })
      }
      
      // 模拟获取用户信息接口
      if (url === '/auth/user-info') {
        return Promise.resolve({
          code: 200,
          data: {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin',
            permissions: ['dashboard', 'orders', 'marketing']
          },
          message: '获取用户信息成功'
        })
      }
      
      // 模拟获取登录历史接口
      if (url === '/auth/login-history') {
        return Promise.resolve({
          data: {
            code: 200,
            data: {
              items: [
                {
                  id: 1,
                  userId: 1,
                  ipAddress: '127.0.0.1',
                  userAgent: 'Mozilla/5.0',
                  loginTime: new Date().toISOString(),
                  status: 'success'
                }
              ],
              total: 1
            },
            message: '获取登录历史成功'
          }
        })
      }
      
      // 模拟获取安全设置接口
      if (url === '/auth/security-settings') {
        return Promise.resolve({
          data: {
            code: 200,
            data: {
              enableTwoFactor: false,
              enableIpWhitelist: false,
              twoFactorEnabled: false,
              lastLoginIp: '127.0.0.1',
              lastLoginTime: new Date().toISOString(),
              ipWhitelist: [],
              sessionTimeout: 30
            },
            message: '获取安全设置成功'
          }
        })
      }
    }
    
    console.error('Response error:', error)
    ElMessage.error(error.response?.data?.message || '请求失败')
    return Promise.reject(error)
  }
)

export default request 