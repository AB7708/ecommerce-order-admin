<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Fold, Expand } from '@element-plus/icons-vue'

const router = useRouter()
const isCollapsed = ref(false)

const userAvatar = computed(() => {
  return 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
})

const username = computed(() => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  return userInfo.username || 'Admin'
})

const emit = defineEmits(['toggle-sidebar'])

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  emit('toggle-sidebar')
}

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
  <div class="header-container">
    <div class="left">
      <div class="header-left">
        <el-icon 
          class="collapse-btn" 
          @click="toggleSidebar"
          :size="32"
        >
          <component :is="isCollapsed ? 'Expand' : 'Fold'" />
        </el-icon>
      </div>
    </div>
    <div class="right">
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

.header-container.collapsed {
  left: 80px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  font-size: 25px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

/* .collapse-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
} */

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

.username {
  margin-left: 8px;
  color: #666;
  font-size: 14px;
}

:deep(.el-dropdown-menu__item) {
  padding: 8px 16px;
  font-size: 14px;
}

:deep(.el-dropdown-menu__item:hover) {
  /* background-color: rgba(24, 144, 255, 0.1); */
  color: #1890ff;
}
</style> 