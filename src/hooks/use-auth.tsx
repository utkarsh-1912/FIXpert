'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirebaseApp } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useNotificationStore } from '@/stores/notification-store';
import { User as UserIcon } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

const AUTH_PAGES = ['/login'];
const PUBLIC_PAGES: string[] = ['/', '/terms', '/privacy', '/contact']; // The new landing page is public

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    const auth = getAuth(getFirebaseApp());
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Check if it's a new user
        const { creationTime, lastSignInTime } = user.metadata;
        if (creationTime && lastSignInTime && (new Date(lastSignInTime).getTime() - new Date(creationTime).getTime() < 5000)) {
           addNotification({
            icon: UserIcon,
            title: 'Welcome to FIXpert!',
            description: 'We are glad to have you here. Explore the tools and start mastering FIX.',
          });
        }
      }
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = AUTH_PAGES.some(p => pathname.startsWith(p));
    const isPublicPage = PUBLIC_PAGES.some(p => pathname.startsWith(p));

    // If the user is not logged in and not on a public/auth page, redirect to the landing page.
    if (!user && !isAuthPage && !isPublicPage) {
      router.push('/');
    }
    
    // If the user is logged in and on an auth page (like /login) or the landing page, redirect to the dashboard.
    if (user && (isAuthPage || pathname === '/')) {
      router.push('/dashboard');
    }

  }, [user, loading, pathname, router]);


  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const useRequireAuth = () => {
    const auth = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!auth.loading && !auth.user) {
            router.push('/login');
        }
    }, [auth, router]);

    return auth;
}
