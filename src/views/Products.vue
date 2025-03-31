<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Delete } from '@element-plus/icons-vue'
import GoodsEditor from '../components/goods/GoodsEditor.vue'
import { formatCurrency } from '../utils/format'
import { debounce } from 'lodash-es'

// 状态管理
const goodsList = ref([]) // 商品列表数据
const loading = ref(false) // 加载状态
const currentPage = ref(1) // 当前页码
const pageSize = ref(9) // 每页显示数量
const total = ref(0) // 总数据量
const selectedIds = ref([]) // 选中的商品ID列表
const showEditor = ref(false) // 是否显示编辑弹窗
const currentGoods = ref(null) // 当前编辑的商品数据

// 搜索条件
const searchKey = ref('') // 搜索关键词
const selectedCategory = ref([]) // 选中的分类
const filterStatus = ref('') // 商品状态筛选
const searchHistory = ref([]) // 搜索历史记录
const showSearchHistory = ref(false) // 是否显示搜索历史

// 商品分类数据配置
const categories = [
  {
    value: '',
    label: '全部',
    leaf: true
  },
  {
    value: '1',
    label: '智能设备',
    children: [
      { value: '1-1', label: '智能手机', leaf: true },
      { value: '1-2', label: '智能音箱', leaf: true },
      { value: '1-3', label: '蓝牙耳机', leaf: true }
    ]
  },
  {
    value: '2',
    label: '日用百货',
    children: [
      { value: '2-1', label: '清洁用品', leaf: true },
      { value: '2-2', label: '厨房用品', leaf: true },
      { value: '2-3', label: '家居收纳', leaf: true }
    ]
  },
  {
    value: '3',
    label: '运动户外',
    children: [
      { value: '3-1', label: '健身器材', leaf: true },
      { value: '3-2', label: '户外装备', leaf: true },
      { value: '3-3', label: '运动服饰', leaf: true }
    ]
  },
  {
    value: '4',
    label: '食品饮料',
    children: [
      { value: '4-1', label: '休闲零食', leaf: true },
      { value: '4-2', label: '酒水饮品', leaf: true },
      { value: '4-3', label: '粮油调味', leaf: true }
    ]
  },
  {
    value: '5',
    label: '美妆个护',
    children: [
      { value: '5-1', label: '护肤彩妆', leaf: true },
      { value: '5-2', label: '洗护用品', leaf: true },
      { value: '5-3', label: '香水香氛', leaf: true }
    ]
  }
]

