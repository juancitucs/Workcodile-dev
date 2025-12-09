import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Notification } from './types'; // Assuming Notification type is defined here
import { useAuth } from './auth-context'; // Import useAuth to get the token

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper functions (moved from app-context.tsx)
const transformBackendNotification = (notification: any): Notification => ({
  id: notification._id,
  type: notification.type, // Assuming type is directly available
  title: notification.title, // Assuming title is directly available
  message: notification.message, // Assuming message is directly available
  timestamp: new Date(notification.createdAt),
  read: notification.read,
  actionUrl: notification.link, // Assuming link corresponds to actionUrl
  metadata: notification.metadata, // Assuming metadata is directly available
});


interface NotificationsContextType {
  notifications: Notification[];
  markNotificationAsRead: (notificationId: string) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { authStatus } = useAuth(); // Get authStatus from AuthContext
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      if (authStatus === 'authenticated' && token) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/notifications`, {
            headers: {
              'x-auth-token': token,
            },
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          const transformedNotifications: Notification[] = data.map(transformBackendNotification);
          setNotifications(transformedNotifications);
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
        }
      } else {
        setNotifications([]); // Clear notifications if unauthenticated
      }
    };

    fetchNotifications();
  }, [authStatus]); // Dependency on authStatus


  const markNotificationAsRead = async (notificationId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        markNotificationAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
