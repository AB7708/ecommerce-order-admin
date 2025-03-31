<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Fold, Expand } from '@element-plus/icons-vue'

// 获取路由实例
const router = useRouter()

/**
 * 侧边栏折叠状态
 * 控制侧边栏的展开/折叠状态
 */
const isCollapsed = ref(false)

/**
 * 用户头像URL
 * 返回默认头像地址
 */
const userAvatar = computed(() => {
  return 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
})

/**
 * 用户名
 * 从本地存储获取用户信息，如果没有则返回默认值
 */
const username = computed(() => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  return userInfo.username || 'Admin'
})

/**
 * 定义组件事件
 * toggle-sidebar: 触发侧边栏折叠/展开
 */
const emit = defineEmits(['toggle-sidebar'])

/**
 * 切换侧边栏状态
 * 更新折叠状态并触发事件通知父组件
 */
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  emit('toggle-sidebar')
}

/**
 * 处理用户退出登录
 * 1. 清除本地存储的用户信息
 * 2. 显示退出成功提示
 * 3. 跳转到登录页面
 */
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('username')
  localStorage.removeItem('rememberedUsername')
  ElMessage.success('退出成功')
  router.push('/login')
}
</script>

<template>
  <!-- 顶部导航栏容器 -->
  <div class="header-container">
    <!-- 左侧区域 -->
    <div class="left">
      <div class="header-left">
        <!-- 折叠/展开按钮 -->
        <el-icon 
          class="collapse-btn" 
          @click="toggleSidebar"
          :size="32"
        >
          <component :is="isCollapsed ? 'Expand' : 'Fold'" />
        </el-icon>
      </div>
    </div>

    <!-- 右侧区域 -->
    <div class="right">
      <!-- 用户信息下拉菜单 -->
      <el-dropdown>
        <span class="user-info">
          <el-avatar :size="32" :src="userAvatar" />
          <span class="username">{{ username }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped>
/* 顶部导航栏容器样式 */
.header-container {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: fixed;
  top: 0;
  right: 0;
  left: 240px;
  z-index: 999;
  transition: left 0.3s;
}

/* 侧边栏折叠时的导航栏样式 */
.header-container.collapsed {
  left: 80px;
}

/* 左侧区域样式 */
.header-left {
  display: flex;
  align-items: center;
}

/* 折叠/展开按钮样式 */
.collapse-btn {
  font-size: 25px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

/* .collapse-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
} */

/* 用户信息区域样式 */
.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 35px;
  border-radius: 4px;
}

/* .user-info:hover {
  background-color: rgba(0, 0, 0, 0.025);
} */

/* 用户名文本样式 */
.username {
  margin-left: 8px;
  color: #666;
  font-size: 14px;
}

/* 下拉菜单项样式 */
:deep(.el-dropdown-menu__item) {
  padding: 8px 16px;
  font-size: 14px;
}

/* 下拉菜单项悬停样式 */
:deep(.el-dropdown-menu__item:hover) {
  /* background-color: rgba(24, 144, 255, 0.1); */
  color: #1890ff;
}
</style> 