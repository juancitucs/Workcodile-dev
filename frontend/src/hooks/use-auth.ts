import { Dispatch, SetStateAction } from 'react'
import { User } from '../components/types'
import { API_BASE_URL } from './api-constants'

interface UseAuthParams {
  setUser: Dispatch<SetStateAction<User | null>>
  setAuthStatus: Dispatch<SetStateAction<'loading' | 'authenticated' | 'unauthenticated'>>
  setNotifications: Dispatch<SetStateAction<any[]>>
  setTheme: (theme: 'light' | 'dark') => void
}

export function useAuthActions({ setUser, setAuthStatus, setNotifications, setTheme }: UseAuthParams) {
  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.msg || 'Error al iniciar sesion')
    }

    const { token, user: userData } = await response.json()
    localStorage.setItem('token', token)
    setUser(userData)
    if (userData.theme) setTheme(userData.theme)
    setAuthStatus('authenticated')
  }

  const sendVerificationCode = async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/send-verification-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.msg || 'Error al enviar el codigo de verificacion')
    return data
  }

  const verifyAndRegister = async (email: string, password: string, verificationCode: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-and-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, verificationCode }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.msg || 'Error al verificar el codigo o registrar el usuario')

    const { token, user: userData } = data
    localStorage.setItem('token', token)
    setUser(userData)
    if (userData.theme) setTheme(userData.theme)
    setAuthStatus('authenticated')
    return data
  }

  const forgotPassword = async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.msg || 'Error al enviar el correo de recuperacion')
    return data
  }

  const resetPassword = async (code: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, password }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.msg || 'Error al restablecer la contrasena')
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setAuthStatus('unauthenticated')
    setNotifications([])
  }

  const loadUser = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setAuthStatus('unauthenticated')
      return
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'x-auth-token': token },
      })
      if (!response.ok) {
        logout()
        setAuthStatus('unauthenticated')
        return
      }
      const userData = await response.json()
      setUser(userData)
      if (userData.theme) setTheme(userData.theme)
      setAuthStatus('authenticated')
    } catch {
      logout()
      setAuthStatus('unauthenticated')
    }
  }

  const updateTheme = async (newTheme: 'light' | 'dark') => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      await fetch(`${API_BASE_URL}/api/auth/user/theme`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ theme: newTheme }),
      })
    } catch (error) {
      console.error('Failed to update theme:', error)
    }
  }

  return {
    login,
    sendVerificationCode,
    verifyAndRegister,
    forgotPassword,
    resetPassword,
    logout,
    loadUser,
    updateTheme,
  }
}
