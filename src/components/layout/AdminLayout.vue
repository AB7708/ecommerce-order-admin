<script setup>
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'

const isCollapsed = ref(false)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <div class="admin-layout">
    <Sidebar :is-collapsed="isCollapsed" />
    <div class="main-content" :class="{ collapsed: isCollapsed }">
      <Header @toggle-sidebar="toggleSidebar" />
      <div class="page-container">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f0f2f5;
  overflow-x: hidden;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  transition: margin-left 0.3s;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  z-index: 1;
  width: calc(100% - 240px);
  overflow-x: hidden;
}

.main-content.collapsed {
  margin-left: 80px;
  width: calc(100% - 80px);
}

.page-container {
  flex: 1;
  padding: 24px;
  margin-top: 64px;
  overflow-y: auto;
  position: relative;
  z-index: 1;
  width: 100%;
  box-sizing: border-box;
  background-color: #f0f2f5;
  min-height: calc(100vh - 64px);
}
</style> 