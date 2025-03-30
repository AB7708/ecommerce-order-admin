<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Delete } from '@element-plus/icons-vue'
import { debounce } from 'lodash-es'

// 状态管理
const orders = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedIds = ref([])
const detailVisible = ref(false)
const currentOrder = ref(null)

// 搜索条件
const searchKey = ref('')
const filterStatus = ref('')
const searchHistory = ref([])
const showSearchHistory = ref(false)

// 模拟订单数据
const defaultOrdersList = [
  {
    id: 1,
    orderNo: 'ORD20240320001',
    customerName: '张三',
    phone: '13812345678',
    address: '北京市朝阳区三里屯SOHO 2号楼 2201',
    items: [
      { id: 1, name: 'iPhone 15 Pro', price: 7999, quantity: 1 },
      { id: 2, name: 'AirPods Pro', price: 1999, quantity: 1 }
    ],
    status: '已发货',
    createTime: '2024-03-20 10:00:00'
  },
  {
    id: 2,
    orderNo: 'ORD20240320002',
    customerName: '李四',
    phone: '13987654321',
    address: '上海市浦东新区陆家嘴环路1000号',
    items: [
      { id: 3, name: '小米智能音箱', price: 299, quantity: 2 },
      { id: 4, name: '威露士洗衣液', price: 39.9, quantity: 3 }
    ],
    status: '已发货',
    createTime: '2024-03-20 11:30:00'
  },
  {
    id: 3,
    orderNo: 'ORD20240320003',
    customerName: '王五',
    phone: '13765432109',
    address: '广州市天河区珠江新城花城大道68号',
    items: [
      { id: 5, name: '不锈钢炒锅', price: 199, quantity: 1 },
      { id: 6, name: '收纳盒', price: 29.9, quantity: 5 }
    ],
    status: '拣货中',
    createTime: '2024-03-20 14:20:00'
  },
  {
    id: 4,
    orderNo: 'ORD20240320004',
    customerName: '赵六',
    phone: '13698765432',
    address: '深圳市南山区科技园科技路1号',
    items: [
      { id: 7, name: 'Keep智能动感单车', price: 1999, quantity: 1 },
      { id: 8, name: '小米智能跳绳', price: 99, quantity: 2 }
    ],
    status: '拣货中',
    createTime: '2024-03-20 16:45:00'
  },
  {
    id: 5,
    orderNo: 'ORD20240320005',
    customerName: '钱七',
    phone: '13512345678',
    address: '成都市武侯区人民南路四段1号',
    items: [
      { id: 9, name: '迪卡侬瑜伽垫', price: 49, quantity: 2 },
      { id: 10, name: '北面冲锋衣', price: 1299, quantity: 1 }
    ],
    status: '待发货',
    createTime: '2024-03-20 18:30:00'
  },
  {
    id: 6,
    orderNo: 'ORD20240320006',
    customerName: '孙八',
    phone: '13487654321',
    address: '杭州市西湖区文三路478号',
    items: [
      { id: 11, name: '探路者登山包', price: 399, quantity: 1 },
      { id: 12, name: '牧高笛帐篷', price: 599, quantity: 1 }
    ],
    status: '待发货',
    createTime: '2024-03-20 20:15:00'
  },
  {
    id: 7,
    orderNo: 'ORD20240320007',
    customerName: '周九',
    phone: '13365432109',
    address: '武汉市洪山区珞瑜路1037号',
    items: [
      { id: 13, name: '安踏运动短裤', price: 89, quantity: 3 },
      { id: 14, name: '李宁速干T恤', price: 79, quantity: 2 }
    ],
    status: '待发货',
    createTime: '2024-03-20 21:00:00'
  },
  {
    id: 8,
    orderNo: 'ORD20240320008',
    customerName: '吴十',
    phone: '13298765432',
    address: '南京市玄武区珠江路1号',
    items: [
      { id: 15, name: '耐克运动袜', price: 39, quantity: 5 },
      { id: 16, name: '三只松鼠坚果礼盒', price: 99, quantity: 2 }
    ],
    status: '待发货',
    createTime: '2024-03-20 22:30:00'
  },
  {
    id: 9,
    orderNo: 'ORD20240320009',
    customerName: '郑十一',
    phone: '13112345678',
    address: '重庆市渝中区解放碑步行街1号',
    items: [
      { id: 17, name: '百草味肉脯', price: 29.9, quantity: 4 },
      { id: 18, name: '良品铺子薯片', price: 9.9, quantity: 10 }
    ],
    status: '待发货',
    createTime: '2024-03-20 23:15:00'
  },
  {
    id: 10,
    orderNo: 'ORD20240320010',
    customerName: '王十二',
    phone: '13087654321',
    address: '西安市碑林区南院门1号',
    items: [
      { id: 19, name: '茅台酒', price: 1499, quantity: 1 },
      { id: 20, name: '青岛啤酒', price: 6.5, quantity: 12 }
    ],
    status: '待发货',
    createTime: '2024-03-20 23:45:00'
  },
  {
    id: 11,
    orderNo: 'ORD20240319001',
    customerName: '陈一',
    phone: '13912345678',
    address: '北京市海淀区中关村科技园区',
    items: [
      { id: 21, name: '华为Mate60 Pro', price: 6999, quantity: 1 },
      { id: 22, name: '华为Watch GT4', price: 2499, quantity: 1 }
    ],
    status: '已发货',
    createTime: '2024-03-19 09:15:00'
  },
  {
    id: 12,
    orderNo: 'ORD20240319002',
    customerName: '刘二',
    phone: '13887654321',
    address: '上海市徐汇区漕河泾开发区',
    items: [
      { id: 23, name: '小米14 Ultra', price: 5999, quantity: 1 },
      { id: 24, name: '小米平板6 Pro', price: 2999, quantity: 1 }
    ],
    status: '已发货',
    createTime: '2024-03-19 10:30:00'
  },
  {
    id: 13,
    orderNo: 'ORD20240319003',
    customerName: '张三',
    phone: '13765432109',
    address: '广州市越秀区北京路步行街',
    items: [
      { id: 25, name: 'OPPO Find X7', price: 4999, quantity: 1 },
      { id: 26, name: 'OPPO Enco X3', price: 999, quantity: 1 }
    ],
    status: '已发货',
    createTime: '2024-03-19 11:45:00'
  },
  {
    id: 14,
    orderNo: 'ORD20240319004',
    customerName: '李四',
    phone: '13698765432',
    address: '深圳市福田区华强北电子市场',
    items: [
      { id: 27, name: 'vivo X100 Pro', price: 5499, quantity: 1 },
      { id: 28, name: 'vivo TWS 3', price: 799, quantity: 1 }
    ],
    status: '已发货',
    createTime: '2024-03-19 13:20:00'
  },
  {
    id: 15,
    orderNo: 'ORD20240319005',
    customerName: '王五',
    phone: '13512345678',
    address: '成都市武侯区春熙路',
    items: [
      { id: 29, name: '一加12', price: 4299, quantity: 1 },
      { id: 30, name: '一加Buds Pro 2', price: 899, quantity: 1 }
    ],
    status: '已发货',
    createTime: '2024-03-19 14:35:00'
  },
  {
    id: 16,
    orderNo: 'ORD20240319006',
    customerName: '赵六',
    phone: '13487654321',
    address: '杭州市西湖区湖滨银泰',
    items: [
      { id: 31, name: '魅族21', price: 3299, quantity: 1 },
      { id: 32, name: '魅族PANDAER耳机', price: 299, quantity: 1 }
    ],
    status: '已发货',
    createTime: '2024-03-19 15:50:00'
  },
  {
    id: 17,
    orderNo: 'ORD20240319007',
    customerName: '钱七',
    phone: '13365432109',
    address: '武汉市江汉区江汉路步行街',
    items: [
      { id: 33, name: '努比亚Z60 Ultra', price: 3999, quantity: 1 },
      { id: 34, name: '努比亚NeoAir', price: 499, quantity: 1 }
    ],
    status: '已发货',
    createTime: '2024-03-19 17:05:00'
  },
  {
    id: 18,
    orderNo: 'ORD20240319008',
    customerName: '孙八',
    phone: '13298765432',
    address: '南京市玄武区新街口',
    items: [
      { id: 35, name: 'ROG Phone 8', price: 5999, quantity: 1 },
      { id: 36, name: 'ROG Cetra II', price: 1299, quantity: 1 }
    ],
    status: '已发货',
    createTime: '2024-03-19 18:20:00'
  },
  {
    id: 19,
    orderNo: 'ORD20240319009',
    customerName: '周九',
    phone: '13112345678',
    address: '重庆市渝中区解放碑',
    items: [
      { id: 37, name: '红魔9 Pro', price: 4599, quantity: 1 },
      { id: 38, name: '红魔TWS', price: 399, quantity: 1 }
    ],
    status: '已发货',
    createTime: '2024-03-19 19:35:00'
  },
  {
    id: 20,
    orderNo: 'ORD20240319010',
    customerName: '吴十',
    phone: '13087654321',
    address: '西安市碑林区钟楼',
    items: [
      { id: 39, name: '黑鲨5 Pro', price: 3799, quantity: 1 },
      { id: 40, name: '黑鲨耳机', price: 299, quantity: 1 }
    ],
    status: '已发货',
    createTime: '2024-03-19 20:50:00'
  }
]

