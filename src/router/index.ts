import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: () => import('@/components/layout/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue')
        },
        {
          path: '/products',
          name: 'Products',
          component: () => import('@/views/Products.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/orders',
          name: 'Orders',
          component: () => import('@/views/Orders.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/finance',
          name: 'Finance',
          component: () => import('@/views/Finance.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/marketing',
          name: 'Marketing',
          component: () => import('@/views/Marketing.vue'),
          meta: { requiresAuth: true }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth) {
    const response = await authStore.checkSession()
    if (!response.data.valid) {
      next({ name: 'Login' })
      return
    }
  }
  
  next()
})

export default router 