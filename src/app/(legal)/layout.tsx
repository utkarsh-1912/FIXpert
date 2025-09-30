
import { FixpertIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <FixpertIcon className="size-8 text-primary" />
            <span className="text-xl font-bold text-foreground">FIXpert</span>
          </Link>
          <Button variant="outline" asChild>
            <Link href="/login">Back to App</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 sm:px-6 md:py-20 lg:px-8">
            {children}
        </div>
      </main>

      <footer className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 text-center md:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <FixpertIcon className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} FIXpert. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
