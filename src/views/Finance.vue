<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { formatCurrency } from '../utils/format'

/**
 * 财务数据状态管理
 * 包含总收入、订单数、平均订单金额等核心指标
 */
const financeData = ref({
  totalRevenue: 0,      // 总收入
  totalOrders: 0,       // 总订单数
  averageOrderValue: 0, // 平均订单金额
  pendingRevenue: 0,    // 待发货收入
  shippedRevenue: 0,    // 已发货收入
  pickingRevenue: 0     // 拣货中收入
})

/**
 * 计算财务指标
 * 从本地存储获取订单数据并计算各项财务指标
 */
const calculateFinanceMetrics = () => {
  try {
    // 从本地存储获取订单数据
    const ordersData = localStorage.getItem('ordersList')
    if (!ordersData) return

    const orders = JSON.parse(ordersData)
    
    // 计算各项指标
    const metrics = orders.reduce((acc, order) => {
      // 计算订单总金额
      const orderTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      
      acc.totalRevenue += orderTotal
      acc.totalOrders += 1
      
      // 根据订单状态分类收入
      switch (order.status) {
        case '待发货':
          acc.pendingRevenue += orderTotal
          break
        case '已发货':
          acc.shippedRevenue += orderTotal
          break
        case '拣货中':
          acc.pickingRevenue += orderTotal
          break
      }
      
      return acc
    }, {
      totalRevenue: 0,
      totalOrders: 0,
      pendingRevenue: 0,
      shippedRevenue: 0,
      pickingRevenue: 0
    })
    
    // 计算平均订单金额
    metrics.averageOrderValue = metrics.totalOrders > 0 
      ? metrics.totalRevenue / metrics.totalOrders 
      : 0
    
    // 更新财务数据
    financeData.value = metrics
  } catch (error) {
    console.error('计算财务指标失败:', error)
  }
}

// MutationObserver 实例
let observer = null

/**
 * 监听订单数据变化
 * 使用 MutationObserver 监听页面变化，实时更新财务数据
 */
const observeOrdersData = () => {
  // 先清理之前的 observer
  if (observer) {
    observer.disconnect()
  }

  // 创建新的 observer
  observer = new MutationObserver(() => {
    calculateFinanceMetrics()
  })
  
  // 限制观察范围，只观察特定元素
  const targetNode = document.querySelector('.finance-page')
  if (targetNode) {
    observer.observe(targetNode, {
      childList: true,
      subtree: true
    })
  }
  
  return observer
}

/**
 * 组件挂载时的初始化操作
 * 1. 计算初始财务指标
 * 2. 设置数据变化监听
 */
onMounted(() => {
  calculateFinanceMetrics()
  observer = observeOrdersData()
})

/**
 * 组件卸载时的清理操作
 * 断开 MutationObserver 连接
 */
onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<template>
  <!-- 财务页面主容器 -->
  <div class="finance-page">
    <h1 class="page-title">财务情况</h1>
    
    <!-- 财务概览卡片区域 -->
    <div class="finance-cards">
      <!-- 总收入卡片 -->
      <div class="finance-card">
        <div class="card-icon">💰</div>
        <div class="card-content">
          <div class="card-title">总收入</div>
          <div class="card-value">{{ formatCurrency(financeData.totalRevenue) }}</div>
        </div>
      </div>
      
      <!-- 总订单数卡片 -->
      <div class="finance-card">
        <div class="card-icon">📦</div>
        <div class="card-content">
          <div class="card-title">总订单数</div>
          <div class="card-value">{{ financeData.totalOrders }}</div>
        </div>
      </div>
      
      <!-- 平均订单金额卡片 -->
      <div class="finance-card">
        <div class="card-icon">📊</div>
        <div class="card-content">
          <div class="card-title">平均订单金额</div>
          <div class="card-value">{{ formatCurrency(financeData.averageOrderValue) }}</div>
        </div>
      </div>
    </div>
    
    <!-- 收入分布区域 -->
    <div class="revenue-distribution">
      <h2>收入分布</h2>
      <div class="distribution-cards">
        <!-- 待发货收入卡片 -->
        <div class="distribution-card pending">
          <div class="card-title">待发货收入</div>
          <div class="card-value">{{ formatCurrency(financeData.pendingRevenue) }}</div>
        </div>
        
        <!-- 拣货中收入卡片 -->
        <div class="distribution-card picking">
          <div class="card-title">拣货中收入</div>
          <div class="card-value">{{ formatCurrency(financeData.pickingRevenue) }}</div>
        </div>
        
        <!-- 已发货收入卡片 -->
        <div class="distribution-card shipped">
          <div class="card-title">已发货收入</div>
          <div class="card-value">{{ formatCurrency(financeData.shippedRevenue) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 财务页面主容器样式 */
.finance-page {
  padding: 24px;
  background-color: #f5f7fa;
  height: 100%;
  overflow-y: auto;
}

/* 页面标题样式 */
.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 24px;
}

/* 财务卡片网格布局 */
.finance-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

/* 财务卡片样式 */
.finance-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
}

/* 财务卡片悬停效果 */
.finance-card:hover {
  transform: translateY(-2px);
}

/* 卡片图标样式 */
.card-icon {
  font-size: 32px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f9ff;
  border-radius: 12px;
}

/* 卡片内容区域样式 */
.card-content {
  flex: 1;
}

/* 卡片标题样式 */
.card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

/* 卡片数值样式 */
.card-value {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

/* 收入分布区域样式 */
.revenue-distribution {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* 收入分布标题样式 */
.revenue-distribution h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 24px;
}

/* 分布卡片网格布局 */
.distribution-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

/* 分布卡片基础样式 */
.distribution-card {
  padding: 20px;
  border-radius: 8px;
  background-color: #f8fafc;
}

/* 待发货收入卡片样式 */
.distribution-card.pending {
  border-left: 4px solid #f59e0b;
}

/* 拣货中收入卡片样式 */
.distribution-card.picking {
  border-left: 4px solid #10b981;
}

/* 已发货收入卡片样式 */
.distribution-card.shipped {
  border-left: 4px solid #3b82f6;
}

/* 分布卡片标题样式 */
.distribution-card .card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

/* 分布卡片数值样式 */
.distribution-card .card-value {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

/* 移动端适配样式 */
@media (max-width: 768px) {
  .finance-page {
    padding: 16px;
  }
  
  .finance-cards {
    grid-template-columns: 1fr;
  }
  
  .distribution-cards {
    grid-template-columns: 1fr;
  }
}
</style> 