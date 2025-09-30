'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { menuItems } from '@/config/nav';

export function AppHeader() {
  const pathname = usePathname();
  const currentItem = menuItems.find(item => item.href === pathname);
  const title = currentItem ? currentItem.label : 'FIXpert';

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-lg font-semibold sm:text-xl">{title}</h1>
    </header>
  );
}