// 默认商品数据列表
const defaultGoodsList = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    sku: 'SM-001-IP15P',
    thumb: 'https://example.com/iphone.jpg',
    category: '智能设备/智能手机',
    price: 7999,
    stock: 100,
    status: 1
  },
  {
    id: 2,
    name: '小米智能音箱',
    sku: 'SP-001-MI',
    thumb: 'https://example.com/speaker.jpg',
    category: '智能设备/智能音箱',
    price: 299,
    stock: 200,
    status: 1
  },
  {
    id: 3,
    name: 'AirPods Pro',
    sku: 'HP-001-APP',
    thumb: 'https://example.com/airpods.jpg',
    category: '智能设备/蓝牙耳机',
    price: 1999,
    stock: 150,
    status: 1
  },
  {
    id: 4,
    name: '威露士洗衣液',
    sku: 'CL-001-WLS',
    thumb: 'https://example.com/detergent.jpg',
    category: '日用百货/清洁用品',
    price: 39.9,
    stock: 300,
    status: 1
  },
  {
    id: 5,
    name: '不锈钢炒锅',
    sku: 'KT-001-PAN',
    thumb: 'https://example.com/pan.jpg',
    category: '日用百货/厨房用品',
    price: 199,
    stock: 100,
    status: 1
  },
  {
    id: 6,
    name: '收纳盒',
    sku: 'ST-001-BOX',
    thumb: 'https://example.com/box.jpg',
    category: '日用百货/家居收纳',
    price: 29.9,
    stock: 500,
    status: 1
  },
  {
    id: 7,
    name: 'Keep智能动感单车',
    sku: 'FT-001-KEEP',
    thumb: 'https://example.com/bike.jpg',
    category: '运动户外/健身器材',
    price: 1999,
    stock: 50,
    status: 1
  },
  {
    id: 8,
    name: '小米智能跳绳',
    sku: 'FT-002-MI',
    thumb: 'https://example.com/rope.jpg',
    category: '运动户外/健身器材',
    price: 99,
    stock: 200,
    status: 1
  },
  {
    id: 9,
    name: '迪卡侬瑜伽垫',
    sku: 'FT-003-DEC',
    thumb: 'https://example.com/yoga.jpg',
    category: '运动户外/健身器材',
    price: 49,
    stock: 300,
    status: 1
  },
  {
    id: 10,
    name: '北面冲锋衣',
    sku: 'OT-001-TNF',
    thumb: 'https://example.com/jacket.jpg',
    category: '运动户外/户外装备',
    price: 1299,
    stock: 80,
    status: 1
  },
  {
    id: 11,
    name: '探路者登山包',
    sku: 'OT-002-TOR',
    thumb: 'https://example.com/backpack.jpg',
    category: '运动户外/户外装备',
    price: 399,
    stock: 150,
    status: 1
  },
  {
    id: 12,
    name: '牧高笛帐篷',
    sku: 'OT-003-MGD',
    thumb: 'https://example.com/tent.jpg',
    category: '运动户外/户外装备',
    price: 599,
    stock: 100,
    status: 1
  },
  {
    id: 13,
    name: '安踏运动短裤',
    sku: 'SP-001-ANTA',
    thumb: 'https://example.com/shorts.jpg',
    category: '运动户外/运动服饰',
    price: 89,
    stock: 200,
    status: 1
  },
  {
    id: 14,
    name: '李宁速干T恤',
    sku: 'SP-002-LN',
    thumb: 'https://example.com/tshirt.jpg',
    category: '运动户外/运动服饰',
    price: 79,
    stock: 300,
    status: 1
  },
  {
    id: 15,
    name: '耐克运动袜',
    sku: 'SP-003-NIKE',
    thumb: 'https://example.com/socks.jpg',
    category: '运动户外/运动服饰',
    price: 39,
    stock: 500,
    status: 1
  },
  {
    id: 16,
    name: '三只松鼠坚果礼盒',
    sku: 'SN-001-SZS',
    thumb: 'https://example.com/nuts.jpg',
    category: '食品饮料/休闲零食',
    price: 99,
    stock: 200,
    status: 1
  },
  {
    id: 17,
    name: '百草味肉脯',
    sku: 'SN-002-BCW',
    thumb: 'https://example.com/meat.jpg',
    category: '食品饮料/休闲零食',
    price: 29.9,
    stock: 300,
    status: 1
  },
  {
    id: 18,
    name: '良品铺子薯片',
    sku: 'SN-003-LPZ',
    thumb: 'https://example.com/chips.jpg',
    category: '食品饮料/休闲零食',
    price: 9.9,
    stock: 500,
    status: 1
  },
  {
    id: 19,
    name: '茅台酒',
    sku: 'DR-001-MT',
    thumb: 'https://example.com/maotai.jpg',
    category: '食品饮料/酒水饮品',
    price: 1499,
    stock: 50,
    status: 1
  },
  {
    id: 20,
    name: '青岛啤酒',
    sku: 'DR-002-QD',
    thumb: 'https://example.com/beer.jpg',
    category: '食品饮料/酒水饮品',
    price: 6.5,
    stock: 1000,
    status: 1
  },
  {
    id: 21,
    name: '星巴克咖啡豆',
    sku: 'DR-003-SB',
    thumb: 'https://example.com/coffee.jpg',
    category: '食品饮料/酒水饮品',
    price: 89,
    stock: 150,
    status: 1
  },
  {
    id: 22,
    name: '五常大米',
    sku: 'GR-001-WC',
    thumb: 'https://example.com/rice.jpg',
    category: '食品饮料/粮油调味',
    price: 199,
    stock: 100,
    status: 1
  },
  {
    id: 23,
    name: '李锦记生抽',
    sku: 'GR-002-LJJ',
    thumb: 'https://example.com/sauce.jpg',
    category: '食品饮料/粮油调味',
    price: 29.9,
    stock: 200,
    status: 1
  },
  {
    id: 24,
    name: '金龙鱼食用油',
    sku: 'GR-003-JLY',
    thumb: 'https://example.com/oil.jpg',
    category: '食品饮料/粮油调味',
    price: 79.9,
    stock: 150,
    status: 1
  },
  {
    id: 25,
    name: '兰蔻小黑瓶精华',
    sku: 'BT-001-LANC',
    thumb: 'https://example.com/serum.jpg',
    category: '美妆个护/护肤彩妆',
    price: 760,
    stock: 80,
    status: 1
  },
  {
    id: 26,
    name: '雅诗兰黛粉底液',
    sku: 'BT-002-EST',
    thumb: 'https://example.com/foundation.jpg',
    category: '美妆个护/护肤彩妆',
    price: 420,
    stock: 100,
    status: 1
  },
  {
    id: 27,
    name: 'MAC口红',
    sku: 'BT-003-MAC',
    thumb: 'https://example.com/lipstick.jpg',
    category: '美妆个护/护肤彩妆',
    price: 199,
    stock: 200,
    status: 1
  },
  {
    id: 28,
    name: '资生堂洗发水',
    sku: 'HC-001-SHIS',
    thumb: 'https://example.com/shampoo.jpg',
    category: '美妆个护/洗护用品',
    price: 68,
    stock: 150,
    status: 1
  },
  {
    id: 29,
    name: '舒肤佳沐浴露',
    sku: 'HC-002-SAF',
    thumb: 'https://example.com/bodywash.jpg',
    category: '美妆个护/洗护用品',
    price: 39.9,
    stock: 300,
    status: 1
  },
  {
    id: 30,
    name: '佳洁士牙膏',
    sku: 'HC-003-CREST',
    thumb: 'https://example.com/toothpaste.jpg',
    category: '美妆个护/洗护用品',
    price: 29.9,
    stock: 400,
    status: 1
  },
  {
    id: 31,
    name: '香奈儿香水',
    sku: 'PF-001-CHAN',
    thumb: 'https://example.com/perfume1.jpg',
    category: '美妆个护/香水香氛',
    price: 1280,
    stock: 50,
    status: 1
  },
  {
    id: 32,
    name: '迪奥真我香水',
    sku: 'PF-002-DIOR',
    thumb: 'https://example.com/perfume2.jpg',
    category: '美妆个护/香水香氛',
    price: 980,
    stock: 60,
    status: 1
  },
  {
    id: 33,
    name: '祖马龙香水',
    sku: 'PF-003-JO',
    thumb: 'https://example.com/perfume3.jpg',
    category: '美妆个护/香水香氛',
    price: 680,
    stock: 70,
    status: 1
  }
]

