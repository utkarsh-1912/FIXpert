
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FixpertIcon } from '@/components/icons';
import { menuItems } from '@/config/nav';
import { ArrowRight, Star, Sparkles, MoreHorizontal, TrendingUp, Cpu, Bot, FileCheck2 } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    icon: Bot,
    title: 'AI-Powered Analysis',
    description: 'Leverage generative AI to interpret raw FIX messages, generate workflow diagrams from text, and get expert answers from an AI assistant trained on the FIX protocol.',
  },
  {
    icon: FileCheck2,
    title: 'Comprehensive Log Management',
    description: 'Parse, filter, and analyze large log files instantly. Merge and chronologically sort multiple files to create a single, unified view of your message flow.',
  },
  {
    icon: Cpu,
    title: 'Real-Time Market Data',
    description: 'Search for real-time trading symbols from Yahoo Finance. Get detailed quotes, historical price charts, and AI-generated financial insights for any stock.',
  },
];

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
    avatar: '/avatars/david.jpg',
  },
  {
    name: 'David L.',
    role: 'Senior Trading Systems Developer',
    quote: 'The workflow visualizer is pure genius. Being able to generate a clear diagram from a simple description is incredibly powerful for documentation and training.',
    avatar: '/avatars/samantha.jpg',
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
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
          <div className="mx-auto grid grid-cols-1 items-center gap-8 px-4 text-center md:grid-cols-2 sm:px-6 lg:px-8 md:text-left">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl">
                The Ultimate FIX Protocol Toolkit for Financial Engineers
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                From AI-powered interpretation to advanced log analysis, FIXpert provides the clarity and speed you need to master the world of financial data exchange.
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
                src="https://picsum.photos/seed/networks/600/400"
                width={600}
                height={400}
                alt="FIX Protocol Visualization"
                className="rounded-xl shadow-2xl"
                data-ai-hint="computer networks"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-32">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Why FIXpert?</h2>
              <p className="mt-4 text-muted-foreground">FIXpert is more than just a set of tools; it's a productivity platform designed to streamline your entire FIX-based workflow.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col items-center text-center gap-4 p-4">
                  <div className="rounded-full bg-primary/10 p-4 text-primary">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Toolkit Section */}
        <section id="toolkit" className="w-full bg-muted/30 py-20 md:py-32">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our Toolkit</h2>
              <p className="mt-4 text-muted-foreground">FIXpert is a comprehensive suite of tools designed to handle every aspect of the FIX protocol, from development and testing to analysis and support.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {menuItems.filter(item => item.href !== '/dashboard').slice(0, 6).map((tool) => (
                <Card key={tool.href} className="flex flex-col p-6 transition-transform hover:-translate-y-1 hover:shadow-primary/20 hover:shadow-lg">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="rounded-lg bg-primary/10 p-3 text-primary">
                      <tool.icon className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold">{tool.label}</h3>
                        {tool.isAiPowered && <Sparkles className="h-5 w-5 text-primary animate-sparkle" />}
                    </div>
                  </div>
                  <p className="flex-1 text-muted-foreground">{tool.description}</p>
                </Card>
              ))}
                <div className="lg:col-span-3 flex items-center justify-center gap-4 py-4 text-center">
                    <MoreHorizontal className="h-6 w-6 text-muted-foreground" />
                    <p className="text-muted-foreground">And many more tools...</p>
                </div>
            </div>
          </div>
        </section>

        {/* Market Data Section */}
        <section className="w-full py-20 md:py-32">
          <div className="mx-auto grid grid-cols-1 items-center gap-12 px-4 md:grid-cols-2 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-center">
              <Image
                src="https://picsum.photos/seed/economy/600/400"
                width={600}
                height={400}
                alt="Market Data Analysis"
                className="rounded-xl shadow-2xl"
                data-ai-hint="financial economy"
              />
            </div>
            <div className="space-y-6">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                Market Insights
              </div>
              <h2 className="text-3xl font-bold tracking-tighter text-foreground sm:text-4xl">
                Stay Ahead of the Market
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Integrate real-time market data directly into your workflow. Look up symbols, analyze trends, and get the financial insights you need without switching context.
              </p>
              <Button size="lg" variant="outline" asChild>
                <Link href="/symbol-search">
                  Explore Market Data <TrendingUp className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>


        {/* Testimonials Section */}
        <section className="w-full bg-muted/30 py-20 md:py-32">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Loved by Engineers and Analysts</h2>
              <p className="mt-4 text-muted-foreground">See how financial engineers, QA testers, and support analysts are leveraging FIXpert to enhance their workflows.</p>
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
        <section className="relative w-full py-20 md:py-32 overflow-hidden">
             <div 
                className="absolute inset-0 z-0 opacity-10"
                style={{
                    backgroundImage: 'radial-gradient(circle at center, hsl(var(--primary)) 1px, transparent 1px), radial-gradient(circle at center, hsl(var(--primary)) 1px, transparent 1px)',
                    backgroundSize: '2rem 2rem',
                }}
            ></div>
          <div className="relative z-10 mx-auto px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Unlock Your Full Potential</h2>
              <p className="mt-4 text-muted-foreground">Sign up for free and gain immediate access to a smarter way of working with the FIX protocol. No credit card required.</p>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link href="/login">Sign Up Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t">
        <div className="mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 text-center md:flex-row sm:px-6 lg:px-8">
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
