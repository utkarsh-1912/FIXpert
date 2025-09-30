'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Chrome, Github, MessageSquare, Mic, User } from 'lucide-react';
import { FixpertIcon } from '@/components/icons';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15.5 10.2c.3-.2.6-.4.8-.7.2-.3.4-.6.5-1h-6.8v3.4h3.9c-.2.6-.5 1.1-.9 1.6-.4.5-.9.9-1.5 1.1v2.8h3.6c2-1.9 3.2-4.7 3.2-7.8z"/><path d="M9 18c2.4 0 4.5-.8 6-2.2l-3.6-2.8c-.8.5-1.8.9-2.9.9-2.2 0-4-1.5-4.7-3.5H2.2v2.8C3.7 15.9 6.2 18 9 18z"/><path d="M2.2 10.7v2.8c1.5-4 4.8-6.7 9.1-6.7 2.6 0 4.9 1 6.4 2.6l2.1-2.1C15.8 1.4 12.6 0 9 0 5.4 0 2.2 2.2 1 5.5L2.2 10.7z"/></svg>
);
  
const MicrosoftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2v10h10V2zM2 12h10v10H2zm10 0h10v10H12zM2 2h10v10H2z"/></svg>
);


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth();

  const handleAuth = async (isLogin: boolean) => {
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      toast({ title: isLogin ? 'Login Successful' : 'Signup Successful' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Authentication Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github' | 'microsoft') => {
    setIsSubmitting(true);
    let authProvider;
    switch(provider) {
        case 'google': authProvider = new GoogleAuthProvider(); break;
        case 'github': authProvider = new GithubAuthProvider(); break;
        case 'microsoft': authProvider = new OAuthProvider('microsoft.com'); break;
    }

    try {
      await signInWithPopup(auth, authProvider);
      toast({ title: 'Login Successful' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Authentication Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex items-center gap-2">
            <FixpertIcon className="size-8 text-primary" />
            <CardTitle className="text-3xl">FIXpert</CardTitle>
        </div>
        <CardDescription>
          Your all-in-one toolkit for the FIX Protocol.
        </CardDescription>
      </CardHeader>
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" onClick={() => handleAuth(true)} disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
            <p className="text-xs text-muted-foreground">Or continue with</p>
            <div className="grid grid-cols-3 gap-2 w-full">
                <Button variant="outline" onClick={() => handleOAuth('google')} disabled={isSubmitting}><GoogleIcon className="mr-2"/> Google</Button>
                <Button variant="outline" onClick={() => handleOAuth('github')} disabled={isSubmitting}><Github className="mr-2"/> GitHub</Button>
                <Button variant="outline" onClick={() => handleOAuth('microsoft')} disabled={isSubmitting}><MicrosoftIcon className="mr-2"/> Microsoft</Button>
            </div>
          </CardFooter>
        </TabsContent>
        <TabsContent value="signup">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
           <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" onClick={() => handleAuth(false)} disabled={isSubmitting}>
              {isSubmitting ? 'Signing up...' : 'Create Account'}
            </Button>
             <p className="text-xs text-muted-foreground">Or continue with</p>
            <div className="grid grid-cols-3 gap-2 w-full">
                <Button variant="outline" onClick={() => handleOAuth('google')} disabled={isSubmitting}><GoogleIcon className="mr-2"/> Google</Button>
                <Button variant="outline" onClick={() => handleOAuth('github')} disabled={isSubmitting}><Github className="mr-2"/> GitHub</Button>
                <Button variant="outline" onClick={() => handleOAuth('microsoft')} disabled={isSubmitting}><MicrosoftIcon className="mr-2"/> Microsoft</Button>
            </div>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
