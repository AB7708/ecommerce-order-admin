import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSearch } from '../useSearch'
import type { SearchHistory } from '../useSearch'

// 模拟 localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key]),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('useSearch', () => {
  beforeEach(() => {
    // 在每个测试前清除 localStorage 的模拟
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const { searchKey, filterValue, searchHistory, showSearchHistory, loading } = useSearch()
    
    expect(searchKey.value).toBe('')
    expect(filterValue.value).toBe('')
    expect(searchHistory.value).toEqual([])
    expect(showSearchHistory.value).toBe(false)
    expect(loading.value).toBe(false)
  })

  it('should initialize with custom values', () => {
    const options = {
      storageKey: 'test_key',
      defaultFilter: 'test_filter',
      maxHistory: 5
    }
    
    const { searchKey, filterValue, searchHistory } = useSearch(options)
    
    expect(searchKey.value).toBe('')
    expect(filterValue.value).toBe('test_filter')
    expect(searchHistory.value).toEqual([])
  })

  it('should load search history from localStorage', () => {
    const history: SearchHistory[] = [
      { keyword: 'test1', timestamp: 1234567890 },
      { keyword: 'test2', timestamp: 1234567891 }
    ]
    localStorageMock.setItem('test_key', JSON.stringify(history))
    
    const { searchHistory } = useSearch({ storageKey: 'test_key' })
    
    expect(searchHistory.value).toEqual(history)
  })

  it('should add search history', () => {
    const { addSearchHistory } = useSearch({ storageKey: 'test_key' })
    
    addSearchHistory('test search')
    
    const lastCall = localStorageMock.setItem.mock.calls[0]
    const savedHistory: SearchHistory[] = JSON.parse(lastCall[1])
    
    expect(savedHistory).toHaveLength(1)
    expect(savedHistory[0].keyword).toBe('test search')
    expect(typeof savedHistory[0].timestamp).toBe('number')
  })

  it('should limit search history length', () => {
    const { addSearchHistory } = useSearch({ 
      storageKey: 'test_key',
      maxHistory: 2
    })
    
    addSearchHistory('test1')
    addSearchHistory('test2')
    addSearchHistory('test3')
    
    const lastCall = localStorageMock.setItem.mock.calls[2]
    const savedHistory: SearchHistory[] = JSON.parse(lastCall[1])
    
    expect(savedHistory).toHaveLength(2)
    expect(savedHistory[0].keyword).toBe('test3')
    expect(savedHistory[1].keyword).toBe('test2')
  })

  it('should remove duplicates from search history', () => {
    const { addSearchHistory } = useSearch({ storageKey: 'test_key' })
    
    addSearchHistory('test')
    addSearchHistory('test')
    
    const lastCall = localStorageMock.setItem.mock.calls[1]
    const savedHistory: SearchHistory[] = JSON.parse(lastCall[1])
    
    expect(savedHistory).toHaveLength(1)
    expect(savedHistory[0].keyword).toBe('test')
  })

  it('should clear search history', () => {
    const { clearSearchHistory } = useSearch({ storageKey: 'test_key' })
    
    clearSearchHistory()
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('test_key')
  })

  it('should execute search callback', () => {
    const searchCallback = vi.fn()
    const { executeSearch } = useSearch({ 
      onSearch: searchCallback
    })
    
    executeSearch()
    
    expect(searchCallback).toHaveBeenCalledWith({
      searchKey: '',
      filterValue: ''
    })
  })

  it('should handle filter change', () => {
    const { filterValue, handleFilterChange } = useSearch()
    
    handleFilterChange('new_filter')
    
    expect(filterValue.value).toBe('new_filter')
  })

  it('should reset search', () => {
    const resetCallback = vi.fn()
    const { searchKey, filterValue, resetSearch } = useSearch({ 
      defaultFilter: 'default',
      onReset: resetCallback
    })
    
    searchKey.value = 'test'
    filterValue.value = 'filter'
    resetSearch()
    
    expect(searchKey.value).toBe('')
    expect(filterValue.value).toBe('default')
    expect(resetCallback).toHaveBeenCalled()
  })

  it('should handle search history visibility', () => {
    const { showSearchHistory, handleClickOutside } = useSearch()
    
    showSearchHistory.value = true
    handleClickOutside()
    
    expect(showSearchHistory.value).toBe(false)
  })

  it('should show clear button when search or filter is active', () => {
    const { searchKey, filterValue, showClearButton } = useSearch()
    
    expect(showClearButton.value).toBe(false)
    
    searchKey.value = 'test'
    expect(showClearButton.value).toBe(true)
    
    searchKey.value = ''
    filterValue.value = 'filter'
    expect(showClearButton.value).toBe(true)
  })
}) 