// 从本地存储获取商品数据
const getLocalGoodsData = () => {
  const data = localStorage.getItem('goodsList')
  return data ? JSON.parse(data) : null
}

// 保存商品数据到本地存储
const saveGoodsData = (data) => {
  localStorage.setItem('goodsList', JSON.stringify(data))
}

// 获取商品列表数据
const fetchGoodsList = () => {
  loading.value = true
  try {
    // 从本地存储获取数据
    const localData = localStorage.getItem('goodsList')
    let allData = []
    
    if (localData) {
      // 如果有本地数据，使用本地数据
      allData = JSON.parse(localData)
    } else {
      // 如果没有本地数据，使用默认数据并保存到本地存储
      allData = defaultGoodsList
      localStorage.setItem('goodsList', JSON.stringify(defaultGoodsList))
    }
    
    // 应用筛选条件
    let filteredData = [...allData]
    
    // 搜索关键词过滤
    if (searchKey.value) {
      const keyword = searchKey.value.toLowerCase()
      filteredData = filteredData.filter(item => 
        item.name.toLowerCase().includes(keyword) ||
        item.sku.toLowerCase().includes(keyword)
      )
    }
    
    // 分类过滤
    if (selectedCategory.value && selectedCategory.value.length) {
      const categoryValue = selectedCategory.value[selectedCategory.value.length - 1]
      if (categoryValue !== '') {
        filteredData = filteredData.filter(item => {
          // 处理父分类
          if (categoryValue === '1') {
            return item.category.startsWith('智能设备')
          } else if (categoryValue === '2') {
            return item.category.startsWith('日用百货')
          } else if (categoryValue === '3') {
            return item.category.startsWith('运动户外')
          } else if (categoryValue === '4') {
            return item.category.startsWith('食品饮料')
          } else if (categoryValue === '5') {
            return item.category.startsWith('美妆个护')
          }
          // 处理子分类
          return item.category === getCategoryName([categoryValue])
        })
      }
    }
    
    // 状态过滤
    if (filterStatus.value !== '') {
      filteredData = filteredData.filter(item => item.status === Number(filterStatus.value))
    }
    
    // 更新总数
    total.value = filteredData.length
    
    // 分页处理
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    goodsList.value = filteredData.slice(start, end)
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 监听状态变化，重置页码并重新获取数据
watch(() => filterStatus.value, (newVal) => {
  currentPage.value = 1
  fetchGoodsList()
}, { immediate: true })

// 获取分类名称
const getCategoryName = (categoryValue) => {
  if (!categoryValue || !categoryValue.length) return ''
  const value = categoryValue[categoryValue.length - 1]
  const categoryMap = {
    '1': '智能设备',
    '1-1': '智能设备/智能手机',
    '1-2': '智能设备/智能音箱',
    '1-3': '智能设备/蓝牙耳机',
    '2': '日用百货',
    '2-1': '日用百货/清洁用品',
    '2-2': '日用百货/厨房用品',
    '2-3': '日用百货/家居收纳',
    '3': '运动户外',
    '3-1': '运动户外/健身器材',
    '3-2': '运动户外/户外装备',
    '3-3': '运动户外/运动服饰',
    '4': '食品饮料',
    '4-1': '食品饮料/休闲零食',
    '4-2': '食品饮料/酒水饮品',
    '4-3': '食品饮料/粮油调味',
    '5': '美妆个护',
    '5-1': '美妆个护/护肤彩妆',
    '5-2': '美妆个护/洗护用品',
    '5-3': '美妆个护/香水香氛'
  }
  return categoryMap[value] || ''
}

// 处理每页显示数量变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchGoodsList()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchGoodsList()
}

// 搜索处理（使用防抖）
const handleSearch = debounce(() => {
  currentPage.value = 1
  fetchGoodsList()
}, 300)

// 执行搜索（包含历史记录）
const executeSearch = () => {
  addSearchHistory() // 添加搜索历史
  handleSearch()
}

// 添加搜索历史
const addSearchHistory = () => {
  if (searchKey.value) {
    const history = {
      keyword: searchKey.value,
      category: selectedCategory.value,
      status: filterStatus.value,
      timestamp: Date.now()
    }
    searchHistory.value.unshift(history)
    // 只保留最近10条记录
    if (searchHistory.value.length > 10) {
      searchHistory.value.pop()
    }
    // 保存到本地存储
    localStorage.setItem('goodsSearchHistory', JSON.stringify(searchHistory.value))
  }
}

// 使用搜索历史
const useSearchHistory = (history) => {
  searchKey.value = history.keyword
  selectedCategory.value = history.category
  filterStatus.value = history.status
  executeSearch()
  showSearchHistory.value = false
}

// 删除搜索历史
const deleteSearchHistory = (index) => {
  searchHistory.value.splice(index, 1)
  localStorage.setItem('goodsSearchHistory', JSON.stringify(searchHistory.value))
}

// 清空搜索历史
const clearSearchHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('goodsSearchHistory')
}

