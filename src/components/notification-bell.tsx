
'use client';

import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationStore } from '@/stores/notification-store';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export function NotificationBell() {
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearAll();
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 md:w-96" align="end">
        <DropdownMenuLabel className="flex items-center justify-between p-3">
          <span className="font-semibold">Notifications</span>
          <div className="flex items-center gap-2">
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
                            <CheckCheck className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Mark all as read</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <Button variant="ghost" size="sm" className="text-xs" onClick={handleClearAll} disabled={notifications.length === 0}>
              Clear all
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[40vh]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <Bell className="h-10 w-10 mb-4" />
                <p className="text-sm">You have no new notifications.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                onSelect={() => markAsRead(notif.id)}
                className="flex items-start gap-4 p-3 cursor-pointer focus:bg-accent/50"
                style={{whiteSpace: 'normal', display: 'flex', alignItems: 'flex-start'}}
              >
                {!notif.read && (
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                )}
                <div className={cn("flex items-start gap-3 w-full", notif.read ? 'pl-4' : '')}>
                    <notif.icon className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                    <div className="flex-1 space-y-1">
                        <p className="font-medium text-sm text-foreground">{notif.title}</p>
                        <p className="text-xs text-muted-foreground">{notif.description}</p>
                         <p className="text-xs text-muted-foreground/80 pt-1">
                            {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                        </p>
                    </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
