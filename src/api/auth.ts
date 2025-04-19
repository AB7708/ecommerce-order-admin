import request from '@/utils/request'
import { encryptData } from '@/utils/crypto'
import type { 
  LoginCredentials, 
  UserInfo, 
  SecuritySettings, 
  LoginResponse, 
  TwoFactorResponse,
  LoginHistory
} from '@/types/auth'
import type { ApiResponse, PaginationParams, PaginatedResponse } from '@/types/api'
import { API_ENDPOINTS } from '@/constants/api'

/**
 * 用户登录
 * @param credentials 登录凭证
 * @returns 登录响应
 */
export const login = (credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> => {
  const encryptedPassword = encryptData(credentials.password)
  return request({
    url: '/auth/login',
    method: 'post',
    data: {
      username: credentials.username,
      password: encryptedPassword
    }
  })
}

/**
 * 刷新访问令牌
 * @param refreshToken 刷新令牌
 * @returns 新的令牌信息
 */
export const refreshToken = (refreshToken: string): Promise<ApiResponse<{ token: string }>> => {
  return request({
    url: API_ENDPOINTS.AUTH.REFRESH_TOKEN,
    method: 'post',
    data: { refreshToken }
  })
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export const getUserInfo = (): Promise<ApiResponse<UserInfo>> => {
  return request({
    url: '/auth/user-info',
    method: 'get'
  })
}

/**
 * 修改密码
 * @param data 密码修改数据
 * @returns 修改结果
 */
export const changePassword = (data: { oldPassword: string; newPassword: string }): Promise<void> => {
  // 加密新旧密码
  const encryptedOldPassword = encryptData(data.oldPassword)
  const encryptedNewPassword = encryptData(data.newPassword)
  
  return request({
    url: '/auth/change-password',
    method: 'post',
    data: {
      oldPassword: encryptedOldPassword,
      newPassword: encryptedNewPassword
    }
  })
}

/**
 * 获取用户权限列表
 * @returns 权限列表
 */
export const getUserPermissions = (): Promise<string[]> => {
  return request({
    url: '/auth/permissions',
    method: 'get'
  })
}

/**
 * 验证当前会话是否有效
 * @returns 验证结果
 */
export const validateSession = (): Promise<ApiResponse<{ valid: boolean }>> => {
  return request({
    url: '/auth/validate',
    method: 'get'
  })
}

/**
 * 获取登录历史
 * @param params 分页参数
 * @returns 登录历史列表
 */
export const getLoginHistory = (params: PaginationParams): Promise<ApiResponse<PaginatedResponse<LoginHistory>>> => {
  return request({
    url: '/auth/login-history',
    method: 'get',
    params
  })
}

/**
 * 获取安全设置
 * @returns 安全设置信息
 */
export const getSecuritySettings = (): Promise<ApiResponse<SecuritySettings>> => {
  return request({
    url: '/auth/security-settings',
    method: 'get'
  })
}

/**
 * 更新安全设置
 * @param settings 安全设置
 * @returns 更新结果
 */
export const updateSecuritySettings = (settings: Partial<SecuritySettings>): Promise<void> => {
  return request({
    url: '/auth/security-settings',
    method: 'put',
    data: settings
  })
}

/**
 * 获取双因素认证二维码
 * @returns 二维码信息
 */
export const getTwoFactorQrCode = (): Promise<ApiResponse<TwoFactorResponse>> => {
  return request({
    url: '/auth/two-factor/qrcode',
    method: 'get'
  })
}

/**
 * 验证双因素认证
 * @param code 验证码
 * @returns 验证结果
 */
export const verifyTwoFactor = (code: string): Promise<ApiResponse<{ success: boolean }>> => {
  return request({
    url: '/auth/two-factor/verify',
    method: 'post',
    data: { code }
  })
}

/**
 * 禁用双因素认证
 * @param code 验证码
 * @returns 禁用结果
 */
export const disableTwoFactor = (code: string): Promise<void> => {
  return request({
    url: '/auth/two-factor/disable',
    method: 'post',
    data: { code }
  })
}

/**
 * 登出
 * @returns 登出结果
 */
export const logout = (): Promise<ApiResponse<void>> => {
  return request({
    url: API_ENDPOINTS.AUTH.LOGOUT,
    method: 'post'
  })
} 