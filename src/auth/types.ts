// 用户角色
export type Role = 'owner' | 'admin' | 'user' | 'banned'

export interface User {
  id: string
  username: string
  email: string
  passwordHash: string // mock 里存明文方便演示
  role: Role
  createdAt: number
  // 封禁字段
  bannedUntil?: number  // 时间戳（ms），-1 表示永久封禁
  bannedReason?: string
}

export interface Session {
  token: string
  userId: string
  loginAt: number
}

export interface VerificationCode {
  email: string
  code: string
  purpose: 'register' | 'reset'
  expiresAt: number  // timestamp ms
  verified?: boolean
}
