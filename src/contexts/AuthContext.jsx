import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  extractToken,
  login as loginApi,
  logout as logoutApi,
  refreshToken as refreshTokenApi,
  register as registerApi,
} from '../services/authService'
import { getMyProfile } from '../services/userService'
import { AUTH_STORAGE_KEYS, resolveRoleValue, USER_ROLES } from '../constants'

const AuthContext = createContext(null)

function normalizeRole(profile) {
  return resolveRoleValue(profile)
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN) || '')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)

  const role = useMemo(() => normalizeRole(profile), [profile])
  const isAdmin = role === USER_ROLES.ADMIN

  useEffect(() => {
    if (token) {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token)
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
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
    [
      token,
      profile,
      role,
      isAdmin,
      loading,
      loadProfile,
      register,
      login,
      logout,
      refreshToken,
    ],
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
