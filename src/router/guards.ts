import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { AuthStore } from '@/types/auth'
import { ElMessage } from 'element-plus'

interface RouteMeta {
  requiresAuth?: boolean
  permissions?: string[]
  requiresTwoFactor?: boolean
  requiresIpWhitelist?: boolean
}

interface SecuritySettings {
  enableTwoFactor: boolean
  enableIpWhitelist: boolean
  ipWhitelist: string[]
}

interface AuthStore {
  isAuthenticated: boolean
  twoFactorVerified: boolean
  securitySettings: SecuritySettings
  refreshAuthToken: () => Promise<boolean>
  hasPermission: (permission: string) => boolean
  validateSession: () => Promise<boolean>
}

/**
 * 认证守卫
 * 检查用户是否已登录，未登录则重定向到登录页
 */
export const authGuard = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !authStore.token) {
    next('/login')
  } else {
    next()
  }
}

/**
 * 双因素认证守卫
 * 检查是否需要完成双因素认证
 */
export const twoFactorGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): Promise<void> => {
  const authStore = useAuthStore() as AuthStore
  
  if (to.meta.requiresTwoFactor) {
    // 检查是否已启用双因素认证
    if (!authStore.securitySettings.enableTwoFactor) {
      ElMessage.warning('请先启用双因素认证')
      next('/security-settings')
      return
    }
    
    // 检查是否已完成双因素认证
    if (!authStore.twoFactorVerified) {
      next('/two-factor-verify')
      return
    }
  }
  
  next()
}

/**
 * IP 白名单守卫
 * 检查当前 IP 是否在白名单中
 */
export const ipWhitelistGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): Promise<void> => {
  const authStore = useAuthStore() as AuthStore
  
  if (to.meta.requiresIpWhitelist) {
    // 检查是否启用 IP 白名单
    if (authStore.securitySettings.enableIpWhitelist) {
      try {
        // 获取当前 IP
        const response = await fetch('https://api.ipify.org?format=json')
        const { ip } = await response.json()
        
        // 检查 IP 是否在白名单中
        if (!authStore.securitySettings.ipWhitelist.includes(ip)) {
          ElMessage.error('当前 IP 不在白名单中')
          next('/')
          return
        }
      } catch (error) {
        console.error('获取 IP 失败:', error)
        ElMessage.error('IP 验证失败')
        next('/')
        return
      }
    }
  }
  
  next()
}

/**
 * 会话验证守卫
 * 定期验证会话是否有效
 */
export const sessionGuard = async (
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()

  if (authStore.token) {
    try {
      await authStore.refreshAuthToken()
    } catch (error) {
      console.error('Failed to refresh token:', error)
      authStore.logout()
    }
  }

  next()
}

/**
 * 组合所有守卫
 */
export const setupGuards = (router: any): void => {
  router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    try {
      // 按顺序执行守卫
      await authGuard(to, from, next)
      await twoFactorGuard(to, from, next)
      await ipWhitelistGuard(to, from, next)
      await sessionGuard(to, from, next)
    } catch (error) {
      console.error('路由守卫执行失败:', error)
      next('/error')
    }
  })
} 