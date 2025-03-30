<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  currentData: Object
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const visible = ref(props.modelValue)
const formRef = ref(null)
const form = reactive({
  name: '',
  category: '',
  price: '',
  stock: '',
  images: []
})

const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  price: [
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
  stock: [
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
}

// 分类数据
const categories = [
  {
    value: '1',
    label: '智能设备',
    children: [
      { value: '1-1', label: '智能手机' },
      { value: '1-2', label: '智能音箱' },
      { value: '1-3', label: '蓝牙耳机' }
    ]
  },
  {
    value: '2',
    label: '日用百货',
    children: [
      { value: '2-1', label: '清洁用品' },
      { value: '2-2', label: '厨房用品' },
      { value: '2-3', label: '家居收纳' }
    ]
  },
  {
    value: '3',
    label: '运动户外',
    children: [
      { value: '3-1', label: '健身器材' },
      { value: '3-2', label: '户外装备' },
      { value: '3-3', label: '运动服饰' }
    ]
  },
  {
    value: '4',
    label: '食品饮料',
    children: [
      { value: '4-1', label: '休闲零食' },
      { value: '4-2', label: '酒水饮品' },
      { value: '4-3', label: '粮油调味' }
    ]
  },
  {
    value: '5',
    label: '美妆个护',
    children: [
      { value: '5-1', label: '护肤彩妆' },
      { value: '5-2', label: '洗护用品' },
      { value: '5-3', label: '香水香氛' }
    ]
  }
]

// 图片上传相关
const uploadRef = ref(null)
const imageUrl = ref('')
const imageList = ref([])
const uploadLimit = 5

// 图片上传前的验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  if (imageList.value.length >= uploadLimit) {
    ElMessage.error(`最多只能上传 ${uploadLimit} 张图片!`)
    return false
  }
  return true
}

// 图片上传成功的回调
const handleUploadSuccess = (response, file) => {
  imageUrl.value = URL.createObjectURL(file.raw)
  imageList.value.push({
    name: file.name,
    url: imageUrl.value
  })
}

// 图片上传失败的回调
const handleUploadError = () => {
  ElMessage.error('图片上传失败')
}

// 移除图片
const handleRemove = (file) => {
  const index = imageList.value.findIndex(item => item.name === file.name)
  if (index !== -1) {
    imageList.value.splice(index, 1)
  }
}

// 打开编辑器
const open = (goods = null) => {
  if (goods) {
    // 编辑模式
    Object.assign(form, {
      name: goods.name,
      category: goods.category,
      price: goods.price,
      stock: goods.stock,
      images: goods.images || []
    })
    imageList.value = goods.images || []
  } else {
    // 新增模式
    Object.assign(form, {
      name: '',
      category: '',
      price: '',
      stock: '',
      images: []
    })
    imageList.value = []
  }
  visible.value = true
}

// 关闭编辑器
const close = () => {
  visible.value = false
  formRef.value?.resetFields()
  imageList.value = []
}

// 提交表单
const submit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      // 获取分类名称
      const categoryName = getCategoryName(form.category)
      if (!categoryName) {
        ElMessage.error('请选择有效的商品分类')
        return
      }

      // 这里添加提交逻辑
      const submitData = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        images: imageList.value,
        status: 1, // 默认上架状态
        id: props.currentData?.id || Date.now(), // 生成唯一ID
        sku: generateSKU(form.category), // 生成SKU
        thumb: imageList.value[0]?.url || '', // 使用第一张图片作为缩略图
        category: categoryName // 使用完整的分类名称
      }
      
      // 保存到本地存储
      const currentData = JSON.parse(localStorage.getItem('goodsList') || '[]')
      if (props.currentData) {
        // 编辑模式：更新现有商品
        const index = currentData.findIndex(item => item.id === props.currentData.id)
        if (index !== -1) {
          currentData[index] = submitData
        }
      } else {
        // 新增模式：添加到现有商品列表末尾
        currentData.push(submitData)
      }
      localStorage.setItem('goodsList', JSON.stringify(currentData))
      
      console.log('提交数据:', submitData)
      ElMessage.success(props.currentData ? '商品更新成功' : '商品添加成功')
      emit('refresh')
      close()
    }
  })
}

// 生成SKU
const generateSKU = (category) => {
  if (!category || !category.length) return ''
  const categoryValue = category[category.length - 1]
  const prefix = categoryValue.split('-')[0]
  const timestamp = Date.now().toString().slice(-3)
  return `${prefix}-${timestamp}`
}

// 获取分类名称
const getCategoryName = (category) => {
  if (!category || !category.length) return ''
  const categoryValue = category[category.length - 1]
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
  return categoryMap[categoryValue] || ''
}

// 暴露方法
defineExpose({
  open,
  close,
  submit
})

// 监听 visible 变化
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
})

watch(() => visible.value, (newVal) => {
  emit('update:modelValue', newVal)
})

// 监听编辑数据
watch(() => props.currentData, (val) => {
  if (val) {
    Object.assign(form, val)
  }
}, { immediate: true })
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="form.id ? '编辑商品' : '新增商品'"
    width="600px"
    @close="close"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="商品名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入商品名称" />
      </el-form-item>
      
      <el-form-item label="商品分类" prop="category">
        <el-cascader
          v-model="form.category"
          :options="categories"
          placeholder="请选择商品分类"
          :props="{
            expandTrigger: 'hover',
            checkStrictly: true
          }"
        />
      </el-form-item>

      <el-form-item label="商品价格" prop="price">
        <el-input-number 
          v-model="form.price" 
          :precision="2" 
          :step="0.1" 
          :min="0"
          placeholder="请输入商品价格"
        />
      </el-form-item>

      <el-form-item label="商品库存" prop="stock">
        <el-input-number 
          v-model="form.stock" 
          :min="0" 
          :precision="0"
          placeholder="请输入商品库存"
        />
      </el-form-item>
      
      <el-form-item label="商品图片">
        <el-upload
          ref="uploadRef"
          class="goods-uploader"
          action="/api/upload"
          :show-file-list="true"
          :limit="uploadLimit"
          :before-upload="beforeUpload"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :on-remove="handleRemove"
        >
          <el-icon class="goods-uploader-icon"><Plus /></el-icon>
          <template #tip>
            <div class="el-upload__tip">
              只能上传jpg/png文件，且不超过2MB，最多5张
            </div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.goods-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.goods-uploader:hover {
  border-color: var(--el-color-primary);
}

.goods-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}
</style> 