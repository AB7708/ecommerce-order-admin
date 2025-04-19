export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  total: number
  items: T[]
  page: number
  pageSize: number
} 