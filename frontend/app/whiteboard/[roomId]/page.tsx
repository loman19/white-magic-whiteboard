
"use client";
import { useEffect, useState } from "react";
import { Whiteboard } from '../../../components/whiteboard/Whiteboard';
import { TooltipProvider } from "../../../components/ui/tooltip";
import { useParams, useSearchParams } from 'next/navigation';
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

export default function WhiteboardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = typeof params.roomId === 'string' ? params.roomId : Array.isArray(params.roomId) ? params.roomId[0] : '';
  if (!roomId) return <div>Loading...</div>;
  const [myParticipantId, setMyParticipantId] = useState<string | null>(null);

  useEffect(() => {
    const joinRoom = async () => {
      let userId = searchParams.get('user');
      if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) userId = user.id;
      }
      if (!userId) {
        userId = promptGuestName();
        if (!userId) return;
      }
      const res = await fetch('http://localhost:3001/api/whiteboard/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, userId }),
      });
      const { participantId } = await res.json();
      setMyParticipantId(participantId);
    };
    joinRoom();
  }, [roomId, searchParams]);
  return (
    <div className="h-svh w-full overflow-hidden">
      <TooltipProvider>
        {myParticipantId && <Whiteboard roomId={roomId} myParticipantId={myParticipantId} />}
      </TooltipProvider>
    </div>
  );
}