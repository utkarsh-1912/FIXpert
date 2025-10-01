
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Cookie } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const COOKIE_CONSENT_KEY = 'fixpert-cookie-consent';

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        setIsVisible(true);
      }
    } catch (error) {
      // localStorage is not available
      console.error("Could not access localStorage for cookie consent.", error);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
      setIsVisible(false);
    } catch (error) {
      console.error("Could not save cookie consent to localStorage.", error);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };
  
  if (!isMounted || !isVisible) {
    return null;
  }

  return (
    <div className={cn(
        "fixed bottom-0 left-0 right-0 z-[100] p-4 transition-transform duration-500",
        isVisible ? "translate-y-0" : "translate-y-full"
    )}>
        <Card className="max-w-4xl mx-auto shadow-2xl">
            <CardContent className="flex items-center justify-between flex-wrap gap-4 p-4">
                <div className="flex items-center gap-3">
                    <Cookie className="h-6 w-6 text-primary shrink-0" />
                    <p className="text-sm text-muted-foreground">
                        We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
                        <Link href="/privacy" className="ml-1 underline hover:text-primary">Learn more</Link>.
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Button onClick={handleAccept} size="sm">Accept</Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleClose}>
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
