<template>
  <router-view />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import AdminLayout from './components/layout/AdminLayout.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const isAuthenticated = computed(() => {
  return !!authStore.token
})

// 检查认证状态
const checkAuth = async () => {
  if (authStore.token) {
    const response = await authStore.validateSession()
    if (response.code !== 200 || !response.data.valid) {
      authStore.logoutUser()
      router.push('/login')
    }
  } else if (route.path !== '/login') {
    router.push('/login')
  }
}

// 初始化时检查认证状态
checkAuth()
</script>

<style>
:root {
  --primary-color: #1890ff;
  --text-color: #333;
  --text-secondary: #666;
  --bg-color: #f5f7fa;
  --border-color: #e4e7ed;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
  background-color: var(--bg-color);
}

#app {
  min-height: 100vh;
}

/* ===== 全局重置与基础设置 ===== */
html {
  height: 100%;
  /* 禁用文本选中提升操作感 */
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

body {
  height: 100%;
  width: 100vw;
  min-width: 1280px;  /* 适配主流电脑分辨率 */
  min-height: 720px;
  line-height: 1.5;
  overflow-x: hidden;  /* 只禁止水平滚动 */
}

#app {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #fff;
}

/* 确保 router-view 填满整个容器 */
#app > * {
  flex: 1;
  width: 100%;
  height: 100%;
  position: relative;
}

/* ===== 路由视图容器 ===== */
.router-view-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f5f6f7;
}

/* ===== 内容区域滚动容器 ===== */
.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;  /* 仅内容区滚动 */
  position: relative;
}

/* ===== 适配Element-Plus等UI框架 ===== */
/* 统一表格最大高度 */
.el-table__body-wrapper {
  max-height: calc(100vh - 240px) !important;
}

/* 表单容器规范 */
.form-container {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

/* ===== 滚动条美化 ===== */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* ===== 文本溢出处理 ===== */
.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== 响应式布局断点 ===== */
@media screen and (max-width: 1440px) {
  body {
    min-width: 1024px;
  }
}

@media screen and (max-width: 1024px) {
  body {
    min-width: 768px;
  }
}

/* ===== 动画过渡 ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ===== 通用工具类 ===== */
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-start {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.flex-end {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.app-container {
  height: 100vh;
  width: 100vw;
}

.main-layout {
  display: flex;
  height: 100vh;
  width: 100%;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.3s;
}

.sidebar {
  width: 240px;
  background-color: #001529;
  color: white;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
}

.header {
  height: 64px;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  right: 0;
  left: 240px;
  z-index: 999;
}

.content {
  flex: 1;
  padding: 24px;
  margin-top: 64px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 64px);
  overflow-y: auto;  /* 允许内容区域垂直滚动 */
}

/* 当侧边栏折叠时的样式 */
.main-content.collapsed {
  margin-left: 80px;
}
</style>
