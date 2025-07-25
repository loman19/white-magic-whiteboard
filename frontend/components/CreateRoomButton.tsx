'use client';

import { useRouter } from 'next/navigation';
import { Wand2 } from 'lucide-react';

import { Button } from './ui/button';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function promptGuestName(): string | null {
  let name = '';
  while (!/^[a-zA-Z0-9]{5}$/.test(name)) {
    name = window.prompt('Enter a 5-character guest name (letters/numbers only):', '') || '';
    if (name === null) return null;
  }
  return name;
}

export function CreateRoomButton() {
  const router = useRouter();
  const handleCreateRoom = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    let userId = user?.id;
    if (!userId) {
      const guestName = promptGuestName();
      if (!guestName) return; // user cancelled
      userId = guestName;
    }
    try {
      const res = await fetch('http://localhost:3001/api/whiteboard/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok && data.roomId) {
        router.push(`/whiteboard/${data.roomId}`);
      } else {
        alert(data.error || 'Failed to create room');
      }
    } catch (err) {
      alert('Network or server error');
      console.error(err);
    }
  };

  return (
    <Button onClick={handleCreateRoom} className="w-full">
      <Wand2 className="mr-2 h-4 w-4" />
      Create New Board
    </Button>
  );
}