// 模拟物流数据
const logisticsData = {
  'ORD001': [
    { time: '2024-03-20 10:30:00', status: '订单已创建', location: '系统' },
    { time: '2024-03-20 10:35:00', status: '订单已支付', location: '系统' },
    { time: '2024-03-20 11:00:00', status: '订单已确认', location: '系统' }
  ],
  'ORD002': [
    { time: '2024-03-19 15:45:00', status: '订单已创建', location: '系统' },
    { time: '2024-03-19 15:50:00', status: '订单已支付', location: '系统' },
    { time: '2024-03-19 16:00:00', status: '订单已确认', location: '系统' },
    { time: '2024-03-19 16:30:00', status: '已发货', location: '北京市朝阳区' },
    { time: '2024-03-19 17:00:00', status: '运输中', location: '北京市朝阳区' }
  ],
  'ORD003': [
    { time: '2024-03-18 09:15:00', status: '订单已创建', location: '系统' },
    { time: '2024-03-18 09:20:00', status: '订单已支付', location: '系统' },
    { time: '2024-03-18 09:30:00', status: '订单已确认', location: '系统' },
    { time: '2024-03-18 10:00:00', status: '已发货', location: '上海市浦东新区' },
    { time: '2024-03-18 11:00:00', status: '运输中', location: '上海市浦东新区' },
    { time: '2024-03-18 14:00:00', status: '已送达', location: '上海市浦东新区' },
    { time: '2024-03-18 14:30:00', status: '已完成', location: '上海市浦东新区' }
  ]
}

