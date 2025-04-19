import CryptoJS from 'crypto-js'

/**
 * 加密数据
 * @param data - 要加密的数据
 * @returns 加密后的字符串
 */
export function encryptData(data: string): string {
  const key = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key-123456'
  return CryptoJS.AES.encrypt(data, key).toString()
}

/**
 * 解密数据
 * @param encryptedData - 加密后的数据
 * @returns 解密后的字符串
 */
export function decryptData(encryptedData: string): string {
  const key = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key-123456'
  const bytes = CryptoJS.AES.decrypt(encryptedData, key)
  return bytes.toString(CryptoJS.enc.Utf8)
}

/**
 * 生成随机密钥
 * @returns 32字节的随机密钥
 */
export function generateRandomKey(): string {
  return CryptoJS.lib.WordArray.random(32).toString()
} 