<script setup>
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'

/**
 * 侧边栏折叠状态
 * 控制整个布局的侧边栏展开/折叠状态
 */
const isCollapsed = ref(false)

/**
 * 切换侧边栏状态
 * 更新折叠状态，影响整体布局
 */
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <!-- 后台管理系统布局容器 -->
  <div class="admin-layout">
    <!-- 侧边栏组件 -->
    <Sidebar :is-collapsed="isCollapsed" />
    
    <!-- 主要内容区域 -->
    <div class="main-content" :class="{ collapsed: isCollapsed }">
      <!-- 顶部导航栏组件 -->
      <Header @toggle-sidebar="toggleSidebar" />
      
      <!-- 页面内容容器 -->
      <div class="page-container">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 后台管理系统布局容器样式 */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f0f2f5;
  overflow-x: hidden;
}

/* 主要内容区域样式 */
.main-content {
  flex: 1;
  margin-left: 240px;  /* 默认侧边栏宽度 */
  transition: margin-left 0.3s;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  z-index: 1;
  width: calc(100% - 240px);
  overflow-x: hidden;
}

/* 侧边栏折叠时的主要内容区域样式 */
.main-content.collapsed {
  margin-left: 80px;  /* 折叠时侧边栏宽度 */
  width: calc(100% - 80px);
}

/* 页面内容容器样式 */
.page-container {
  flex: 1;
  padding: 24px;
  margin-top: 64px;  /* 顶部导航栏高度 */
  overflow-y: auto;
  position: relative;
  z-index: 1;
  width: 100%;
  box-sizing: border-box;
  background-color: #f0f2f5;
  min-height: calc(100vh - 64px);  /* 减去顶部导航栏高度 */
}
</style> 