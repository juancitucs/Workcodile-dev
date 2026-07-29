import { Dispatch, SetStateAction } from 'react'
import { Notification } from '../components/types'
import { API_BASE_URL } from './api-constants'
import { transformBackendNotification } from './api-helpers'

interface UseNotificationsParams {
  authStatus: string
  notifications: Notification[]
  setNotifications: Dispatch<SetStateAction<Notification[]>>
}

export function useNotificationActions({ authStatus, notifications, setNotifications }: UseNotificationsParams) {
  const fetchNotifications = async () => {
    const token = localStorage.getItem('token')
    if (authStatus !== 'authenticated' || !token) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: { 'x-auth-token': token },
      })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setNotifications(data.map(transformBackendNotification))
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    const token = localStorage.getItem('token')
    if (!token) return
    const original = notifications
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n))
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'x-auth-token': token },
      })
      if (!response.ok) {
        setNotifications(original)
        throw new Error('Failed to mark notification as read')
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      setNotifications(original)
    }
  }

  const markAllNotificationsAsRead = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    const original = notifications
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/read/all`, {
        method: 'PUT',
        headers: { 'x-auth-token': token },
      })
      if (!response.ok) {
        setNotifications(original)
        throw new Error('Failed to mark all notifications as read')
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      setNotifications(original)
    }
  }

  return { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead }
}
