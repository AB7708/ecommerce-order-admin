import { jwtDecode } from 'jwt-decode'
import { STORAGE_KEYS } from '@/constants/config'
import type { JwtPayload } from 'jwt-decode'

/**
 * 验证 JWT token 格式
 * @param token JWT token
 * @returns 是否有效
 */
const isValidTokenFormat = (token: string): boolean => {
  if (!token) return false
  const parts = token.split('.')
  return parts.length === 3 && parts.every(part => part.length > 0)
}

/**
 * 解析 JWT token
 * @param token JWT token
 * @returns 解析后的 payload
 */
export const parseJwt = (token: string): JwtPayload => {
  try {
    if (!isValidTokenFormat(token)) {
      throw new Error('Invalid token format')
    }
    return jwtDecode<JwtPayload>(token)
  } catch (error) {
    console.error('Failed to parse JWT token:', error)
    // 清除无效的 token
    removeTokens()
    throw new Error('Invalid JWT token')
  }
}

/**
 * 检查 JWT token 是否过期
 * @param token JWT token
 * @returns 是否过期
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    if (!token || !isValidTokenFormat(token)) {
      return true
    }
    const { exp } = parseJwt(token)
    if (!exp) return true
    // 提前5分钟认为令牌过期，以便有时间刷新
    return Date.now() >= (exp * 1000 - 5 * 60 * 1000)
  } catch (error) {
    return true
  }
}

/**
 * 从 localStorage 获取访问令牌
 * @returns token 或 null
 */
export const getToken = (): string | null => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
  return token && isValidTokenFormat(token) ? token : null
}

/**
 * 从 localStorage 获取刷新令牌
 * @returns refresh token 或 null
 */
export const getRefreshToken = (): string | null => {
  const token = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  return token && isValidTokenFormat(token) ? token : null
}

/**
 * 将访问令牌保存到 localStorage
 * @param token JWT token
 */
export const setToken = (token: string): void => {
  if (!isValidTokenFormat(token)) {
    throw new Error('Invalid token format')
  }
  localStorage.setItem(STORAGE_KEYS.TOKEN, token)
}

/**
 * 将刷新令牌保存到 localStorage
 * @param refreshToken 刷新令牌
 */
export const setRefreshToken = (refreshToken: string): void => {
  if (!isValidTokenFormat(refreshToken)) {
    throw new Error('Invalid refresh token format')
  }
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
}

/**
 * 从 localStorage 移除所有令牌
 */
export const removeTokens = (): void => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
}

/**
 * 检查是否已登录
 * @returns 是否已登录
 */
export const isLoggedIn = (): boolean => {
  const token = getToken()
  return token !== null && !isTokenExpired(token)
}

/**
 * 获取当前用户 ID
 * @returns 用户 ID 或 null
 */
export const getCurrentUserId = (): string | null => {
  const token = getToken()
  if (!token) return null
  try {
    const { sub } = parseJwt(token)
    return sub ?? null
  } catch (error) {
    return null
  }
}

/**
 * 检查刷新令牌是否有效
 * @returns 是否有效
 */
export const hasValidRefreshToken = (): boolean => {
  const refreshToken = getRefreshToken()
  return refreshToken !== null && !isTokenExpired(refreshToken)
} 