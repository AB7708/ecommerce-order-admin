import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  login,
  validateSession,
  getUserInfo,
  getLoginHistory,
  getSecuritySettings,
  verifyTwoFactor,
  disableTwoFactor,
  getTwoFactorQrCode,
  logout
} from '@/api/auth'
import type {
  UserInfo,
  SecuritySettings,
  LoginHistory,
  LoginCredentials,
  TwoFactorResponse,
  LoginResponse
} from '@/types/auth'
import type { ApiResponse, PaginationParams, PaginatedResponse } from '@/types/api'

// 定义 store 的类型
type AuthStore = ReturnType<typeof useAuthStore>

// 定义 store 的 actions 类型
interface AuthStoreActions {
  checkSession: () => Promise<ApiResponse<{ valid: boolean }>>
  loginUser: (credentials: LoginCredentials) => Promise<ApiResponse<LoginResponse>>
  fetchUserInfo: () => Promise<ApiResponse<UserInfo>>
  fetchLoginHistory: (params: PaginationParams) => Promise<ApiResponse<PaginatedResponse<LoginHistory>>>
  fetchSecuritySettings: () => Promise<ApiResponse<SecuritySettings>>
  verifyTwoFactorCode: (code: string) => Promise<ApiResponse<{ success: boolean }>>
  disableTwoFactorAuth: (code: string) => Promise<void>
  getTwoFactorQRCode: () => Promise<ApiResponse<TwoFactorResponse>>
  logoutUser: () => Promise<ApiResponse<void>>
}

// 定义 store 的 state 类型
interface AuthStoreState {
  token: string
  userInfo: UserInfo | null
  securitySettings: SecuritySettings | null
  loginHistory: LoginHistory[]
  totalLoginHistory: number
  isAuthenticated: boolean
}

// 定义完整的 store 类型
export type AuthStoreType = AuthStoreState & AuthStoreActions

// 定义 store
export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)
  const securitySettings = ref<SecuritySettings | null>(null)
  const loginHistory = ref<LoginHistory[]>([])
  const totalLoginHistory = ref(0)

  // Computed
  const isAuthenticated = computed(() => !!token.value)

  // Actions
  const checkSession = async (): Promise<ApiResponse<{ valid: boolean }>> => {
    try {
      const response = await validateSession()
      return response
    } catch (error) {
      return {
        code: 500,
        data: { valid: false },
        message: 'Session validation failed'
      }
    }
  }

  const loginUser = async (credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> => {
    try {
      const response = await login(credentials)
      if (response.code === 200) {
        token.value = response.data.token
        userInfo.value = response.data.user
      }
      return response
    } catch (error) {
      console.error('Login error:', error)
      return {
        code: 500,
        data: {
          token: '',
          refreshToken: '',
          user: {
            id: 0,
            username: '',
            email: '',
            role: '',
            permissions: []
          }
        },
        message: '登录失败'
      }
    }
  }

  const fetchUserInfo = async (): Promise<ApiResponse<UserInfo>> => {
    const response = await getUserInfo()
    if (response.code === 200) {
      userInfo.value = response.data
    }
    return response
  }

  const fetchLoginHistory = async (params: PaginationParams): Promise<ApiResponse<PaginatedResponse<LoginHistory>>> => {
    const response = await getLoginHistory(params)
    if (response.code === 200) {
      loginHistory.value = response.data.items
      totalLoginHistory.value = response.data.total
    }
    return response
  }

  const fetchSecuritySettings = async (): Promise<ApiResponse<SecuritySettings>> => {
    const response = await getSecuritySettings()
    if (response.code === 200) {
      securitySettings.value = response.data
    }
    return response
  }

  const verifyTwoFactorCode = async (code: string): Promise<ApiResponse<{ success: boolean }>> => {
    return verifyTwoFactor(code)
  }

  const disableTwoFactorAuth = async (code: string): Promise<void> => {
    await disableTwoFactor(code)
    if (securitySettings.value) {
      securitySettings.value.twoFactorEnabled = false
    }
  }

  const getTwoFactorQRCode = async (): Promise<ApiResponse<TwoFactorResponse>> => {
    return getTwoFactorQrCode()
  }

  const logoutUser = async (): Promise<ApiResponse<void>> => {
    const response = await logout()
    if (response.code === 200) {
      token.value = ''
      userInfo.value = null
      securitySettings.value = null
      loginHistory.value = []
      totalLoginHistory.value = 0
    }
    return response
  }

  return {
    // State
    token,
    userInfo,
    securitySettings,
    loginHistory,
    totalLoginHistory,
    // Computed
    isAuthenticated,
    // Actions
    loginUser,
    checkSession,
    fetchUserInfo,
    fetchLoginHistory,
    fetchSecuritySettings,
    verifyTwoFactorCode,
    disableTwoFactorAuth,
    getTwoFactorQRCode,
    logoutUser
  }
}) 