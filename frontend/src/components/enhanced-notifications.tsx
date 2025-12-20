import { useApp } from './app-context'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { Bell, MailCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { getNotificationIcon } from './notification-icons'; // We will create this file

export function EnhancedNotifications() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp()
  const navigate = useNavigate()

  const unreadCount = notifications.filter(n => !n.read).length

  const handleNotificationSelect = (notification: any) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id)
    }
    if (notification.link) {
      navigate(notification.link)
    }
  }

  const groupNotifications = (notifs: any[]) => {
    return notifs.reduce((acc, notification) => {
      const date = new Date(notification.createdAt)
      let group = ''
      if (isToday(date)) {
        group = 'Hoy'
      } else if (isYesterday(date)) {
        group = 'Ayer'
      } else {
        group = format(date, 'd MMMM, yyyy', { locale: es })
      }

      if (!acc[group]) {
        acc[group] = []
      }
      acc[group].push(notification)
      return acc
    }, {} as Record<string, any[]>)
  }

  const allNotificationsGrouped = groupNotifications(notifications)
  const unreadNotificationsGrouped = groupNotifications(notifications.filter(n => !n.read))

  const renderNotificationList = (groupedNotifications: Record<string, any[]>) => {
    const groups = Object.keys(groupedNotifications)
    if (groups.length === 0) {
      return (
        <div className="p-8 text-center text-sm text-muted-foreground">
          No tienes notificaciones.
        </div>
      )
    }
    return (
      <div className="p-4 space-y-4">
        {groups.map(group => (
          <div key={group}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">{group}</h3>
            <div className="space-y-3">
              {groupedNotifications[group].map(notification => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleNotificationSelect(notification)}
                    className={`flex items-start p-4 rounded-2xl transition-all duration-200 border ${!notification.read ? 'bg-primary/5 border-primary/20 shadow-sm' : 'border-transparent hover:bg-muted/50 hover:border-border/50'} ${notification.link ? 'cursor-pointer hover:scale-[1.01]' : ''}`}
                  >
                    <div className={`h-10 w-10 flex-shrink-0 rounded-xl flex items-center justify-center mr-3 transition-colors ${!notification.read ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className="text-sm font-medium leading-relaxed">{notification.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: es })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary self-center ml-3 flex-shrink-0 animate-pulse" />
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full border-2 border-background"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] p-0 flex flex-col">
        <SheetHeader className='p-6 border-b'>
          <SheetTitle>
            Notificaciones
          </SheetTitle>
        </SheetHeader>
        <div className="px-4 py-3 border-b"> {/* Adjusted padding */}
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllNotificationsAsRead} className="w-full">
              <MailCheck className="h-4 w-4 mr-2" />
              Marcar todas como leídas
            </Button>
          )}
        </div>
        <Tabs defaultValue="all" className="flex-1 flex flex-col">
          <TabsList className="flex justify-center mx-auto px-4 pt-4 pb-2 gap-2 h-12"> {/* Added gap and increased height */}
            <TabsTrigger value="all" className="flex items-center justify-center cursor-pointer px-6 py-2">Todas</TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center justify-center cursor-pointer px-6 py-2">
              No leídas {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
          </TabsList>
          <ScrollArea className='flex-1'>
            <TabsContent value="all">
              {renderNotificationList(allNotificationsGrouped)}
            </TabsContent>
            <TabsContent value="unread">
              {renderNotificationList(unreadNotificationsGrouped)}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
