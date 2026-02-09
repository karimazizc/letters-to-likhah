import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { userAuthApi } from '../services/api'

const UserAuthContext = createContext(null)

export function UserAuthProvider({ children }) {
  const [isUserAuth, setIsUserAuth] = useState(null) // null = loading, true/false = resolved

  useEffect(() => {
    const authenticated = userAuthApi.isAuthenticated()
    setIsUserAuth(authenticated)
  }, [])

  const userLogin = useCallback(async (password) => {
    await userAuthApi.login(password)
    setIsUserAuth(true)
  }, [])

  const userLogout = useCallback(() => {
    userAuthApi.logout()
    setIsUserAuth(false)
  }, [])

  const isUserAuthenticated = useCallback(() => {
    return !!localStorage.getItem('user_token')
  }, [])

  const loading = isUserAuth === null

  return (
    <UserAuthContext.Provider value={{ loading, userLogin, userLogout, isUserAuthenticated, isUserAuth }}>
      {children}
    </UserAuthContext.Provider>
  )
}

export function useUserAuth() {
  const context = useContext(UserAuthContext)
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider')
  }
  return context
}
