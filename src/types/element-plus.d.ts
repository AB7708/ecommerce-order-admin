declare module 'element-plus' {
  export interface MessageParams {
    message: string
    type?: 'success' | 'warning' | 'info' | 'error'
    duration?: number
    showClose?: boolean
    center?: boolean
    offset?: number
    grouping?: boolean
    repeatNum?: number
    appendTo?: string | HTMLElement
    onClose?: () => void
  }

  export const ElMessage: {
    success: (message: string | MessageParams) => void
    warning: (message: string | MessageParams) => void
    info: (message: string | MessageParams) => void
    error: (message: string | MessageParams) => void
  }
} 