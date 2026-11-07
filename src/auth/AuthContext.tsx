import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from './types'
import { getCurrentUser, logout as apiLogout } from './api'

interface AuthContextType {
  user: User | null
  setUser: (u: User | null) => void
  logout: () => void
  refresh: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getCurrentUser())

  useEffect(() => {
    // 每次挂载检查（封禁过期自动解封等）
    setUser(getCurrentUser())
  }, [])

  const logout = () => {
    apiLogout()
    setUser(null)
  }

  const refresh = () => {
    setUser(getCurrentUser())
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
