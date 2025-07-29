"use client";

import { Suspense, useState } from "react";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

function SignupPageInner() {
  const router = useRouter();
  const { toast } = useToast();
  const [characterName, setCharacterName] = useState('');
  const [showCharacterNameField, setShowCharacterNameField] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // If character name is provided, update the profile
        if (characterName.trim()) {
          supabase
            .from('profiles')
            .upsert({
              user_id: session.user.id,
              name: characterName.trim(),
              email: session.user.email,
            })
            .then(() => {
              toast({
                title: 'Signup successful',
                description: 'You have successfully created your account.',
              });
              // Check for redirect parameter
              const urlParams = new URLSearchParams(window.location.search);
              const redirect = urlParams.get('redirect');
              if (redirect) {
                router.push(redirect);
              } else {
                router.push('/');
              }
            });
        } else {
          toast({
            title: 'Signup successful',
            description: 'You have successfully created your account.',
          });
          // Check for redirect parameter
          const urlParams = new URLSearchParams(window.location.search);
          const redirect = urlParams.get('redirect');
          if (redirect) {
            router.push(redirect);
          } else {
            router.push('/');
          }
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [router, toast, characterName]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterName.trim() || characterName.length < 5) {
      toast({
        title: 'Error',
        description: 'Please enter a character name (minimum 5 characters).',
      });
      return;
    }
    setShowCharacterNameField(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Sign up to start saving your whiteboards</p>
        </div>
        
        {!showCharacterNameField ? (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="characterName">Character Name</Label>
              <Input
                id="characterName"
                type="text"
                placeholder="Enter your character name (min 5 chars)"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                minLength={5}
                maxLength={20}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This name will be displayed in whiteboard sessions
              </p>
            </div>
            <Button type="submit" className="w-full">
              Continue to Signup
            </Button>
          </form>
        ) : (
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
            providers={[]} // Remove Google provider
            view="sign_up"
          />
        )}
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupPageInner />
    </Suspense>
  );
} 