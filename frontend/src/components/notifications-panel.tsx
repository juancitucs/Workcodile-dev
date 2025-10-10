import { useApp } from './app-context';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function NotificationsPanel() {
  const { notifications } = useApp();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2 font-medium">Notificaciones</div>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {notifications.map(notification => (
            <DropdownMenuItem key={notification.id} className={`flex items-start p-2 ${!notification.read ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}>
              <div className={`h-2 w-2 rounded-full mt-1.5 mr-2 ${!notification.read ? 'bg-primary' : 'bg-transparent'}`} />
              <div>
                <p className="text-sm">{notification.text}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: es })}
                </p>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        {notifications.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No tienes notificaciones nuevas.
          </div>
        )}
        <DropdownMenuSeparator />
        <div className="p-2 flex justify-center">
          <Button variant="link" size="sm">Ver todas las notificaciones</Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
