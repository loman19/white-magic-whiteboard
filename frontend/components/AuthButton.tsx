"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Button } from './ui/button';

export function AuthButton() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (user) {
    return (
      <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
        Logout
      </Button>
    );
  }
  return (
    <a href="/auth">
      <Button variant="outline" size="sm">Login / Signup</Button>
    </a>
  );
} 