// 初始化搜索历史
const initSearchHistory = () => {
  const history = localStorage.getItem('goodsSearchHistory')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

// 重置搜索条件
const resetSearch = () => {
  searchKey.value = ''
  selectedCategory.value = []
  filterStatus.value = ''
  executeSearch()
}

// 选择处理
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

// 单个商品状态切换
const changeStatus = async (row) => {
  try {
    // 从本地存储获取数据
    const localData = localStorage.getItem('goodsList')
    let allData = localData ? JSON.parse(localData) : defaultGoodsList
    
    // 更新商品状态
    allData = allData.map(item => {
      if (item.id === row.id) {
        return { ...item, status: item.status === 1 ? 0 : 1 }
      }
      return item
    })
    
    // 保存到本地存储
    localStorage.setItem('goodsList', JSON.stringify(allData))
    
    ElMessage.success(row.status === 1 ? '商品已下架' : '商品已上架')
    fetchGoodsList()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 批量操作（删除/状态切换）
const batchOperate = (type) => {
  if (type === 'delete') {
    ElMessageBox.confirm('确认要删除选中的商品吗？', '提示').then(async () => {
      try {
        // 从本地存储获取数据
        const localData = localStorage.getItem('goodsList')
        let allData = localData ? JSON.parse(localData) : defaultGoodsList
        
        // 删除选中的商品
        allData = allData.filter(item => !selectedIds.value.includes(item.id))
        
        // 保存到本地存储
        localStorage.setItem('goodsList', JSON.stringify(allData))
        
        ElMessage.success('删除成功')
        fetchGoodsList()
      } catch (error) {
        ElMessage.error('删除失败')
      }
    })
  } else if (type === 'status') {
    const status = selectedIds.value.length > 0 && 
      goodsList.value.find(item => selectedIds.value.includes(item.id))?.status === 1 ? 0 : 1
    const action = status === 1 ? '上架' : '下架'
    
    ElMessageBox.confirm(`确认要${action}选中的商品吗？`, '提示').then(async () => {
      try {
        // 从本地存储获取数据
        const localData = localStorage.getItem('goodsList')
        let allData = localData ? JSON.parse(localData) : defaultGoodsList
        
        // 更新选中商品的状态
        allData = allData.map(item => {
          if (selectedIds.value.includes(item.id)) {
            return { ...item, status }
          }
          return item
        })
        
        // 保存到本地存储
        localStorage.setItem('goodsList', JSON.stringify(allData))
        
        ElMessage.success(`${action}成功`)
        fetchGoodsList()
      } catch (error) {
        ElMessage.error(`${action}失败`)
      }
    })
  }
}

// 商品操作相关方法
const showAddDialog = () => {
  currentGoods.value = null
  showEditor.value = true
}

const editGoods = (row) => {
  currentGoods.value = { ...row } // 创建深拷贝避免直接修改
  showEditor.value = true
}

const deleteGoods = (id) => {
  ElMessageBox.confirm('确认要删除该商品吗？', '提示').then(async () => {
    try {
      // 从本地存储获取数据
      const localData = localStorage.getItem('goodsList')
      let allData = localData ? JSON.parse(localData) : defaultGoodsList
      
      // 删除商品
      allData = allData.filter(item => item.id !== id)
      
      // 保存到本地存储
      localStorage.setItem('goodsList', JSON.stringify(allData))
      
      ElMessage.success('删除成功')
      fetchGoodsList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const viewDetail = (id) => {
  ElMessage.info('查看商品详情：' + id)
}

// 点击外部关闭历史记录
const handleClickOutside = (event) => {
  const searchBox = document.querySelector('.search-box')
  if (searchBox && !searchBox.contains(event.target)) {
    showSearchHistory.value = false
  }
}

// 组件生命周期钩子
onMounted(() => {
  // 检查本地存储是否有数据
  const localData = localStorage.getItem('goodsList')
  if (!localData) {
    // 如果没有数据，初始化默认数据
    localStorage.setItem('goodsList', JSON.stringify(defaultGoodsList))
  }
  
  fetchGoodsList()
  initSearchHistory()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 表单数据
const form = reactive({
  name: '',
  category: '',
  price: '',
  stock: '',
  images: [],
  // 价格验证规则
  priceRules: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', message: '价格必须为数字', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (value <= 0) {
        callback(new Error('价格必须大于0'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ],
  // 库存验证规则
  stockRules: [
    { required: true, message: '请输入商品库存', trigger: 'blur' },
    { type: 'number', message: '库存必须为数字', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (value < 0) {
        callback(new Error('库存不能小于0'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ]
})

// 提交表单
const submit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      const submitData = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        images: imageList.value,
        status: 1 // 默认上架状态
      }
      console.log('提交数据:', submitData)
      emit('refresh')
      close()
    }
  })
}

// 处理编辑器的刷新
const handleEditorRefresh = () => {
  fetchGoodsList()
  showEditor.value = false
  currentGoods.value = null
}
</script>

<template>
  <div class="goods-manage">
    <!-- 搜索与操作区 -->
    <div class="operate-bar">
      <div class="left">
        <div class="search-box">
          <el-input
            v-model="searchKey"
            placeholder="搜索商品名称/编号"
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
        <el-cascader
          v-model="selectedCategory"
          :options="categories"
          :props="{
            expandTrigger: 'hover',
            checkStrictly: true,
            label: 'label',
            value: 'value',
            children: 'children',
            emitPath: true,
            multiple: false
          }"
          placeholder="选择分类"
          clearable
          @change="handleSearch"
          style="width: 200px"
          class="custom-cascader"
        />
        <el-select
          v-model="filterStatus"
          placeholder="商品状态"
          clearable
          @change="handleSearch"
        >
          <el-option label="全部" value="" />
          <el-option label="已上架" value="1" />
          <el-option label="已下架" value="0" />
        </el-select>
      </div>
      <div class="right">
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>新增商品
        </el-button>
        <el-button :disabled="!selectedIds.length" @click="batchOperate('status')">
          {{ selectedIds.length > 0 && goodsList.find(item => selectedIds.includes(item.id))?.status === 1 ? '批量下架' : '批量上架' }}
        </el-button>
        <el-button :disabled="!selectedIds.length" @click="batchOperate('delete')">
          批量删除
        </el-button>
      </div>
    </div>

    <!-- 商品表格和分页容器 -->
    <div class="table-container">
      <el-table
        :data="goodsList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        style="width: 100%"
        height="calc(100vh - 280px)"
        border
      >
        <el-table-column type="selection" width="55" fixed />
        <el-table-column label="商品信息" min-width="300" fixed>
          <template #default="{ row }">
            <div class="goods-info">
              <el-image 
                :src="row.thumb" 
                :preview-src-list="[row.thumb]" 
                fit="cover"
                class="goods-thumb"
              />
              <div class="detail">
                <div class="title">{{ row.name }}</div>
                <div class="sku">SKU: {{ row.sku }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="150" />
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }">
            {{ formatCurrency(row.price) }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 1 ? 'success' : 'info'"
              class="status-tag"
              @click="changeStatus(row)"
            >
              {{ row.status === 1 ? '已上架' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button link type="primary" @click="editGoods(row)">编辑</el-button>
              <el-button link type="danger" @click="deleteGoods(row.id)">删除</el-button>
            </div>
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
          :pager-count="4"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </div>

    <!-- 商品编辑弹窗 -->
    <GoodsEditor 
      v-model="showEditor"
      :current-data="currentGoods"
      @refresh="handleEditorRefresh"
    />
  </div>
</template>

<style scoped>
.goods-manage {
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

:deep(.el-cascader) {
  width: 200px;
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

.goods-info {
  display: flex;
  align-items: center;
}

.goods-thumb {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  margin-right: 12px;
}

.goods-info .title {
  font-weight: 500;
  margin-bottom: 4px;
}

.goods-info .sku {
  color: var(--text-secondary);
  font-size: 0.8em;
}

.pagination {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  padding: 8px 0;
  background: white;
  border-radius: 4px;
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

.status-tag {
  cursor: pointer;
  transition: all 0.3s;
  padding: 0 12px;
  height: 28px;
  line-height: 28px;
  border-radius: 4px;
  text-align: center;
  display: inline-block;
  min-width: 60px;
}

.status-tag:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

:deep(.el-tag--success) {
  background-color: #f0f9eb;
  border-color: #e1f3d8;
  color: #67c23a;
}

:deep(.el-tag--info) {
  background-color: #f4f4f5;
  border-color: #e9e9eb;
  color: #909399;
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

.custom-cascader {
  width: 200px;
}

:deep(.custom-cascader .el-cascader-node__prefix) {
  display: none !important;
}

:deep(.custom-cascader .el-cascader-node__label) {
  padding-left: 0 !important;
  cursor: pointer !important;
}

:deep(.custom-cascader .el-cascader-node__label:hover) {
  color: var(--el-color-primary) !important;
}

:deep(.custom-cascader .el-cascader-node.is-active > .el-cascader-node__label) {
  color: var(--el-color-primary) !important;
}

:deep(.custom-cascader .el-cascader-node.is-checked > .el-cascader-node__label) {
  color: var(--el-color-primary) !important;
  font-weight: bold !important;
}

:deep(.custom-cascader .el-cascader-node__postfix) {
  display: none !important;
}

.operation-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style> 