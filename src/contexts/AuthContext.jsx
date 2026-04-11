import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  extractToken,
  login as loginApi,
  logout as logoutApi,
  refreshToken as refreshTokenApi,
  register as registerApi,
} from '../services/authService'
import { getMyProfile } from '../services/userService'

const AuthContext = createContext(null)
const TOKEN_KEY = 'synex_access_token'

function normalizeRole(profile) {
  return String(profile?.role || profile?.userRole || 'USER')
    .replace('ROLE_', '')
    .toUpperCase()
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || '')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)

  const role = useMemo(() => normalizeRole(profile), [profile])
  const isAdmin = role === 'ADMIN'

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
      setProfile(null)
    }
  }, [token])

  const loadProfile = useCallback(async () => {
    if (!token) {
      setProfile(null)
      return null
    }

    setLoading(true)
    try {
      const data = await getMyProfile(token)
      setProfile(data)
      return data
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!token || profile) return

    let active = true

    async function bootstrapProfile() {
      setLoading(true)
      try {
        const data = await getMyProfile(token)
        if (active) {
          setProfile(data)
        }
      } catch {
        if (active) {
          setToken('')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    bootstrapProfile()

    return () => {
      active = false
    }
  }, [token, profile])

  const register = useCallback(async (payload) => {
    return registerApi(payload)
  }, [])

  const login = useCallback(async (payload) => {
    setLoading(true)
    try {
      const data = await loginApi(payload)
      const nextToken = extractToken(data)
      if (nextToken) {
        setToken(nextToken)
      }
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      if (token) {
        await logoutApi(token)
      }
    } finally {
      setToken('')
    }
  }, [token])

  const refreshToken = useCallback(async () => {
    if (!token) return null
    const data = await refreshTokenApi(token)
    const nextToken = extractToken(data)
    if (nextToken) {
      setToken(nextToken)
    }
    return data
  }, [token])

  const value = useMemo(
    () => ({
      token,
      profile,
      role,
      isAdmin,
      loading,
      isAuthenticated: Boolean(token),
      setToken,
      loadProfile,
      register,
      login,
      logout,
      refreshToken,
    }),
    [token, profile, loading, loadProfile, register, login, logout, refreshToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
