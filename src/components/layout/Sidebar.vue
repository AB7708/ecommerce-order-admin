<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { DataLine, Goods, List, Money, Promotion } from '@element-plus/icons-vue'

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<template>
  <div class="sidebar-container" :class="{ collapsed: isCollapsed }">
    <div class="logo">
      <h2 v-if="!isCollapsed">电商管理系统</h2>
      <h2 v-else>电商</h2>
    </div>
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      :router="true"
      :collapse="isCollapsed"
      background-color="#001529"
      text-color="#fff"
      active-text-color="#1890ff"
      unique-opened
    >
      <el-menu-item index="/">
        <el-icon><DataLine /></el-icon>
        <template #title>数据看板</template>
      </el-menu-item>
      <el-menu-item index="/products">
        <el-icon><Goods /></el-icon>
        <template #title>商品管理</template>
      </el-menu-item>
      <el-menu-item index="/orders">
        <el-icon><List /></el-icon>
        <template #title>订单管理</template>
      </el-menu-item>
      <el-menu-item index="/finance">
        <el-icon><Money /></el-icon>
        <template #title>财务情况</template>
      </el-menu-item>
      <el-menu-item index="/marketing">
        <el-icon><Promotion /></el-icon>
        <template #title>营销活动</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped>
/* 侧边栏容器样式 */
.sidebar-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  width: 240px;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  background-color: #001529;
}

.sidebar-container.collapsed {
  width: 80px;
}

/* Logo 样式 */
.logo {
  height: 64px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #002140;
  color: white;
  overflow: hidden;
}

.logo h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
}

/* 菜单样式 */
.sidebar-menu {
  flex: 1;
  border-right: none;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 240px;
}

/* 菜单项基础样式 */
.sidebar-menu :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  color: #fff;
  padding: 0 20px !important;
}

.sidebar-menu :deep(.el-menu-item .el-icon) {
  margin-right: 16px;
  color: #fff;
}

/* 菜单项文本样式 */
.sidebar-menu :deep(.el-menu-item span) {
  color: #fff;
  visibility: visible !important;
  opacity: 1 !important;
  display: inline-block !important;
}

/* 菜单项悬停和选中状态 */
.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
}

/* 折叠状态样式 */
.sidebar-menu.el-menu--collapse {
  width: 80px;
}

.sidebar-menu.el-menu--collapse :deep(.el-menu-item .el-icon) {
  margin-right: 0;
}

/* 折叠状态下隐藏文本 */
.sidebar-menu.el-menu--collapse :deep(.el-menu-item span) {
  display: none;
}
</style> 