// 计算订单总金额
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

// 从本地存储获取订单数据
const getLocalOrdersData = () => {
  const data = localStorage.getItem('ordersList')
  return data ? JSON.parse(data) : null
}

// 保存订单数据到本地存储
const saveOrdersData = (data) => {
  localStorage.setItem('ordersList', JSON.stringify(data))
}

// 获取订单列表
const fetchOrdersList = () => {
  loading.value = true
  try {
    // 从本地存储获取数据
    const localData = localStorage.getItem('ordersList')
    let allData = []
    
    if (localData) {
      allData = JSON.parse(localData)
    } else {
      allData = defaultOrdersList
      localStorage.setItem('ordersList', JSON.stringify(defaultOrdersList))
    }
    
    // 应用筛选条件
    let filteredData = [...allData]
    
    // 搜索关键词过滤
    if (searchKey.value) {
      const keyword = searchKey.value.toLowerCase()
      filteredData = filteredData.filter(item => 
        item.orderNo.toLowerCase().includes(keyword) ||
        item.customerName.toLowerCase().includes(keyword) ||
        item.phone.includes(keyword)
      )
    }
    
    // 状态过滤
    if (filterStatus.value !== '') {
      filteredData = filteredData.filter(item => item.status === filterStatus.value)
    }
    
    // 按创建时间降序排序
    filteredData.sort((a, b) => {
      return new Date(b.createTime) - new Date(a.createTime)
    })
    
    // 更新总数
    total.value = filteredData.length
    
    // 分页处理
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    orders.value = filteredData.slice(start, end)
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 添加分页变化处理函数
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchOrdersList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchOrdersList()
}

// 搜索处理（使用防抖）
const handleSearch = debounce(() => {
  currentPage.value = 1
  fetchOrdersList()
}, 300)

// 执行搜索（包含历史记录）
const executeSearch = () => {
  addSearchHistory()
  handleSearch()
}

// 添加搜索历史
const addSearchHistory = () => {
  if (searchKey.value) {
    const history = {
      keyword: searchKey.value,
      status: filterStatus.value,
      timestamp: Date.now()
    }
    searchHistory.value.unshift(history)
    if (searchHistory.value.length > 10) {
      searchHistory.value.pop()
    }
    localStorage.setItem('ordersSearchHistory', JSON.stringify(searchHistory.value))
  }
}

// 使用搜索历史
const useSearchHistory = (history) => {
  searchKey.value = history.keyword
  filterStatus.value = history.status
  executeSearch()
  showSearchHistory.value = false
}

// 删除搜索历史
const deleteSearchHistory = (index) => {
  searchHistory.value.splice(index, 1)
  localStorage.setItem('ordersSearchHistory', JSON.stringify(searchHistory.value))
}

// 清空搜索历史
const clearSearchHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('ordersSearchHistory')
}

