export interface UserInfo {
  id: number
  username: string
  email: string
  role: string
  permissions: string[]
}

export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
}

export interface SecuritySettings {
  enableTwoFactor: boolean
  enableIpWhitelist: boolean
  twoFactorEnabled: boolean
  lastLoginIp: string
  lastLoginTime: string
  ipWhitelist: string[]
  sessionTimeout: number
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: UserInfo
}

export interface TwoFactorResponse {
  secret: string
  qrCode: string
}

export interface AuthStore {
  token: string | null
  refreshToken: string | null
  user: UserInfo | null
  securitySettings: SecuritySettings | null
  initUserInfo: () => Promise<void>
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshAuthToken: () => Promise<void>
}

export interface LoginHistory {
  id: number
  userId: number
  ipAddress: string
  userAgent: string
  loginTime: string
  status: 'success' | 'failed'
  failureReason?: string
} 