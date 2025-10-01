
import { FixpertIcon } from '@/components/icons';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-between bg-muted p-8 text-center relative text-white">
        <div className="absolute inset-0">
            <Image
                src="https://picsum.photos/seed/finance/1200/1800"
                alt="Authentication background"
                fill
                className="object-cover"
                data-ai-hint="code finance"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-background/80" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <div className="flex items-center gap-4">
                <FixpertIcon className="size-16" />
                <h1 className="text-5xl font-bold">FIXpert</h1>
            </div>
            <p className="mt-4 text-xl opacity-80">
                The Ultimate FIX Protocol Toolkit for Financial Engineers.
            </p>
        </div>
         <div className="relative z-10 text-center text-sm opacity-60">
            <p>&copy; {new Date().getFullYear()} Utai Inc. All rights reserved.</p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}
