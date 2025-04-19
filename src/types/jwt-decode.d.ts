declare module 'jwt-decode' {
  export interface JwtPayload {
    [key: string]: any
    iss?: string
    sub?: string
    aud?: string | string[]
    exp?: number
    nbf?: number
    iat?: number
    jti?: string
  }

  interface JwtDecodeOptions {
    header?: boolean
  }

  class InvalidTokenError extends Error {
    name: 'InvalidTokenError'
  }

  function jwtDecode<T = JwtPayload>(token: string, options?: JwtDecodeOptions): T

  export { jwtDecode, InvalidTokenError }
} 