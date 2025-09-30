
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FixpertIcon } from '@/components/icons';
import { ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { menuItems } from '@/config/nav';

export default function LandingPage() {
  const features = menuItems.filter(item => item.href !== '/dashboard');

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <FixpertIcon className="size-7 text-primary" />
            <span className="text-xl font-bold">FIXpert</span>
          </Link>
          <Button asChild>
            <Link href="/login">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              The Ultimate Toolkit for the FIX Protocol
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              FIXpert provides a comprehensive suite of tools to interpret, analyze, compare, and visualize FIX messages, making your workflow seamless and efficient.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/login">Access Your Dashboard</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-card/50 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">Powerful Features at Your Fingertips</h2>
              <p className="mt-2 text-muted-foreground">Everything you need to master the FIX protocol.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.label} className="text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="size-6" />
                    </div>
                    <CardTitle>{feature.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} FIXpert. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
