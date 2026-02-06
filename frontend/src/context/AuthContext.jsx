import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuth, setIsAuth] = useState(null) // null = loading, true/false = resolved

  useEffect(() => {
    // Check if token exists on mount
    const authenticated = authApi.isAuthenticated()
    setIsAuth(authenticated)
  }, [])

  const login = useCallback(async (password) => {
    await authApi.login(password)
    setIsAuth(true)
  }, [])

  const logout = useCallback(() => {
    authApi.logout()
    setIsAuth(false)
  }, [])

  const isAuthenticated = useCallback(() => {
    return !!localStorage.getItem('token')
  }, [])

  const loading = isAuth === null

  return (
    <AuthContext.Provider value={{ loading, login, logout, isAuthenticated, isAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
