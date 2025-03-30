import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Products from '../views/Products.vue'
import Orders from '../views/Orders.vue'
import Finance from '../views/Finance.vue'
import Marketing from '../views/Marketing.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/products',
    name: 'Products',
    component: Products,
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: { requiresAuth: true }
  },
  {
    path: '/finance',
    name: 'Finance',
    component: Finance,
    meta: { requiresAuth: true }
  },
  {
    path: '/marketing',
    name: 'Marketing',
    component: Marketing,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    // 如果已登录且试图访问登录页，重定向到首页
    next('/')
  } else {
    next()
  }
})

export default router 