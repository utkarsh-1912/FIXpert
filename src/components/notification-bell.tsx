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
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 md:w-96" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
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
            <Button variant="destructive" size="sm" onClick={handleClearAll} disabled={notifications.length === 0}>
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
                className={cn('flex items-start gap-3 p-3 cursor-pointer', !notif.read && 'bg-accent/50')}
                style={{whiteSpace: 'normal', display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}
              >
                <div className='flex items-start gap-3 w-full'>
                    <notif.icon className="h-5 w-5 mt-1 shrink-0 text-primary" />
                    <div className="flex-1 space-y-1">
                        <p className="font-semibold text-sm">{notif.title}</p>
                        <p className="text-xs text-muted-foreground">{notif.description}</p>
                    </div>
                </div>
                <p className={cn("text-xs text-muted-foreground/80 mt-2 w-full text-right", !notif.read && "font-medium")}>
                    {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
