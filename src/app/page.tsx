
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FixpertIcon } from '@/components/icons';
import { menuItems } from '@/config/nav';
import { ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Alex T.',
    role: 'Quantitative Analyst',
    quote: 'The AI interpreter is a game-changer. It saves me hours of manually looking up FIX tags. I can\'t imagine my workflow without it now.',
    avatar: '/avatars/alex.jpg',
  },
  {
    name: 'Samantha K.',
    role: 'FIX Onboarding Specialist',
    quote: 'FIXpert\'s comparator and log processor have streamlined our client onboarding process. We can identify and resolve issues in minutes, not hours.',
    avatar: '/avatars/samantha.jpg',
  },
  {
    name: 'David L.',
    role: 'Senior Trading Systems Developer',
    quote: 'The workflow visualizer is pure genius. Being able to generate a clear diagram from a simple description is incredibly powerful for documentation and training.',
    avatar: '/avatars/david.jpg',
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <FixpertIcon className="size-8 text-primary" />
            <span className="text-xl font-bold text-foreground">FIXpert</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40">
          <div className="container mx-auto grid grid-cols-1 items-center gap-8 px-4 text-center md:grid-cols-2 sm:px-6 lg:px-8 md:text-left">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl">
                The Ultimate FIX Protocol Toolkit
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Decode, analyze, compare, and visualize FIX messages with an AI-powered suite of tools designed for financial engineers.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
                <Button size="lg" asChild>
                  <Link href="/login">Get Started for Free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">Explore Features</Link>
                </Button>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
               <Image 
                src="https://picsum.photos/seed/fixprotocol/600/400"
                width={600}
                height={400}
                alt="FIX Protocol Visualization"
                className="rounded-xl shadow-2xl"
                data-ai-hint="financial data abstract"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full bg-muted/30 py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Everything You Need for FIX Development</h2>
              <p className="mt-4 text-muted-foreground">From AI-powered interpretation to side-by-side comparisons, FIXpert has you covered.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {menuItems.filter(item => item.href !== '/dashboard').map((tool) => (
                <Card key={tool.href} className="flex flex-col p-6 transition-transform hover:-translate-y-1 hover:shadow-primary/20 hover:shadow-lg">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="rounded-lg bg-primary/10 p-3 text-primary">
                      <tool.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold">{tool.label}</h3>
                  </div>
                  <p className="flex-1 text-muted-foreground">{tool.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Loved by Financial Engineers Worldwide</h2>
              <p className="mt-4 text-muted-foreground">Don't just take our word for it. Here's what professionals are saying about FIXpert.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name}>
                  <CardHeader className='pb-4'>
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12">
                        <Image src={`https://picsum.photos/seed/${testimonial.name.replace(/\s/g, '')}/48/48`} alt={testimonial.name} fill className="rounded-full" data-ai-hint="person portrait"/>
                      </div>
                      <div>
                        <CardTitle className="text-base">{testimonial.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-0.5 mb-2">
                        {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-accent text-accent" />)}
                    </div>
                    <p className="text-muted-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full bg-muted/30 py-20 md:py-32">
          <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Ready to Supercharge Your FIX Workflow?</h2>
              <p className="mt-4 text-muted-foreground">Sign up today and get instant access to the entire suite of FIXpert tools. No credit card required.</p>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link href="/login">Sign Up Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 text-center md:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <FixpertIcon className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} FIXpert. All rights reserved.</p>
          </div>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
