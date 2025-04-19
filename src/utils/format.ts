/**
 * 格式化货币
 * @param value 数值
 * @param currency 货币符号，默认为 ¥
 * @param decimals 小数位数，默认为 2
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(value: number, currency: string = '¥', decimals: number = 2): string {
  if (typeof value !== 'number') return `${currency}0.00`
  return `${currency}${value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

/**
 * 格式化数字
 * @param value 数值
 * @param decimals 小数位数，默认为 0
 * @returns 格式化后的数字字符串
 */
export function formatNumber(value: number, decimals: number = 0): string {
  if (typeof value !== 'number') return '0'
  return value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化百分比
 * @param value 数值
 * @param decimals 小数位数，默认为 2
 * @returns 格式化后的百分比字符串
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (typeof value !== 'number') return '0%'
  return `${value.toFixed(decimals)}%`
}

/**
 * 格式化日期
 * @param date 日期对象或时间戳
 * @param format 格式化模板，默认为 YYYY-MM-DD
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | number | string, format: string = 'YYYY-MM-DD'): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数，默认为 2
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/**
 * 格式化时间间隔
 * @param milliseconds 毫秒数
 * @returns 格式化后的时间间隔字符串
 */
export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) return `${milliseconds}ms`

  const seconds = Math.floor(milliseconds / 1000)
  if (seconds < 60) return `${seconds}s`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}m`

  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
} 