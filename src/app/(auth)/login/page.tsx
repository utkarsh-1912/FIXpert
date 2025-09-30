'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier
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
import { useToast } from '@/hooks/use-toast';
import { FixpertIcon } from '@/components/icons';
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'


declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
        confirmationResult: any;
    }
}

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.72 1.9-4.26 0-7.72-3.36-7.72-7.5s3.46-7.5 7.72-7.5c2.38 0 4.02 1.02 4.94 1.9l2.82-2.82C18.46 2.18 15.82 1 12.48 1 7.02 1 3 5.02 3 10.5s4.02 9.5 9.48 9.5c2.86 0 5.06-1 6.6-2.6 1.74-1.74 2.38-4.26 2.38-6.58 0-.6-.05-1.15-.15-1.68z"/>
    </svg>
);

const LoginForm = ({ onSwitch, handleAuth, handleOAuth, email, setEmail, password, setPassword, isSubmitting }: any) => (
    <>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <Input id="login-email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password">Password</Label>
          <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button className="w-full" onClick={() => handleAuth(true)} disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
        <div className="text-center text-sm">
            Don't have an account?{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => onSwitch('signup')}>
              Sign up
            </Button>
        </div>
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
        </div>
        <Button variant="outline" onClick={() => handleOAuth('google')} disabled={isSubmitting} className="w-full"><GoogleIcon className="mr-2 h-4 w-4"/> Google</Button>
      </CardFooter>
    </>
);

const SignupForm = ({ onSwitch, handleAuth, handleOAuth, email, setEmail, password, setPassword, isSubmitting }: any) => (
    <>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input id="signup-email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button className="w-full" onClick={() => handleAuth(false)} disabled={isSubmitting}>
          {isSubmitting ? 'Signing up...' : 'Create Account'}
        </Button>
        <div className="text-center text-sm">
            Already have an account?{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => onSwitch('login')}>
              Sign in
            </Button>
        </div>
         <div className="relative w-full">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
        </div>
        <Button variant="outline" onClick={() => handleOAuth('google')} disabled={isSubmitting} className="w-full"><GoogleIcon className="mr-2 h-4 w-4"/> Google</Button>
      </CardFooter>
    </>
);

const PhoneForm = ({ isSubmitting, phone, setPhone, otp, setOtp, otpSent, handlePhoneAuth, handleOtpVerify }: any) => (
    <>
    <CardContent className="space-y-4 pt-6">
        {!otpSent ? (
            <div className="space-y-2">
            <Label htmlFor="phone-number">Phone Number</Label>
            <PhoneInput
                country={'us'}
                value={phone}
                onChange={setPhone}
                inputProps={{
                    name: 'phone-number',
                    required: true,
                    autoFocus: true,
                    className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                }}
                containerClass="w-full"
            />
            </div>
        ) : (
            <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
            />
            </div>
        )}
    </CardContent>
    <CardFooter>
        {!otpSent ? (
            <Button className="w-full" onClick={handlePhoneAuth} disabled={isSubmitting || !phone}>
            {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
            </Button>
        ) : (
            <Button className="w-full" onClick={handleOtpVerify} disabled={isSubmitting || !otp}>
            {isSubmitting ? 'Verifying...' : 'Verify & Login'}
            </Button>
        )}
    </CardFooter>
    </>
);


export default function LoginPage() {
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth(app);
  
  const handleSwitchMode = (mode: string) => {
    setAuthMode(mode);
    setEmail('');
    setPassword('');
  }

  const handleAuth = async (isLogin: boolean) => {
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      toast({ title: isLogin ? 'Login Successful' : 'Signup Successful' });
      router.push('/');
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

  const handleOAuth = async (provider: 'google') => {
    setIsSubmitting(true);
    let authProvider;
    switch(provider) {
        case 'google': authProvider = new GoogleAuthProvider(); break;
    }

    try {
      await signInWithPopup(auth, authProvider);
      toast({ title: 'Login Successful' });
      router.push('/');
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

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }

  const handlePhoneAuth = async () => {
      setIsSubmitting(true);
      try {
        setupRecaptcha();
        const appVerifier = window.recaptchaVerifier;
        const confirmationResult = await signInWithPhoneNumber(auth, `+${phone}`, appVerifier);
        window.confirmationResult = confirmationResult;
        setOtpSent(true);
        toast({ title: 'OTP Sent', description: 'Enter the code sent to your phone.' });
      } catch (error: any) {
         toast({
            title: 'Phone Authentication Failed',
            description: error.message,
            variant: 'destructive',
      });
      } finally {
          setIsSubmitting(false);
      }
  }

  const handleOtpVerify = async () => {
      setIsSubmitting(true);
      try {
          await window.confirmationResult.confirm(otp);
          toast({ title: 'Login Successful' });
          router.push('/');
      } catch (error: any) {
          toast({
            title: 'OTP Verification Failed',
            description: error.message,
            variant: 'destructive',
          });
      } finally {
          setIsSubmitting(false);
      }
  }

  const commonProps = {
      onSwitch: handleSwitchMode,
      handleAuth,
      handleOAuth,
      email,
      setEmail,
      password,
      setPassword,
      isSubmitting,
  };

  const phoneProps = {
      isSubmitting,
      phone,
      setPhone,
      otp,
      setOtp,
      otpSent,
      handlePhoneAuth,
      handleOtpVerify
  };

  return (
    <Card className="w-full max-w-md">
      <div id="recaptcha-container"></div>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex items-center gap-2">
            <FixpertIcon className="size-8 text-primary" />
            <CardTitle className="text-3xl">FIXpert</CardTitle>
        </div>
        <CardDescription>
          {authMode === 'login' && 'Sign in to your account'}
          {authMode === 'signup' && 'Create a new account to get started'}
          {authMode === 'phone' && 'Sign in using your phone number'}
        </CardDescription>
      </CardHeader>
      
      {authMode === 'login' && <LoginForm {...commonProps} />}
      {authMode === 'signup' && <SignupForm {...commonProps} />}
      {authMode === 'phone' && <PhoneForm {...phoneProps} />}
    </Card>
  );
}
