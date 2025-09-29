'use client';

import React, { useMemo, type ReactNode, useEffect, useState } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { initiateAnonymousSignIn } from './non-blocking-login';
import { Auth, User } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  useEffect(() => {
    const signIn = async (auth: Auth) => {
      try {
        const userCredential = await initiateAnonymousSignIn(auth);
        setUser(userCredential.user);
      } catch (error) {
        console.error("Anonymous sign-in failed", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (firebaseServices.auth) {
      signIn(firebaseServices.auth);
    }
  }, [firebaseServices.auth]);

  if (isLoading) {
    return (
       <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-md" />
          <Skeleton className="h-40 w-full max-w-md rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}