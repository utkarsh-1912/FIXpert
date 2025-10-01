
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { menuItems } from '@/config/nav';
import { useAuth } from '@/hooks/use-auth.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAuth, signOut } from 'firebase/auth';
import { getFirebaseApp } from '@/lib/firebase';
import { LogOut, Settings, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NotificationBell } from './notification-bell';

export function AppHeader() {
  const pathname = usePathname();
  const currentItem = menuItems.find(item => pathname.startsWith(item.href) && item.href !== '/') ?? menuItems.find(i => i.href === '/dashboard');
  const title = currentItem ? currentItem.label : 'Dashboard';
  const isAiPowered = currentItem?.isAiPowered ?? false;
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const auth = getAuth(getFirebaseApp());
    await signOut(auth);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold sm:text-xl">{title}</h1>
        {isAiPowered && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Sparkles className="h-5 w-5 text-primary/80" />
              </TooltipTrigger>
              <TooltipContent>
                <p>This feature is powered by Generative AI.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <NotificationBell />
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
                  <AvatarFallback>{user.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName ?? 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                  <Link href="/settings"><Settings className="mr-2 h-4 w-4"/>Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

    