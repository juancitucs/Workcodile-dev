import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { WorkCodileLogo } from './crocodile-icon';
import { toast } from 'sonner@2.0.3';
import {
  Bell,
  MessageCircle,
  Heart,
  TrendingUp,
  Users,
  Award,
  BookOpen,
  X,
  Check,
  Trash2,
  Settings
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export interface Notification {
  id: string;
  type: 'upvote' | 'comment' | 'mention' | 'achievement' | 'follow' | 'post_trending';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    postId?: string;
    userId?: string;
    achievementId?: string;
    avatar?: string;
    username?: string;
  };
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'upvote',
    title: 'Nueva reacción',
    message: 'Carlos Mendoza le dio upvote a tu publicación "Ayuda con Algoritmos"',
    timestamp: new Date(Date.now() - 300000), // 5 min ago
    read: false,
    metadata: {
      username: 'Carlos Mendoza',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    }
  },
  {
    id: '2',
    type: 'comment',
    title: 'Nuevo comentario',
    message: 'Ana Torres comentó en tu publicación sobre Base de Datos',
    timestamp: new Date(Date.now() - 900000), // 15 min ago
    read: false,
    metadata: {
      username: 'Ana Torres',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b72444e5?w=40&h=40&fit=crop&crop=face'
    }
  },
  {
    id: '3',
    type: 'achievement',
    title: '¡Logro desbloqueado!',
    message: 'Has desbloqueado el logro "Comentarista Activo"',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    read: true,
    metadata: {
      achievementId: 'commentator'
    }
  },
  {
    id: '4',
    type: 'post_trending',
    title: 'Publicación en trending',
    message: 'Tu publicación "Proyecto Final de Programación" está en tendencia',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    read: true
  },
  {
    id: '5',
    type: 'follow',
    title: 'Nuevo seguidor',
    message: 'Luis Rodriguez ahora te sigue',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    read: true,
    metadata: {
      username: 'Luis Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    }
  }
];

const notificationIcons = {
  upvote: Heart,
  comment: MessageCircle,
  mention: Bell,
  achievement: Award,
  follow: Users,
  post_trending: TrendingUp
};

const notificationColors = {
  upvote: 'text-red-500 bg-red-500/10',
  comment: 'text-blue-500 bg-blue-500/10',
  mention: 'text-yellow-500 bg-yellow-500/10',
  achievement: 'text-purple-500 bg-purple-500/10',
  follow: 'text-green-500 bg-green-500/10',
  post_trending: 'text-orange-500 bg-orange-500/10'
};

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notificación eliminada');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <Bell className="h-6 w-6 text-primary" />
              <div>
                <h2 className="font-semibold">Notificaciones</h2>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} sin leer
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex space-x-2 p-4 border-b border-border">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="flex-1"
            >
              Todas ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
              className="flex-1"
            >
              Sin leer ({unreadCount})
            </Button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64 text-center p-6"
              >
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">
                  {filter === 'unread' ? 'No hay notificaciones sin leer' : 'No hay notificaciones'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {filter === 'unread' 
                    ? '¡Estás al día! 🎉' 
                    : 'Las notificaciones aparecerán aquí'
                  }
                </p>
              </motion.div>
            ) : (
              <div className="space-y-1">
                {filteredNotifications.map((notification, index) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={() => markAsRead(notification.id)}
                    onDelete={() => deleteNotification(notification.id)}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: () => void;
  onDelete: () => void;
  index: number;
}

function NotificationItem({ notification, onMarkAsRead, onDelete, index }: NotificationItemProps) {
  const Icon = notificationIcons[notification.type];
  const colorClasses = notificationColors[notification.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative p-4 border-b border-border transition-colors hover:bg-muted/30 ${
        !notification.read ? 'bg-primary/5' : ''
      }`}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute left-2 top-6 w-2 h-2 bg-primary rounded-full"
        />
      )}

      <div className="flex items-start space-x-3 pl-4">
        {/* Icon or Avatar */}
        <div className={`p-2 rounded-full ${colorClasses}`}>
          {notification.metadata?.avatar ? (
            <Avatar className="h-6 w-6">
              <AvatarImage src={notification.metadata.avatar} />
              <AvatarFallback>
                <WorkCodileLogo className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <Icon className="h-4 w-4" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-1">{notification.title}</h4>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(notification.timestamp, { 
                  addSuffix: true, 
                  locale: es 
                })}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 ml-2">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkAsRead}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Notification Bell Component for Header
interface NotificationBellProps {
  onClick: () => void;
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const [notifications] = useState<Notification[]>(mockNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </Button>
    </motion.div>
  );
}

// Enhanced Toast Notifications
export const showNotificationToast = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
  const Icon = notificationIcons[notification.type];
  
  toast.success(notification.title, {
    description: notification.message,
    duration: 4000,
    icon: <Icon className="h-4 w-4" />,
    action: notification.actionUrl ? {
      label: "Ver",
      onClick: () => {
        // Navigate to the action URL
        console.log('Navigate to:', notification.actionUrl);
      }
    } : undefined,
  });
};