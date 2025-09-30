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
import { app } from '@/lib/firebase';
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
import { Github } from 'lucide-react';
import { FixpertIcon } from '@/components/icons';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.72 1.9-4.26 0-7.72-3.36-7.72-7.5s3.46-7.5 7.72-7.5c2.38 0 4.02 1.02 4.94 1.9l2.82-2.82C18.46 2.18 15.82 1 12.48 1 7.02 1 3 5.02 3 10.5s4.02 9.5 9.48 9.5c2.86 0 5.06-1 6.6-2.6 1.74-1.74 2.38-4.26 2.38-6.58 0-.6-.05-1.15-.15-1.68z"/>
    </svg>
);
  
const MicrosoftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M11.5 2h-9v9h9V2zm-1.5 7.5h-6v-6h6v6zm11-7.5h-9v9h9V2zm-1.5 7.5h-6v-6h6v6zm-9.5 2h-9v9h9v-9zm-1.5 7.5h-6v-6h6v6zm11-7.5h-9v9h9v-9zm-1.5 7.5h-6v-6h6v6z"/>
    </svg>
);


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth(app);

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
          Sign in or create an account to access the tools.
        </CardDescription>
      </CardHeader>
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <CardContent className="space-y-4 pt-6">
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
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
                <Button variant="outline" onClick={() => handleOAuth('google')} disabled={isSubmitting}><GoogleIcon className="mr-2 h-4 w-4"/> Google</Button>
                <Button variant="outline" onClick={() => handleOAuth('github')} disabled={isSubmitting}><Github className="mr-2 h-4 w-4"/> GitHub</Button>
                <Button variant="outline" onClick={() => handleOAuth('microsoft')} disabled={isSubmitting}><MicrosoftIcon className="mr-2 h-4 w-4"/> Microsoft</Button>
            </div>
          </CardFooter>
        </TabsContent>
        <TabsContent value="signup">
          <CardContent className="space-y-4 pt-6">
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
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
                <Button variant="outline" onClick={() => handleOAuth('google')} disabled={isSubmitting}><GoogleIcon className="mr-2 h-4 w-4"/> Google</Button>
                <Button variant="outline" onClick={() => handleOAuth('github')} disabled={isSubmitting}><Github className="mr-2 h-4 w-4"/> GitHub</Button>
                <Button variant="outline" onClick={() => handleOAuth('microsoft')} disabled={isSubmitting}><MicrosoftIcon className="mr-2 h-4 w-4"/> Microsoft</Button>
            </div>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
