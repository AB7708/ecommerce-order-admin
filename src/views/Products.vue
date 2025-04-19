<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { CascaderOption } from 'element-plus'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  description: string
  status: number // 0: 下架, 1: 上架
  images?: string[]
  sku?: string
}

interface Category extends CascaderOption {
  value: string
  label: string
  children?: Category[]
}

const products = ref<Product[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref<string[]>([])
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const currentProduct = ref<Partial<Product>>({
  name: '',
  price: 0,
  stock: 0,
  category: '',
  description: '',
  status: 1,
  sku: ''
})

// 商品分类数据
const categories: Category[] = [
  {
    value: 'all',
    label: '全部商品'
  },
  {
    value: 'electronics',
    label: '电子产品',
    children: [
      { value: 'smartphone', label: '智能手机' },
      { value: 'laptop', label: '笔记本电脑' },
      { value: 'tablet', label: '平板电脑' },
      { value: 'accessories', label: '配件' }
    ]
  },
  {
    value: 'clothing',
    label: '服装服饰',
    children: [
      { value: 'men', label: '男装' },
      { value: 'women', label: '女装' },
      { value: 'children', label: '童装' },
      { value: 'accessories', label: '配饰' }
    ]
  },
  {
    value: 'food',
    label: '食品饮料',
    children: [
      { value: 'snacks', label: '零食' },
      { value: 'drinks', label: '饮料' },
      { value: 'fresh', label: '生鲜' },
      { value: 'bakery', label: '烘焙' }
    ]
  }
]

// 默认商品数据
const defaultProducts: Product[] = [
  // 电子产品 - 智能手机
  {
    id: '1',
    name: 'Apple iPhone 15 Pro Max 256GB 钛金属',
    price: 9999,
    stock: 50,
    category: 'electronics/smartphone',
    description: '6.7英寸超视网膜XDR显示屏，A17 Pro芯片，4800万像素主摄像头',
    status: 1,
    sku: 'IP15PM-256'
  },
  {
    id: '2',
    name: 'Huawei Mate 60 Pro 512GB 雅丹黑',
    price: 6999,
    stock: 80,
    category: 'electronics/smartphone',
    description: '6.82英寸OLED曲面屏，麒麟9000S芯片，5000万像素超感知影像系统',
    status: 1,
    sku: 'MT60P-512'
  },
  {
    id: '3',
    name: 'Xiaomi 14 Ultra 1TB 陶瓷黑',
    price: 5999,
    stock: 100,
    category: 'electronics/smartphone',
    description: '6.73英寸2K AMOLED屏，骁龙8 Gen3，徕卡光学系统',
    status: 1,
    sku: 'XM14U-1T'
  },
  {
    id: '27',
    name: 'Samsung Galaxy S24 Ultra 512GB 钛灰',
    price: 8999,
    stock: 60,
    category: 'electronics/smartphone',
    description: '6.8英寸Dynamic AMOLED 2X屏，骁龙8 Gen3，2亿像素主摄',
    status: 1,
    sku: 'SGS24U-512'
  },
  {
    id: '28',
    name: 'OPPO Find X7 Ultra 512GB 星夜黑',
    price: 5999,
    stock: 70,
    category: 'electronics/smartphone',
    description: '6.82英寸2K LTPO屏，骁龙8 Gen3，双潜望长焦',
    status: 1,
    sku: 'OPX7U-512'
  },
  // 电子产品 - 笔记本电脑
  {
    id: '4',
    name: 'Apple MacBook Pro 16英寸 M3 Max 32GB 1TB',
    price: 24999,
    stock: 30,
    category: 'electronics/laptop',
    description: '16英寸Liquid视网膜XDR显示屏，M3 Max芯片，32GB统一内存',
    status: 1,
    sku: 'MBP16-M3'
  },
  {
    id: '5',
    name: 'Lenovo ThinkPad X1 Carbon 14英寸 i7 32GB 1TB',
    price: 12999,
    stock: 40,
    category: 'electronics/laptop',
    description: '14英寸2.8K OLED触控屏，第13代酷睿i7处理器，32GB内存',
    status: 1,
    sku: 'TPX1C-14'
  },
  {
    id: '6',
    name: 'Dell XPS 15 15.6英寸 i9 64GB 2TB',
    price: 18999,
    stock: 25,
    category: 'electronics/laptop',
    description: '15.6英寸4K+触控屏，第13代酷睿i9处理器，64GB内存',
    status: 1,
    sku: 'DXPS15-64'
  },
  {
    id: '29',
    name: 'Huawei MateBook X Pro 14.2英寸 i7 32GB 1TB',
    price: 11999,
    stock: 35,
    category: 'electronics/laptop',
    description: '14.2英寸3.1K触控屏，第13代酷睿i7处理器，32GB内存',
    status: 1,
    sku: 'MBXP-14'
  },
  {
    id: '30',
    name: 'ASUS ROG Zephyrus G14 14英寸 R9 32GB 1TB',
    price: 10999,
    stock: 45,
    category: 'electronics/laptop',
    description: '14英寸2.5K 165Hz屏，AMD R9 7940HS，RTX 4060',
    status: 1,
    sku: 'ROGZ14-R9'
  },
  // 电子产品 - 平板电脑
  {
    id: '7',
    name: 'Apple iPad Pro 12.9英寸 M2 256GB',
    price: 8999,
    stock: 60,
    category: 'electronics/tablet',
    description: '12.9英寸Liquid视网膜XDR显示屏，M2芯片，支持Apple Pencil',
    status: 1,
    sku: 'IPADP-256'
  },
  {
    id: '8',
    name: 'Huawei MatePad Pro 12.6英寸 256GB',
    price: 4999,
    stock: 70,
    category: 'electronics/tablet',
    description: '12.6英寸OLED全面屏，麒麟9000E芯片，支持M-Pencil',
    status: 1,
    sku: 'MTPAD-256'
  },
  {
    id: '31',
    name: 'Samsung Galaxy Tab S9 Ultra 14.6英寸 512GB',
    price: 7999,
    stock: 40,
    category: 'electronics/tablet',
    description: '14.6英寸Dynamic AMOLED 2X屏，骁龙8 Gen2，S Pen支持',
    status: 1,
    sku: 'GTS9U-512'
  },
  {
    id: '32',
    name: 'Lenovo Yoga Pad Pro 13英寸 256GB',
    price: 3999,
    stock: 55,
    category: 'electronics/tablet',
    description: '13英寸2.5K屏，骁龙870，支持触控笔',
    status: 1,
    sku: 'YGP13-256'
  },
  // 电子产品 - 配件
  {
    id: '9',
    name: 'Apple AirPods Pro 2代 主动降噪',
    price: 1999,
    stock: 200,
    category: 'electronics/accessories',
    description: '主动降噪，空间音频，MagSafe充电盒',
    status: 1,
    sku: 'APRO2-001'
  },
  {
    id: '10',
    name: 'Belkin 3合1 MagSafe充电器',
    price: 999,
    stock: 150,
    category: 'electronics/accessories',
    description: '支持iPhone、Apple Watch、AirPods同时充电',
    status: 1,
    sku: 'B3IN1-001'
  },
  {
    id: '33',
    name: 'Samsung 45W PD快充充电器',
    price: 299,
    stock: 180,
    category: 'electronics/accessories',
    description: '45W快充，支持PD协议，小巧便携',
    status: 1,
    sku: 'SS45W-PD'
  },
  {
    id: '34',
    name: 'Anker 20000mAh移动电源',
    price: 399,
    stock: 120,
    category: 'electronics/accessories',
    description: '20000mAh大容量，支持PD快充，双USB输出',
    status: 1,
    sku: 'AK20K-PD'
  },
  // 服装 - 男装
  {
    id: '11',
    name: 'Armani Exchange 男士修身西装套装',
    price: 2999,
    stock: 30,
    category: 'clothing/men',
    description: '100%羊毛面料，修身剪裁，商务休闲两用',
    status: 1,
    sku: 'AX-SUIT'
  },
  {
    id: '12',
    name: 'Nike Dri-FIT 男士运动套装',
    price: 899,
    stock: 100,
    category: 'clothing/men',
    description: '速干面料，透气舒适，适合运动穿着',
    status: 1,
    sku: 'NK-DFIT'
  },
  {
    id: '35',
    name: 'Tommy Hilfiger 男士休闲衬衫',
    price: 799,
    stock: 80,
    category: 'clothing/men',
    description: '纯棉面料，经典格纹，商务休闲',
    status: 1,
    sku: 'TH-SHIRT'
  },
  {
    id: '36',
    name: 'Calvin Klein 男士牛仔裤',
    price: 599,
    stock: 90,
    category: 'clothing/men',
    description: '修身版型，弹性面料，舒适耐穿',
    status: 1,
    sku: 'CK-JEANS'
  },
  // 服装 - 女装
  {
    id: '13',
    name: 'ZARA 女士羊毛大衣',
    price: 1299,
    stock: 50,
    category: 'clothing/women',
    description: '100%羊毛，经典双排扣设计，保暖舒适',
    status: 1,
    sku: 'ZR-COAT'
  },
  {
    id: '14',
    name: 'H&M 女士针织连衣裙',
    price: 399,
    stock: 80,
    category: 'clothing/women',
    description: '修身剪裁，舒适面料，适合日常穿着',
    status: 1,
    sku: 'HM-DRESS'
  },
  {
    id: '37',
    name: 'UNIQLO 女士羽绒服',
    price: 899,
    stock: 60,
    category: 'clothing/women',
    description: '90%白鸭绒，轻便保暖，多色可选',
    status: 1,
    sku: 'UQ-DOWN'
  },
  {
    id: '38',
    name: 'Mango 女士针织开衫',
    price: 499,
    stock: 70,
    category: 'clothing/women',
    description: '羊毛混纺，宽松版型，百搭款式',
    status: 1,
    sku: 'MG-CARD'
  },
  // 服装 - 童装
  {
    id: '15',
    name: 'GAP 儿童纯棉卫衣套装',
    price: 299,
    stock: 120,
    category: 'clothing/children',
    description: '100%纯棉，舒适透气，适合3-6岁儿童',
    status: 1,
    sku: 'GP-KIDS'
  },
  {
    id: '16',
    name: 'UNIQLO 儿童保暖内衣套装',
    price: 199,
    stock: 150,
    category: 'clothing/children',
    description: '保暖面料，舒适贴身，适合秋冬穿着',
    status: 1,
    sku: 'UQ-KIDS'
  },
  {
    id: '39',
    name: 'Adidas 儿童运动套装',
    price: 399,
    stock: 100,
    category: 'clothing/children',
    description: '速干面料，透气舒适，适合运动穿着',
    status: 1,
    sku: 'AD-KIDS'
  },
  {
    id: '40',
    name: 'Balabala 儿童羽绒服',
    price: 599,
    stock: 80,
    category: 'clothing/children',
    description: '90%白鸭绒，轻便保暖，多色可选',
    status: 1,
    sku: 'BB-DOWN'
  },
  // 服装 - 配饰
  {
    id: '17',
    name: 'Coach 女士手提包',
    price: 3999,
    stock: 20,
    category: 'clothing/accessories',
    description: '真皮材质，经典设计，大容量收纳',
    status: 1,
    sku: 'CC-BAG'
  },
  {
    id: '18',
    name: 'Ray-Ban 经典飞行员太阳镜',
    price: 1299,
    stock: 40,
    category: 'clothing/accessories',
    description: '经典飞行员款式，100%防紫外线',
    status: 1,
    sku: 'RB-SUN'
  },
  {
    id: '41',
    name: 'Michael Kors 女士钱包',
    price: 1999,
    stock: 30,
    category: 'clothing/accessories',
    description: '真皮材质，多卡位设计，时尚实用',
    status: 1,
    sku: 'MK-WALL'
  },
  {
    id: '42',
    name: 'Fossil 男士皮带',
    price: 599,
    stock: 50,
    category: 'clothing/accessories',
    description: '真皮材质，经典设计，商务休闲',
    status: 1,
    sku: 'FS-BELT'
  },
  // 食品 - 零食
  {
    id: '19',
    name: 'Lay\'s 薯片混合装礼盒',
    price: 99,
    stock: 200,
    category: 'food/snacks',
    description: '包含原味、烧烤、番茄等多种口味',
    status: 1,
    sku: 'LS-MIX'
  },
  {
    id: '20',
    name: 'Nestle 巧克力礼盒',
    price: 199,
    stock: 150,
    category: 'food/snacks',
    description: '精选多种口味巧克力，精美包装',
    status: 1,
    sku: 'NS-CHOC'
  },
  {
    id: '43',
    name: 'Orion 好丽友派礼盒',
    price: 79,
    stock: 180,
    category: 'food/snacks',
    description: '松软蛋糕，巧克力涂层，多种口味',
    status: 1,
    sku: 'OR-PIE'
  },
  {
    id: '44',
    name: 'Calbee 薯条三兄弟礼盒',
    price: 129,
    stock: 160,
    category: 'food/snacks',
    description: '北海道特产，香脆可口，独立包装',
    status: 1,
    sku: 'CB-POT'
  },
  // 食品 - 饮料
  {
    id: '21',
    name: 'Coca-Cola 可乐24罐装',
    price: 69,
    stock: 300,
    category: 'food/drinks',
    description: '经典可口可乐，24罐装，冰镇更佳',
    status: 1,
    sku: 'CC-24PK'
  },
  {
    id: '22',
    name: 'Nongfu Spring 矿泉水24瓶装',
    price: 49,
    stock: 400,
    category: 'food/drinks',
    description: '天然矿泉水，24瓶装，健康饮水',
    status: 1,
    sku: 'NFS-24PK'
  },
  {
    id: '45',
    name: 'Nestle 雀巢咖啡礼盒',
    price: 199,
    stock: 120,
    category: 'food/drinks',
    description: '精选咖啡豆，多种口味，精美礼盒',
    status: 1,
    sku: 'NS-COFF'
  },
  {
    id: '46',
    name: 'Twinings 英式红茶礼盒',
    price: 159,
    stock: 100,
    category: 'food/drinks',
    description: '英国进口，多种口味，独立茶包',
    status: 1,
    sku: 'TW-TEA'
  },
  // 食品 - 生鲜
  {
    id: '23',
    name: '进口车厘子 2kg装',
    price: 199,
    stock: 50,
    category: 'food/fresh',
    description: '智利进口车厘子，果径28-30mm，新鲜直达',
    status: 1,
    sku: 'FR-CHER'
  },
  {
    id: '24',
    name: '澳洲和牛牛排 500g',
    price: 299,
    stock: 30,
    category: 'food/fresh',
    description: '澳洲M5和牛，雪花纹路，肉质鲜嫩',
    status: 1,
    sku: 'FR-BEEF'
  },
  {
    id: '47',
    name: '挪威三文鱼 1kg装',
    price: 199,
    stock: 40,
    category: 'food/fresh',
    description: '挪威进口，新鲜切片，富含Omega-3',
    status: 1,
    sku: 'FR-SALM'
  },
  {
    id: '48',
    name: '新西兰奇异果 12个装',
    price: 99,
    stock: 60,
    category: 'food/fresh',
    description: '新西兰进口，果肉细腻，酸甜可口',
    status: 1,
    sku: 'FR-KIWI'
  },
  // 食品 - 烘焙
  {
    id: '25',
    name: '巴黎贝甜 法式面包礼盒',
    price: 129,
    stock: 100,
    category: 'food/bakery',
    description: '包含法棍、可颂等多种经典面包',
    status: 1,
    sku: 'PB-BREAD'
  },
  {
    id: '26',
    name: '85度C 生日蛋糕 8寸',
    price: 199,
    stock: 20,
    category: 'food/bakery',
    description: '新鲜奶油蛋糕，多种口味可选',
    status: 1,
    sku: '85-CAKE'
  },
  {
    id: '49',
    name: '好利来 半熟芝士礼盒',
    price: 159,
    stock: 80,
    category: 'food/bakery',
    description: '日本进口芝士，入口即化，多种口味',
    status: 1,
    sku: 'HL-CHEE'
  },
  {
    id: '50',
    name: '元祖 雪月饼礼盒',
    price: 299,
    stock: 40,
    category: 'food/bakery',
    description: '冰淇淋月饼，多种口味，精美包装',
    status: 1,
    sku: 'YZ-MOON'
  }
]

// 获取商品列表数据
const fetchProducts = async () => {
  loading.value = true
  try {
    // 从本地存储获取数据
    const localData = localStorage.getItem('productsList')
    if (localData) {
      // 如果本地存储有数据，检查是否需要更新
      const localProducts = JSON.parse(localData)
      const localProductIds = localProducts.map((p: Product) => p.id)
      
      // 如果本地数据中缺少默认数据中的某些商品，则合并数据
      const missingProducts = defaultProducts.filter(p => !localProductIds.includes(p.id))
      if (missingProducts.length > 0) {
        const updatedProducts = [...localProducts, ...missingProducts]
        localStorage.setItem('productsList', JSON.stringify(updatedProducts))
        products.value = updatedProducts
      } else {
        products.value = localProducts
      }
    } else {
      // 如果没有本地数据，使用默认数据
      products.value = defaultProducts
      localStorage.setItem('productsList', JSON.stringify(defaultProducts))
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 添加商品
const handleAdd = () => {
  currentProduct.value = {
    name: '',
    price: 0,
    stock: 0,
    category: '',
    description: '',
    status: 1,
    sku: ''
  }
  showAddDialog.value = true
}

// 编辑商品
const handleEdit = (product: Product) => {
  currentProduct.value = { ...product }
  showEditDialog.value = true
}

// 删除商品
const handleDelete = async (product: Product) => {
  try {
    await ElMessageBox.confirm('确认要删除该商品吗？', '提示', {
      type: 'warning'
    })
    
    // 从本地存储获取数据
    const localData = localStorage.getItem('productsList')
    if (localData) {
      const productsList = JSON.parse(localData)
      const updatedList = productsList.filter((p: Product) => p.id !== product.id)
      localStorage.setItem('productsList', JSON.stringify(updatedList))
      products.value = updatedList
      ElMessage.success('删除成功')
    }
  } catch (error) {
    console.error('删除商品失败:', error)
  }
}

// 切换商品状态
const toggleStatus = (product: Product) => {
  const localData = localStorage.getItem('productsList')
  if (localData) {
    const productsList = JSON.parse(localData)
    const updatedList = productsList.map((p: Product) => {
      if (p.id === product.id) {
        return { ...p, status: p.status === 1 ? 0 : 1 }
      }
      return p
    })
    localStorage.setItem('productsList', JSON.stringify(updatedList))
    products.value = updatedList
    ElMessage.success(product.status === 1 ? '商品已下架' : '商品已上架')
  }
}

// 保存商品
const saveProduct = (product: Partial<Product>) => {
  const localData = localStorage.getItem('productsList')
  if (localData) {
    const productsList = JSON.parse(localData)
    if (product.id) {
      // 编辑现有商品
      const updatedList = productsList.map((p: Product) => 
        p.id === product.id ? { ...p, ...product } : p
      )
      localStorage.setItem('productsList', JSON.stringify(updatedList))
      products.value = updatedList
      ElMessage.success('商品更新成功')
    } else {
      // 添加新商品
      const newProduct: Product = {
        id: Date.now().toString(),
        name: product.name || '',
        price: product.price || 0,
        stock: product.stock || 0,
        category: product.category || '',
        description: product.description || '',
        status: 1,
        sku: product.sku || ''
      }
      productsList.push(newProduct)
      localStorage.setItem('productsList', JSON.stringify(productsList))
      products.value = productsList
      ElMessage.success('商品添加成功')
    }
    showAddDialog.value = false
    showEditDialog.value = false
  }
}

// 过滤后的商品列表
const filteredProducts = computed(() => {
  let result = [...products.value]
  
  // 按分类过滤
  if (selectedCategory.value.length > 0 && selectedCategory.value[0] !== 'all') {
    const category = selectedCategory.value[selectedCategory.value.length - 1]
    result = result.filter(product => product.category.includes(category))
  }
  
  // 按搜索关键词过滤
  if (searchQuery.value) {
    const keyword = searchQuery.value.toLowerCase()
    result = result.filter(product => 
      product.name.toLowerCase().includes(keyword) ||
      product.description.toLowerCase().includes(keyword) ||
      product.sku?.toLowerCase().includes(keyword)
    )
  }
  
  return result
})

// 分页后的商品列表
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProducts.value.slice(start, end)
})

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div class="products-container">
    <h2>商品管理</h2>
    
    <!-- 操作栏 -->
    <div class="operations">
      <el-button type="primary" @click="handleAdd">添加商品</el-button>
      <el-cascader
        v-model="selectedCategory"
        :options="categories"
        placeholder="选择分类"
        style="width: 200px; margin-left: 16px;"
        clearable
      />
      <el-input
        v-model="searchQuery"
        placeholder="搜索商品名称/描述/SKU"
        style="width: 200px; margin-left: 16px;"
        clearable
      />
    </div>
    
    <!-- 商品列表 -->
    <el-table
      v-loading="loading"
      :data="paginatedProducts"
      style="width: 100%; margin-top: 20px;"
    >
      <el-table-column prop="name" label="商品名称" />
      <el-table-column prop="sku" label="SKU" width="120" />
      <el-table-column prop="price" label="价格" width="120">
        <template #default="{ row }">
          ¥{{ row.price.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="100" />
      <el-table-column prop="category" label="分类" width="150" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag
            :type="row.status === 1 ? 'success' : 'info'"
            @click="toggleStatus(row)"
            style="cursor: pointer;"
          >
            {{ row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
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
        :total="filteredProducts.length"
        layout="prev, pager, next"
        :pager-count="5"
      />
    </div>

    <!-- 添加/编辑商品对话框 -->
    <el-dialog
      :model-value="showAddDialog || showEditDialog"
      @update:model-value="(val) => { showAddDialog = val; showEditDialog = val }"
      :title="currentProduct?.id ? '编辑商品' : '添加商品'"
      width="500px"
    >
      <el-form
        :model="currentProduct"
        label-width="80px"
        v-if="currentProduct"
      >
        <el-form-item label="商品名称">
          <el-input v-model="currentProduct.name" />
        </el-form-item>
        <el-form-item label="SKU">
          <el-input v-model="currentProduct.sku" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="currentProduct.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="currentProduct.stock" :min="0" />
        </el-form-item>
        <el-form-item label="分类">
          <el-cascader
            v-model="selectedCategory"
            :options="categories"
            placeholder="选择分类"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="currentProduct.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false; showEditDialog = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="saveProduct(currentProduct)"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.products-container {
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 