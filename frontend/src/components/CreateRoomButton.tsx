'use client';

import { useRouter } from 'next/navigation';
import { Wand2 } from 'lucide-react';

import { Button } from './ui/button';

export function CreateRoomButton() {
  const router = useRouter();
  const handleCreateRoom = () => {
    const roomId = crypto.randomUUID().slice(0, 8);
    router.push(`/whiteboard/${roomId}`);
  };

  return (
    <Button onClick={handleCreateRoom} className="w-full">
      <Wand2 className="mr-2 h-4 w-4" />
      Create New Board
    </Button>
  );
}
