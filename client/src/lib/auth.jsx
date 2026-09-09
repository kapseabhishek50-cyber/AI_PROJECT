import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, getToken, setToken } from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    ;(async () => {
      if (getToken()) {
        try {
          const { user } = await api('/auth/me')
          setUser(user)
        } catch {
          setToken(null)
        }
      }
      setBooted(true)
    })()
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (payload) => {
    const data = await api('/auth/register', { method: 'POST', body: payload })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' })
    } catch {
      /* ignore */
    }
    setToken(null)
    setUser(null)
  }, [])

  const refresh = useCallback(async () => {
    const { user } = await api('/auth/me')
    setUser(user)
    return user
  }, [])

  return (
    <AuthContext.Provider value={{ user, booted, login, register, logout, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
