"use client";

import { Suspense } from "react";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        const redirect = searchParams.get('redirect');
        const autosave = searchParams.get('autosave');
        if (redirect) {
          toast({
            title: 'Login successful',
            description: 'You have successfully logged in and your whiteboard will be saved.',
          });
          router.push(`${redirect}${autosave ? (redirect.includes('?') ? '&' : '?') + 'autosave=1' : ''}`);
        } else {
          router.push('/');
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [router, searchParams, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to save your whiteboard</p>
        </div>
        {/* Hide built-in Supabase Auth links */}
        <div className="[&_.supabase-auth-ui_ui-anchor]:hidden">
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#4B0082',
                    brandAccent: '#6B46C1',
                  },
                },
              },
            }}
            providers={[]}
            view="sign_in"
          />
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Sign up here
            </a>
          </p>
        </div>
      </div>
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