// 初始化搜索历史
const initSearchHistory = () => {
  const history = localStorage.getItem('ordersSearchHistory')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

// 重置搜索条件
const resetSearch = () => {
  searchKey.value = ''
  filterStatus.value = ''
  executeSearch()
}

// 选择处理
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

// 发货处理
const handleShip = (row) => {
  ElMessageBox.confirm('确认要发货吗？', '提示').then(async () => {
    try {
      // 检查库存
      const goodsData = localStorage.getItem('goodsList')
      const goods = goodsData ? JSON.parse(goodsData) : []
      
      // 检查每个商品的库存
      for (const item of row.items) {
        const good = goods.find(g => g.name.trim() === item.name.trim())
        if (!good) {
          console.error('商品不存在:', item.name)
          ElMessage.error(`商品 ${item.name} 不存在`)
          return
        }
        if (good.stock < item.quantity) {
          console.error('库存不足:', item.name, '需要:', item.quantity, '实际:', good.stock)
          ElMessage.error(`商品 ${item.name} 库存不足，当前库存: ${good.stock}`)
          return
        }
      }
      
      const localData = localStorage.getItem('ordersList')
      let allData = localData ? JSON.parse(localData) : defaultOrdersList
      
      // 更新订单状态
      allData = allData.map(item => {
        if (item.id === row.id) {
          return { ...item, status: '拣货中' }
        }
        return item
      })
      
      // 更新库存
      const updatedGoods = goods.map(good => {
        const orderItem = row.items.find(item => item.name.trim() === good.name.trim())
        if (orderItem) {
          return { ...good, stock: good.stock - orderItem.quantity }
        }
        return good
      })
      
      // 更新物流数据
      const currentTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-')
      
      // 确保物流数据存在
      if (!logisticsData[row.id]) {
        logisticsData[row.id] = []
      }
      
      // 添加新的物流记录
      logisticsData[row.id].push({
        time: currentTime,
        status: '正在拣货',
        location: '仓库'
      })
      
      // 保存所有更新
      localStorage.setItem('ordersList', JSON.stringify(allData))
      localStorage.setItem('goodsList', JSON.stringify(updatedGoods))
      localStorage.setItem('logisticsData', JSON.stringify(logisticsData))
      
      ElMessage.success('发货成功')
      fetchOrdersList()
    } catch (error) {
      console.error('发货失败:', error)
      ElMessage.error('发货失败: ' + error.message)
    }
  })
}

// 批量发货
const batchShip = () => {
  if (!selectedIds.value.length) {
    ElMessage.warning('请选择要发货的订单')
    return
  }
  
  ElMessageBox.confirm('确认要批量发货吗？', '提示').then(async () => {
    try {
      // 检查库存
      const goodsData = localStorage.getItem('goodsList')
      const goods = goodsData ? JSON.parse(goodsData) : []
      const localData = localStorage.getItem('ordersList')
      let allData = localData ? JSON.parse(localData) : defaultOrdersList
      
      // 检查所有选中订单的库存
      for (const orderId of selectedIds.value) {
        const order = allData.find(o => o.id === orderId)
        if (order && order.status === '待发货') {
          for (const item of order.items) {
            const good = goods.find(g => g.name.trim() === item.name.trim())
            if (!good) {
              console.error('商品不存在:', item.name)
              ElMessage.error(`订单 ${order.orderNo} 中的商品 ${item.name} 不存在`)
              return
            }
            if (good.stock < item.quantity) {
              console.error('库存不足:', item.name, '需要:', item.quantity, '实际:', good.stock)
              ElMessage.error(`订单 ${order.orderNo} 中的商品 ${item.name} 库存不足，当前库存: ${good.stock}`)
              return
            }
          }
        }
      }
      
      const currentTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-')
      
      // 更新订单状态和库存
      let updatedGoods = [...goods]
      allData = allData.map(item => {
        if (selectedIds.value.includes(item.id) && item.status === '待发货') {
          // 更新库存
          item.items.forEach(orderItem => {
            const goodIndex = updatedGoods.findIndex(g => g.name.trim() === orderItem.name.trim())
            if (goodIndex !== -1) {
              updatedGoods[goodIndex] = {
                ...updatedGoods[goodIndex],
                stock: updatedGoods[goodIndex].stock - orderItem.quantity
              }
            }
          })
          
          // 确保物流数据存在
          if (!logisticsData[item.id]) {
            logisticsData[item.id] = []
          }
          
          // 添加新的物流记录
          logisticsData[item.id].push({
            time: currentTime,
            status: '正在拣货',
            location: '仓库'
          })
          
          return { ...item, status: '拣货中' }
        }
        return item
      })
      
      // 保存所有更新
      localStorage.setItem('ordersList', JSON.stringify(allData))
      localStorage.setItem('goodsList', JSON.stringify(updatedGoods))
      localStorage.setItem('logisticsData', JSON.stringify(logisticsData))
      
      ElMessage.success('批量发货成功')
      fetchOrdersList()
    } catch (error) {
      console.error('批量发货失败:', error)
      ElMessage.error('批量发货失败: ' + error.message)
    }
  })
}

// 查看订单详情
const viewDetail = (row) => {
  currentOrder.value = row
  detailVisible.value = true
}

// 关闭详情对话框
const closeDetail = () => {
  detailVisible.value = false
  currentOrder.value = null
}

// 点击外部关闭历史记录
const handleClickOutside = (event) => {
  const searchBox = document.querySelector('.search-box')
  if (searchBox && !searchBox.contains(event.target)) {
    showSearchHistory.value = false
  }
}

// 初始化
onMounted(() => {
  // 清除旧的本地存储数据，确保使用最新的默认数据
  localStorage.removeItem('ordersList')
  
  // 保存默认订单数据到本地存储
  localStorage.setItem('ordersList', JSON.stringify(defaultOrdersList))
  
  // 初始化物流数据
  const logisticsLocalData = localStorage.getItem('logisticsData')
  if (logisticsLocalData) {
    Object.assign(logisticsData, JSON.parse(logisticsLocalData))
  }
  
  // 获取订单列表
  fetchOrdersList()
  initSearchHistory()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 在 script setup 部分添加 getStatusType 函数
const getStatusType = (status) => {
  switch (status) {
    case '拣货中':
      return 'success'
    case '已发货':
      return 'warning'
    case '待发货':
      return 'danger'
    default:
      return 'info'
  }
}
</script>

<template>
  <div class="orders-manage">
    <!-- 搜索与操作区 -->
    <div class="operate-bar">
      <div class="left">
        <div class="search-box">
          <el-input
            v-model="searchKey"
            placeholder="搜索订单号/客户/手机号"
            clearable
            @clear="handleSearch"
            @keyup.enter="executeSearch"
            @focus="showSearchHistory = true"
          >
            <template #append>
              <el-button @click="executeSearch">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
          <!-- 搜索历史下拉框 -->
          <div v-if="showSearchHistory && searchHistory.length" class="search-history">
            <div class="history-header">
              <span>搜索历史</span>
              <el-button link @click="clearSearchHistory">清空</el-button>
            </div>
            <div class="history-list">
              <div
                v-for="(item, index) in searchHistory"
                :key="item.timestamp"
                class="history-item"
                @click="useSearchHistory(item)"
              >
                <el-icon><Search /></el-icon>
                <span>{{ item.keyword }}</span>
                <el-icon
                  class="delete-icon"
                  @click.stop="deleteSearchHistory(index)"
                >
                  <Delete />
                </el-icon>
              </div>
            </div>
          </div>
        </div>
        <el-select
          v-model="filterStatus"
          placeholder="订单状态"
          clearable
          @change="handleSearch"
        >
          <el-option label="全部" value="" />
          <el-option label="待发货" value="待发货" />
          <el-option label="拣货中" value="拣货中" />
          <el-option label="已发货" value="已发货" />
        </el-select>
      </div>
      <div class="right">
        <el-button type="primary" :disabled="!selectedIds.length" @click="batchShip">
          批量发货
        </el-button>
      </div>
    </div>

    <!-- 订单表格和分页容器 -->
    <div class="table-container">
      <el-table
        :data="orders"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        style="width: 100%"
        height="calc(100vh - 280px)"
        border
      >
        <el-table-column type="selection" width="55" fixed />
        <el-table-column prop="orderNo" label="订单号" width="180" fixed />
        <el-table-column label="客户信息" width="200" fixed>
          <template #default="{ row }">
            <div class="customer-info">
              <div class="name">{{ row.customerName }}</div>
              <div class="phone">{{ row.phone }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="商品信息" min-width="300">
          <template #default="{ row }">
            <div class="goods-info">
              <div v-for="(item, index) in row.items" :key="index" class="goods-item">
                <span class="name">{{ item.name }}</span>
                <span class="quantity">x{{ item.quantity }}</span>
                <span class="price">¥{{ item.price }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="total" label="总金额" width="120">
          <template #default="{ row }">
            ¥{{ calculateTotal(row.items).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === '待发货'"
              link 
              type="primary" 
              @click="handleShip(row)"
            >
              发货
            </el-button>
            <el-button link @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          :pager-count="2"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </div>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="订单详情"
      width="800px"
      :close-on-click-modal="false"
      class="order-detail-dialog"
    >
      <div v-if="currentOrder" class="order-detail">
        <!-- 订单基本信息 -->
        <div class="detail-section">
          <h3>订单信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">订单号：</span>
              <span class="value">{{ currentOrder.orderNo }}</span>
            </div>
            <div class="info-item">
              <span class="label">下单时间：</span>
              <span class="value">{{ currentOrder.createTime }}</span>
            </div>
            <div class="info-item">
              <span class="label">订单状态：</span>
              <el-tag :type="getStatusType(currentOrder.status)">
                {{ currentOrder.status }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 客户信息 -->
        <div class="detail-section">
          <h3>客户信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">客户姓名：</span>
              <span class="value">{{ currentOrder.customerName }}</span>
            </div>
            <div class="info-item">
              <span class="label">联系电话：</span>
              <span class="value">{{ currentOrder.phone }}</span>
            </div>
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="detail-section">
          <h3>商品信息</h3>
          <el-table :data="currentOrder.items" border style="width: 100%">
            <el-table-column prop="name" label="商品名称" />
            <el-table-column prop="price" label="单价" width="120">
              <template #default="{ row }">
                ¥{{ row.price }}
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="120" />
            <el-table-column label="小计" width="120">
              <template #default="{ row }">
                ¥{{ (row.price * row.quantity).toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
          <div class="total-amount">
            <span class="label">订单总金额：</span>
            <span class="value">¥{{ calculateTotal(currentOrder.items).toFixed(2) }}</span>
          </div>
        </div>

        <!-- 物流信息 -->
        <div class="detail-section">
          <h3>物流信息</h3>
          <el-timeline>
            <el-timeline-item
              v-for="(log, index) in logisticsData[currentOrder.id]"
              :key="index"
              :timestamp="log.time"
              :type="index === 0 ? 'primary' : ''"
            >
              <div class="logistics-item">
                <div class="status">{{ log.status }}</div>
                <div class="location">{{ log.location }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDetail">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.orders-manage {
  padding: 24px;
  background: var(--bg-color);
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.operate-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 12px;
  flex-shrink: 0;
}

.operate-bar .left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.search-box {
  position: relative;
  width: 300px;
  flex-shrink: 0;
}

:deep(.el-select) {
  width: 120px;
  flex-shrink: 0;
}

.operate-bar .right {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 4px;
  overflow: hidden;
}

.pagination-container {
  padding: 16px;
  background: white;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.customer-info .name {
  font-weight: 500;
}

.customer-info .phone {
  color: var(--text-secondary);
  font-size: 0.9em;
}

.goods-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.goods-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.goods-item .name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-item .quantity {
  color: var(--text-secondary);
  min-width: 40px;
}

.goods-item .price {
  color: var(--el-color-danger);
  min-width: 80px;
}

.search-history {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 4px;
  border: 1px solid #dcdfe6;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  background-color: #f5f7fa;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
  background-color: white;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 1px solid #f0f0f0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item:hover {
  background-color: #f5f7fa;
  color: var(--el-color-primary);
}

.history-item .el-icon {
  margin-right: 8px;
  color: #909399;
}

.history-item:hover .el-icon {
  color: var(--el-color-primary);
}

.history-item .delete-icon {
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.3s;
  color: #909399;
}

.history-item:hover .delete-icon {
  opacity: 1;
  color: #f56c6c;
}

.history-item span {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.el-table) {
  flex: 1;
  overflow: hidden;
  margin-bottom: 0;
  background: white;
  border-radius: 4px;
}

:deep(.el-table__body-wrapper) {
  overflow-y: auto;
  padding-bottom: 0;
}

:deep(.el-table__header-wrapper) {
  overflow: hidden;
}

:deep(.el-table__fixed) {
  height: 100% !important;
}

:deep(.el-table__fixed-right) {
  height: 100% !important;
}

:deep(.el-pagination) {
  padding: 0;
  margin: 0;
}

:deep(.el-pagination .el-pagination__total) {
  margin-right: 8px;
}

:deep(.el-pagination .el-pagination__sizes) {
  margin-right: 8px;
}

:deep(.el-pagination .el-pagination__jump) {
  margin-left: 8px;
}

:deep(.el-pagination .el-pager li) {
  min-width: 32px;
  height: 32px;
  line-height: 32px;
  margin: 0 4px;
}

:deep(.el-pagination .el-pager li.active) {
  background-color: var(--el-color-primary);
  color: white;
}

:deep(.el-pagination .el-pager li:not(.disabled):hover) {
  color: var(--el-color-primary);
}

:deep(.el-pagination .el-pager li.disabled) {
  color: #c0c4cc;
  cursor: not-allowed;
}

.order-detail-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.order-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.detail-section h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-item .label {
  color: #666;
  min-width: 80px;
}

.info-item .value {
  color: #1a1a1a;
  font-weight: 500;
}

.total-amount {
  margin-top: 16px;
  text-align: right;
  font-size: 16px;
  font-weight: 600;
}

.total-amount .label {
  color: #666;
  margin-right: 8px;
}

.total-amount .value {
  color: var(--el-color-danger);
}

.logistics-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.logistics-item .status {
  font-weight: 500;
  color: #1a1a1a;
}

.logistics-item .location {
  color: #666;
  font-size: 0.9em;
}

:deep(.el-timeline-item__node) {
  background-color: var(--el-color-primary);
}

:deep(.el-timeline-item__tail) {
  border-left-color: #e4e7ed;
}

:deep(.el-timeline-item__timestamp) {
  color: #666;
  font-size: 0.9em;
}

:deep(.el-timeline-item__content) {
  color: #1a1a1a;
}
</style> 