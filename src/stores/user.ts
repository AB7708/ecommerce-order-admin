import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Ref } from 'vue'

interface UserInfo {
  email: string
  name: string
  role: string
  avatar: string
}

interface LoginForm {
  username: string
  password: string
}

export const useUserStore = defineStore('user', () => {
  const router = useRouter()
  const token: Ref<string> = ref(localStorage.getItem('token') || '')
  const userInfo: Ref<UserInfo> = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  // 初始化用户信息
  const initUserInfo = (): void => {
    const savedUserInfo = localStorage.getItem('userInfo')
    if (savedUserInfo) {
      userInfo.value = JSON.parse(savedUserInfo)
    }
  }

  const login = async (loginForm: LoginForm): Promise<boolean> => {
    try {
      // 测试阶段：简单的账号密码验证
      if (loginForm.username === 'admin' && loginForm.password === '123456') {
        const mockToken = 'mock-token-' + Date.now()
        token.value = mockToken
        localStorage.setItem('token', mockToken)
        
        const newUserInfo: UserInfo = {
          email: loginForm.username,
          name: '管理员',
          role: 'admin',
          avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
        }
        
        userInfo.value = newUserInfo
        localStorage.setItem('userInfo', JSON.stringify(newUserInfo))

        router.push('/')
        return true
      } else {
        throw new Error('用户名或密码有误')
      }
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  const logout = (): void => {
    token.value = ''
    userInfo.value = {} as UserInfo
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('rememberMe')
    router.push('/login')
  }

  // 初始化用户信息
  initUserInfo()

  return {
    token,
    userInfo,
    login,
    logout,
    initUserInfo
  }
}) 