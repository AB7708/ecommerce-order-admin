export const formatCurrency = (value) => {
  return `¥${Number(value).toFixed(2)}`
}

export const formatNumber = (value) => {
  return Number(value).toLocaleString()
}

export function formatPercentage(value) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100)
} 