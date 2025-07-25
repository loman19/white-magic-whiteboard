"use client";

import { Suspense } from "react";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '../../hooks/use-toast'; // If you want to re-enable later

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        const redirect = searchParams.get('redirect');
        const autosave = searchParams.get('autosave');
        if (redirect) {
          // toast({
          //   title: 'Login successful',
          //   description: 'You have successfully logged in and your whiteboard will be saved.',
          // });
          router.push(`${redirect}${autosave ? (redirect.includes('?') ? '&' : '?') + 'autosave=1' : ''}`);
        } else {
          router.push('/');
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [router, searchParams /*, toast */]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google']}
      />
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageInner />
    </Suspense>
  );
}