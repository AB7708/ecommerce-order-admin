import { ref, computed, type Ref } from 'vue'
import { ElMessage } from 'element-plus'

interface SearchOptions {
  storageKey?: string
  maxHistory?: number
  enableHistory?: boolean
  enableFilter?: boolean
  defaultFilter?: string
  debounceTime?: number
  onSearch?: (params: { searchKey: string; filterValue: string }) => void
  onReset?: () => void
}

export interface SearchHistory {
  keyword: string
  timestamp: number
}

export function useSearch(options: SearchOptions = {}) {
  const {
    storageKey = 'search_history',
    maxHistory = 10,
    enableHistory = true,
    enableFilter = true,
    defaultFilter = '',
    debounceTime = 300
  } = options

  // 搜索关键词
  const searchKey: Ref<string> = ref('')
  // 过滤值
  const filterValue: Ref<string> = ref(defaultFilter)
  // 搜索历史
  const searchHistory: Ref<SearchHistory[]> = ref([])
  // 是否显示搜索历史
  const showSearchHistory: Ref<boolean> = ref(false)
  // 加载状态
  const loading: Ref<boolean> = ref(false)
  // 防抖定时器
  let debounceTimer: number | null = null

  // 初始化搜索历史
  const initSearchHistory = (): void => {
    if (!enableHistory) return
    
    try {
      const history = localStorage.getItem(storageKey)
      if (history) {
        searchHistory.value = JSON.parse(history)
      }
    } catch (error) {
      console.error('初始化搜索历史失败:', error)
      searchHistory.value = []
    }
  }

  // 添加搜索历史
  const addSearchHistory = (keyword: string): void => {
    if (!enableHistory || !keyword) return
    
    try {
      // 移除重复项
      const index = searchHistory.value.findIndex(item => item.keyword === keyword)
      if (index > -1) {
        searchHistory.value.splice(index, 1)
      }
      
      // 添加到开头
      searchHistory.value.unshift({
        keyword,
        timestamp: Date.now()
      })
      
      // 限制数量
      if (searchHistory.value.length > maxHistory) {
        searchHistory.value = searchHistory.value.slice(0, maxHistory)
      }
      
      // 保存到本地存储
      localStorage.setItem(storageKey, JSON.stringify(searchHistory.value))
    } catch (error) {
      console.error('添加搜索历史失败:', error)
    }
  }

  // 使用搜索历史
  const useSearchHistory = (keyword: string): void => {
    searchKey.value = keyword
    showSearchHistory.value = false
    executeSearch()
  }

  // 删除搜索历史
  const deleteSearchHistory = (index: number): void => {
    if (!enableHistory) return
    
    try {
      searchHistory.value.splice(index, 1)
      localStorage.setItem(storageKey, JSON.stringify(searchHistory.value))
    } catch (error) {
      console.error('删除搜索历史失败:', error)
    }
  }

  // 清空搜索历史
  const clearSearchHistory = (): void => {
    if (!enableHistory) return
    
    try {
      searchHistory.value = []
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.error('清空搜索历史失败:', error)
    }
  }

  // 执行搜索
  const executeSearch = (): void => {
    if (loading.value) return
    
    loading.value = true
    try {
      // 添加搜索历史
      if (searchKey.value) {
        addSearchHistory(searchKey.value)
      }
      
      // 触发搜索回调
      if (options.onSearch) {
        options.onSearch({
          searchKey: searchKey.value,
          filterValue: filterValue.value
        })
      }
    } catch (error) {
      ElMessage.error('搜索失败: ' + (error as Error).message)
    } finally {
      loading.value = false
    }
  }

  // 处理搜索输入
  const handleSearch = (): void => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    debounceTimer = window.setTimeout(() => {
      executeSearch()
    }, debounceTime)
  }

  // 重置搜索
  const resetSearch = (): void => {
    searchKey.value = ''
    filterValue.value = defaultFilter
    if (options.onReset) {
      options.onReset()
    }
  }

  // 处理过滤变化
  const handleFilterChange = (value: string): void => {
    if (!enableFilter) return
    
    filterValue.value = value
    executeSearch()
  }

  // 处理点击外部关闭搜索历史
  const handleClickOutside = (): void => {
    showSearchHistory.value = false
  }

  // 计算属性：是否显示清空按钮
  const showClearButton = computed(() => {
    return Boolean(searchKey.value) || filterValue.value !== defaultFilter
  })

  // 初始化
  initSearchHistory()

  return {
    // 状态
    searchKey,
    filterValue,
    searchHistory,
    showSearchHistory,
    loading,
    showClearButton,
    
    // 方法
    handleSearch,
    executeSearch,
    resetSearch,
    useSearchHistory,
    deleteSearchHistory,
    clearSearchHistory,
    handleFilterChange,
    handleClickOutside,
    addSearchHistory
  }
} 