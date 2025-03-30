<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { formatCurrency } from '../utils/format'

// 财务数据
const financeData = ref({
  totalRevenue: 0,      // 总收入
  totalOrders: 0,       // 总订单数
  averageOrderValue: 0, // 平均订单金额
  pendingRevenue: 0,    // 待发货收入
  shippedRevenue: 0,    // 已发货收入
  pickingRevenue: 0     // 拣货中收入
})

// 计算财务指标
const calculateFinanceMetrics = () => {
  try {
    // 从本地存储获取订单数据
    const ordersData = localStorage.getItem('ordersList')
    if (!ordersData) return

    const orders = JSON.parse(ordersData)
    
    // 计算各项指标
    const metrics = orders.reduce((acc, order) => {
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

// 修改 MutationObserver 的使用方式
let observer = null

// 监听订单数据变化
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

onMounted(() => {
  calculateFinanceMetrics()
  observer = observeOrdersData()
})

// 确保在组件卸载时清理 observer
onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<template>
  <div class="finance-page">
    <h1 class="page-title">财务情况</h1>
    
    <!-- 财务概览卡片 -->
    <div class="finance-cards">
      <div class="finance-card">
        <div class="card-icon">💰</div>
        <div class="card-content">
          <div class="card-title">总收入</div>
          <div class="card-value">{{ formatCurrency(financeData.totalRevenue) }}</div>
        </div>
      </div>
      
      <div class="finance-card">
        <div class="card-icon">📦</div>
        <div class="card-content">
          <div class="card-title">总订单数</div>
          <div class="card-value">{{ financeData.totalOrders }}</div>
        </div>
      </div>
      
      <div class="finance-card">
        <div class="card-icon">📊</div>
        <div class="card-content">
          <div class="card-title">平均订单金额</div>
          <div class="card-value">{{ formatCurrency(financeData.averageOrderValue) }}</div>
        </div>
      </div>
    </div>
    
    <!-- 收入分布 -->
    <div class="revenue-distribution">
      <h2>收入分布</h2>
      <div class="distribution-cards">
        <div class="distribution-card pending">
          <div class="card-title">待发货收入</div>
          <div class="card-value">{{ formatCurrency(financeData.pendingRevenue) }}</div>
        </div>
        
        <div class="distribution-card picking">
          <div class="card-title">拣货中收入</div>
          <div class="card-value">{{ formatCurrency(financeData.pickingRevenue) }}</div>
        </div>
        
        <div class="distribution-card shipped">
          <div class="card-title">已发货收入</div>
          <div class="card-value">{{ formatCurrency(financeData.shippedRevenue) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.finance-page {
  padding: 24px;
  background-color: #f5f7fa;
  height: 100%;
  overflow-y: auto;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 24px;
}

.finance-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

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

.finance-card:hover {
  transform: translateY(-2px);
}

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

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

.revenue-distribution {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.revenue-distribution h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 24px;
}

.distribution-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.distribution-card {
  padding: 20px;
  border-radius: 8px;
  background-color: #f8fafc;
}

.distribution-card.pending {
  border-left: 4px solid #f59e0b;
}

.distribution-card.picking {
  border-left: 4px solid #10b981;
}

.distribution-card.shipped {
  border-left: 4px solid #3b82f6;
}

.distribution-card .card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.distribution-card .card-value {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

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