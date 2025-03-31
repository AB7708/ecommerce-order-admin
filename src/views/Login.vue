/**
 * 登录页面组件
 * 主要功能：
 * 1. 用户登录表单展示和验证
 * 2. 记住密码功能
 * 3. 登录状态管理
 * 4. 响应式布局适配
 */

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

// 路由实例
const router = useRouter()

// 表单相关
const formRef = ref(null) // 表单引用
const loading = ref(false) // 加载状态
const rememberMe = ref(false) // 记住密码状态

// 表单数据
const form = ref({
  username: '', // 用户名
  password: '', // 密码
  remember: false // 是否记住密码
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20个字符之间', trigger: 'blur' }
  ]
}

/**
 * 组件挂载时的初始化操作
 * 1. 读取本地存储的登录信息
 * 2. 添加键盘事件监听
 */
onMounted(() => {
  // 从 localStorage 读取保存的登录信息
  const savedUsername = localStorage.getItem('username')
  const savedPassword = localStorage.getItem('password')
  const savedRememberMe = localStorage.getItem('rememberMe')
  
  // 如果存在保存的登录信息，则自动填充
  if (savedUsername && savedPassword && savedRememberMe === 'true') {
    form.value.username = savedUsername
    form.value.password = savedPassword
    rememberMe.value = true
    form.value.remember = true
  }
  
  // 添加键盘事件监听，支持回车键登录
  window.addEventListener('keypress', handleKeyPress)
})

/**
 * 组件卸载时的清理操作
 * 移除键盘事件监听
 */
onUnmounted(() => {
  window.removeEventListener('keypress', handleKeyPress)
})

/**
 * 处理登录操作
 * 包含表单验证和登录逻辑
 */
const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    // 表单验证
    await formRef.value.validate()
    
    // 模拟登录请求
    if (form.value.username === 'admin' && form.value.password === '123456') {
      // 保存登录状态
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('username', form.value.username)
      
      // 处理记住密码
      if (form.value.remember) {
        localStorage.setItem('username', form.value.username)
        localStorage.setItem('password', form.value.password)
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('username')
        localStorage.removeItem('password')
        localStorage.removeItem('rememberMe')
      }
      
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      ElMessage.error('用户名或密码错误')
    }
  } catch (error) {
    console.error('登录失败:', error)
  }
}

/**
 * 处理键盘按键事件
 * 支持回车键触发登录
 * @param {KeyboardEvent} event - 键盘事件对象
 */
const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    handleLogin()
  }
}

/**
 * 处理忘记密码操作
 */
const handleForgotPassword = () => {
  ElMessage.info('请联系系统管理员重置密码')
}
</script>

<template>
  <!-- 登录页面主容器 -->
  <div class="login-container">
    <!-- 品牌展示区域 -->
    <div class="brand-section">
      <div class="brand-wrapper">
        <h1 class="brand-title">欢迎登录电商管理系统</h1>
        <p class="brand-subtitle">高效、便捷、安全的电商管理平台</p>
        <ul class="brand-features">
          <li>多平台数据整合</li>
          <li>智能分析与决策</li>
          <li>多渠道订单管理</li>
        </ul>
      </div>
    </div>

    <!-- 登录表单区域 -->
    <div class="login-section">
      <div class="login-wrapper">
        <h1 class="system-title">欢迎登录电商管理系统</h1>
        
        <!-- 登录表单 -->
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <!-- 用户名输入框 -->
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              prefix-icon="User"
            />
          </el-form-item>

          <!-- 密码输入框 -->
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <!-- 表单选项区域 -->
          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="rememberMe">
              <span>记住密码</span>
            </label>
            <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">忘记密码</a>
          </div>

          <!-- 登录按钮 -->
          <el-button
            type="primary"
            class="submit-btn"
            :loading="loading"
            @click="handleLogin"
          >
            立即登录
          </el-button>

          <!-- 注册链接 -->
          <p class="register-link">
            没有账户？<a href="#">联系管理员注册</a>
          </p>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 登录页面主容器样式 */
.login-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

/* 品牌展示区域样式 */
.brand-section {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  height: 600px;
}

/* 品牌内容包装器样式 */
.brand-wrapper {
  width: 500px;
  background-color: #547dc5;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 12px 0 0 12px;
  height: 100%;
}

/* 品牌标题样式 */
.brand-title {
  font-size: 2.3rem;
  font-weight: 700;
  margin-bottom: 3rem;
  line-height: 1.2;
}

/* 品牌副标题样式 */
.brand-subtitle {
  font-size: 1.5rem;
  opacity: 0.9;
  margin-bottom: 3rem;
  line-height: 1.6;
}

/* 品牌特性列表样式 */
.brand-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* 品牌特性项样式 */
.brand-features li {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  font-size: 1.4rem;
  opacity: 0.9;
}

/* 品牌特性项图标样式 */
.brand-features li::before {
  content: '✓';
  margin-right: 1.5rem;
  font-weight: bold;
}

/* 系统标题样式 */
.system-title {
  text-align: center;
  color: #2c3e50;
  font-size: 2.3rem;
  margin-bottom: 3rem;
  font-weight: 600;
  margin-top: 3rem;
}

/* 登录区域样式 */
.login-section {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 600px;
}

/* 登录表单包装器样式 */
.login-wrapper {
  background: rgba(255, 255, 255, 0.95);
  width: 500px;
  padding: 4rem;
  border-radius: 0 12px 12px 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  height: 100%;
}

/* 登录表单包装器悬停效果 */
.login-wrapper:hover {
  transform: translateY(-2px);
}

/* 登录表单样式 */
.login-form {
  margin-top: 20px;
}

/* 表单选项区域样式 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 2rem 0;
}

/* 记住密码选项样式 */
.form-options .remember-me {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #4a5568;
  font-size: 1rem;
}

/* 记住密码复选框样式 */
.form-options .remember-me input {
  width: 1.2rem;
  height: 1.2rem;
  accent-color: #3498db;
}

/* 忘记密码链接样式 */
.form-options .forgot-password {
  color: #3498db;
  text-decoration: none;
  font-size: 1rem;
}

/* 忘记密码链接悬停效果 */
.form-options .forgot-password:hover {
  text-decoration: underline;
}

/* 提交按钮样式 */
.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 1.1rem;
  font-weight: 600;
}

/* 注册链接样式 */
.register-link {
  text-align: center;
  margin-top: 2.5rem;
  color: #718096;
  font-size: 1.1rem;
}

/* 注册链接样式 */
.register-link a {
  color: #3498db;
  text-decoration: none;
}

/* 注册链接悬停效果 */
.register-link a:hover {
  text-decoration: underline;
}

/* 移动端适配样式 */
@media (max-width: 768px) {
  .login-wrapper {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 500px;
  }

  .brand-section {
    display: none;
  }

  .login-section {
    padding: 2rem;
  }
}
</style> 