export const APP_CONFIG = {
  APP_NAME: 'E-commerce Order Admin',
  VERSION: '1.0.0',
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
}

export const ROUTES = {
  LOGIN: '/login',
  HOME: '/',
  ORDERS: '/orders',
  PRODUCTS: '/products',
  MARKETING: '/marketing',
  FINANCE: '/finance',
}

export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  THEME: 'theme',
  LANGUAGE: 'language',
} 