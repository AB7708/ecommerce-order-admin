<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, ElTable, ElTableColumn, ElSelect, ElOption, ElInput, ElButton, ElPagination } from 'element-plus'

interface Order {
  id: string
  orderNo: string
  customerName: string
  totalAmount: number
  status: number // 0: 待发货, 1: 已发货, 2: 已完成
  createTime: string
  products: {
    name: string
    quantity: number
    price: number
  }[]
}

interface StatusOption {
  value: number | string
  label: string
}

const orders = ref<Order[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedStatus = ref<number | string>('')
const currentPage = ref(1)
const pageSize = ref(10)

// 订单状态选项
const statusOptions: StatusOption[] = [
  { value: '', label: '全部状态' },
  { value: 0, label: '待发货' },
  { value: 1, label: '已发货' },
  { value: 2, label: '已完成' }
]

// 默认订单数据
const defaultOrders: Order[] = [
  {
    id: '1',
    orderNo: 'ORD202403150001',
    customerName: '张明',
    totalAmount: 9999,
    status: 0,
    createTime: '2024-03-15 10:30:00',
    products: [
      { name: 'Apple iPhone 15 Pro Max 256GB 钛金属', quantity: 1, price: 9999 }
    ]
  },
  {
    id: '2',
    orderNo: 'ORD202403150002',
    customerName: '李华',
    totalAmount: 12999,
    status: 1,
    createTime: '2024-03-15 11:15:00',
    products: [
      { name: 'Apple MacBook Pro 16英寸 M3 Max 32GB 1TB', quantity: 1, price: 12999 }
    ]
  },
  {
    id: '3',
    orderNo: 'ORD202403150003',
    customerName: '王芳',
    totalAmount: 1999,
    status: 2,
    createTime: '2024-03-15 14:20:00',
    products: [
      { name: 'Apple AirPods Pro 2代 主动降噪', quantity: 1, price: 1999 }
    ]
  },
  {
    id: '4',
    orderNo: 'ORD202403150004',
    customerName: '赵静',
    totalAmount: 7999,
    status: 0,
    createTime: '2024-03-15 15:30:00',
    products: [
      { name: 'Apple iPad Pro 12.9英寸 M2 256GB', quantity: 1, price: 7999 }
    ]
  },
  {
    id: '5',
    orderNo: 'ORD202403150005',
    customerName: '钱伟',
    totalAmount: 5999,
    status: 1,
    createTime: '2024-03-15 16:45:00',
    products: [
      { name: 'Apple Watch Ultra 2 49mm', quantity: 1, price: 5999 }
    ]
  },
  {
    id: '6',
    orderNo: 'ORD202403150006',
    customerName: '孙丽',
    totalAmount: 1499,
    status: 2,
    createTime: '2024-03-15 17:20:00',
    products: [
      { name: 'Apple Pencil 2代', quantity: 1, price: 1499 }
    ]
  },
  {
    id: '7',
    orderNo: 'ORD202403150007',
    customerName: '周强',
    totalAmount: 2999,
    status: 0,
    createTime: '2024-03-15 18:10:00',
    products: [
      { name: 'Apple HomePod mini', quantity: 2, price: 1499 }
    ]
  },
  {
    id: '8',
    orderNo: 'ORD202403150008',
    customerName: '吴婷',
    totalAmount: 8999,
    status: 1,
    createTime: '2024-03-15 19:30:00',
    products: [
      { name: 'Apple Mac mini M2 16GB 512GB', quantity: 1, price: 8999 }
    ]
  },
  {
    id: '9',
    orderNo: 'ORD202403150009',
    customerName: '郑阳',
    totalAmount: 3999,
    status: 2,
    createTime: '2024-03-15 20:15:00',
    products: [
      { name: 'Apple Studio Display', quantity: 1, price: 3999 }
    ]
  },
  {
    id: '10',
    orderNo: 'ORD202403150010',
    customerName: '王磊',
    totalAmount: 2499,
    status: 0,
    createTime: '2024-03-15 21:00:00',
    products: [
      { name: 'Apple Magic Keyboard', quantity: 1, price: 2499 }
    ]
  },
  {
    id: '11',
    orderNo: 'ORD202403150011',
    customerName: '李娜',
    totalAmount: 999,
    status: 1,
    createTime: '2024-03-15 22:30:00',
    products: [
      { name: 'Apple Magic Mouse', quantity: 1, price: 999 }
    ]
  },
  {
    id: '12',
    orderNo: 'ORD202403150012',
    customerName: '张伟',
    totalAmount: 1999,
    status: 2,
    createTime: '2024-03-15 23:15:00',
    products: [
      { name: 'Apple AirTag 4件装', quantity: 1, price: 1999 }
    ]
  },
  {
    id: '13',
    orderNo: 'ORD202403160001',
    customerName: '刘洋',
    totalAmount: 12999,
    status: 0,
    createTime: '2024-03-16 09:30:00',
    products: [
      { name: 'Apple MacBook Air 15英寸 M2 16GB 512GB', quantity: 1, price: 12999 }
    ]
  },
  {
    id: '14',
    orderNo: 'ORD202403160002',
    customerName: '陈静',
    totalAmount: 7999,
    status: 1,
    createTime: '2024-03-16 10:45:00',
    products: [
      { name: 'Apple iPad Air 10.9英寸 M1 256GB', quantity: 1, price: 7999 }
    ]
  },
  {
    id: '15',
    orderNo: 'ORD202403160003',
    customerName: '杨帆',
    totalAmount: 5999,
    status: 2,
    createTime: '2024-03-16 11:20:00',
    products: [
      { name: 'Apple Watch Series 9 45mm', quantity: 1, price: 5999 }
    ]
  },
  {
    id: '16',
    orderNo: 'ORD202403160004',
    customerName: '黄晓',
    totalAmount: 1499,
    status: 0,
    createTime: '2024-03-16 13:30:00',
    products: [
      { name: 'Apple Pencil 2代', quantity: 1, price: 1499 }
    ]
  },
  {
    id: '17',
    orderNo: 'ORD202403160005',
    customerName: '赵琳',
    totalAmount: 2999,
    status: 1,
    createTime: '2024-03-16 14:45:00',
    products: [
      { name: 'Apple HomePod mini', quantity: 2, price: 1499 }
    ]
  },
  {
    id: '18',
    orderNo: 'ORD202403160006',
    customerName: '周杰',
    totalAmount: 8999,
    status: 2,
    createTime: '2024-03-16 15:20:00',
    products: [
      { name: 'Apple Mac mini M2 16GB 512GB', quantity: 1, price: 8999 }
    ]
  },
  {
    id: '19',
    orderNo: 'ORD202403160007',
    customerName: '吴佳',
    totalAmount: 3999,
    status: 0,
    createTime: '2024-03-16 16:30:00',
    products: [
      { name: 'Apple Studio Display', quantity: 1, price: 3999 }
    ]
  },
  {
    id: '20',
    orderNo: 'ORD202403160008',
    customerName: '郑浩',
    totalAmount: 2499,
    status: 1,
    createTime: '2024-03-16 17:45:00',
    products: [
      { name: 'Apple Magic Keyboard', quantity: 1, price: 2499 }
    ]
  },
  {
    id: '21',
    orderNo: 'ORD202403160009',
    customerName: '王琳',
    totalAmount: 999,
    status: 2,
    createTime: '2024-03-16 18:20:00',
    products: [
      { name: 'Apple Magic Mouse', quantity: 1, price: 999 }
    ]
  },
  {
    id: '22',
    orderNo: 'ORD202403160010',
    customerName: '李强',
    totalAmount: 1999,
    status: 0,
    createTime: '2024-03-16 19:30:00',
    products: [
      { name: 'Apple AirTag 4件装', quantity: 1, price: 1999 }
    ]
  },
  {
    id: '23',
    orderNo: 'ORD202403160011',
    customerName: '张婷',
    totalAmount: 12999,
    status: 1,
    createTime: '2024-03-16 20:45:00',
    products: [
      { name: 'Apple MacBook Air 15英寸 M2 16GB 512GB', quantity: 1, price: 12999 }
    ]
  },
  {
    id: '24',
    orderNo: 'ORD202403160012',
    customerName: '刘芳',
    totalAmount: 7999,
    status: 2,
    createTime: '2024-03-16 21:20:00',
    products: [
      { name: 'Apple iPad Air 10.9英寸 M1 256GB', quantity: 1, price: 7999 }
    ]
  },
  {
    id: '25',
    orderNo: 'ORD202403160013',
    customerName: '陈伟',
    totalAmount: 5999,
    status: 0,
    createTime: '2024-03-16 22:30:00',
    products: [
      { name: 'Apple Watch Series 9 45mm', quantity: 1, price: 5999 }
    ]
  },
  {
    id: '26',
    orderNo: 'ORD202403160014',
    customerName: '杨静',
    totalAmount: 1499,
    status: 1,
    createTime: '2024-03-16 23:45:00',
    products: [
      { name: 'Apple Pencil 2代', quantity: 1, price: 1499 }
    ]
  },
  {
    id: '27',
    orderNo: 'ORD202403170001',
    customerName: '黄强',
    totalAmount: 2999,
    status: 2,
    createTime: '2024-03-17 09:20:00',
    products: [
      { name: 'Apple HomePod mini', quantity: 2, price: 1499 }
    ]
  },
  {
    id: '28',
    orderNo: 'ORD202403170002',
    customerName: '赵婷',
    totalAmount: 8999,
    status: 0,
    createTime: '2024-03-17 10:30:00',
    products: [
      { name: 'Apple Mac mini M2 16GB 512GB', quantity: 1, price: 8999 }
    ]
  },
  {
    id: '29',
    orderNo: 'ORD202403170003',
    customerName: '周芳',
    totalAmount: 3999,
    status: 1,
    createTime: '2024-03-17 11:45:00',
    products: [
      { name: 'Apple Studio Display', quantity: 1, price: 3999 }
    ]
  },
  {
    id: '30',
    orderNo: 'ORD202403170004',
    customerName: '吴伟',
    totalAmount: 2499,
    status: 2,
    createTime: '2024-03-17 12:20:00',
    products: [
      { name: 'Apple Magic Keyboard', quantity: 1, price: 2499 }
    ]
  }
]

// 获取订单列表数据
const fetchOrders = async () => {
  loading.value = true
  try {
    // 清除本地存储，确保使用新的默认数据
    localStorage.removeItem('ordersList')
    
    // 从本地存储获取数据
    const localData = localStorage.getItem('ordersList')
    if (localData) {
      // 如果本地存储有数据，检查是否需要更新
      const localOrders = JSON.parse(localData)
      // 确保所有订单的 totalAmount 是数字类型
      const validatedOrders = localOrders.map((order: Order) => ({
        ...order,
        totalAmount: Number(order.totalAmount) || 0
      }))
      const localOrderIds = validatedOrders.map((o: Order) => o.id)
      
      // 如果本地数据中缺少默认数据中的某些订单，则合并数据
      const missingOrders = defaultOrders.filter(o => !localOrderIds.includes(o.id))
      if (missingOrders.length > 0) {
        const updatedOrders = [...validatedOrders, ...missingOrders]
        localStorage.setItem('ordersList', JSON.stringify(updatedOrders))
        orders.value = updatedOrders
      } else {
        orders.value = validatedOrders
      }
    } else {
      // 如果没有本地数据，使用默认数据
      orders.value = defaultOrders
      localStorage.setItem('ordersList', JSON.stringify(defaultOrders))
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
    // 如果出错，使用默认数据
    orders.value = defaultOrders
  } finally {
    loading.value = false
  }
}

// 更新订单状态
const updateOrderStatus = async (order: Order, newStatus: number) => {
  try {
    const statusText = ['待发货', '已发货', '已完成'][newStatus]
    await ElMessageBox.confirm(`确认将订单状态更新为"${statusText}"吗？`, '提示', {
      type: 'warning'
    })
    
    // 从本地存储获取数据
    const localData = localStorage.getItem('ordersList')
    if (localData) {
      const ordersList = JSON.parse(localData)
      const updatedList = ordersList.map((o: Order) => {
        if (o.id === order.id) {
          return { ...o, status: newStatus }
        }
        return o
      })
      localStorage.setItem('ordersList', JSON.stringify(updatedList))
      orders.value = updatedList
      ElMessage.success('订单状态更新成功')
    }
  } catch (error) {
    console.error('更新订单状态失败:', error)
  }
}

// 过滤后的订单列表
const filteredOrders = computed(() => {
  let result = [...orders.value]
  
  // 按状态过滤
  if (selectedStatus.value !== '') {
    result = result.filter(order => order.status === selectedStatus.value)
  }
  
  // 按搜索关键词过滤
  if (searchQuery.value) {
    const keyword = searchQuery.value.toLowerCase()
    result = result.filter(order => 
      order.orderNo.toLowerCase().includes(keyword) ||
      order.customerName.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

// 分页后的订单列表
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredOrders.value.slice(start, end)
})

// 删除订单
const handleDelete = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确认要删除该订单吗？', '提示', {
      type: 'warning'
    })
    
    // 从本地存储获取数据
    const localData = localStorage.getItem('ordersList')
    if (localData) {
      const ordersList = JSON.parse(localData)
      const updatedList = ordersList.filter((o: Order) => o.id !== order.id)
      localStorage.setItem('ordersList', JSON.stringify(updatedList))
      orders.value = updatedList
      ElMessage.success('删除成功')
    }
  } catch (error) {
    console.error('删除订单失败:', error)
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <div class="orders-container">
    <h2>订单管理</h2>
    
    <!-- 操作栏 -->
    <div class="operations">
      <el-select
        v-model="selectedStatus"
        placeholder="订单状态"
        style="width: 120px;"
        clearable
      >
        <el-option
          v-for="option in statusOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
      <el-input
        v-model="searchQuery"
        placeholder="搜索订单号/客户名称"
        style="width: 200px; margin-left: 16px;"
        clearable
      />
    </div>
    
    <!-- 订单列表 -->
    <el-table
      v-loading="loading"
      :data="paginatedOrders"
      style="width: 100%; margin-top: 20px;"
    >
      <el-table-column prop="orderNo" label="订单号" width="180" />
      <el-table-column prop="customerName" label="客户名称" width="120" />
      <el-table-column label="商品信息">
        <template #default="{ row }">
          <div v-for="(product, index) in row.products" :key="index">
            {{ product.name }} × {{ product.quantity }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="totalAmount" label="总金额" width="120">
        <template #default="{ row }">
          ¥{{ typeof row.totalAmount === 'number' ? row.totalAmount.toFixed(2) : '0.00' }}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-select
            v-model="row.status"
            @change="(val) => updateOrderStatus(row, val)"
            style="width: 100px;"
          >
            <el-option :value="0" label="待发货" />
            <el-option :value="1" label="已发货" />
            <el-option :value="2" label="已完成" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button 
            size="small" 
            type="danger" 
            @click="handleDelete(row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredOrders.length"
        layout="prev, pager, next"
        :pager-count="5"
      />
    </div>
  </div>
</template>

<style scoped>
.orders-container {
  padding: 20px;
}

.operations {
  display: flex;
  align-items: center;
  margin-top: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>