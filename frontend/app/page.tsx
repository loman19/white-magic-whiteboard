"use client";

import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { CreateRoomButton } from '../components/CreateRoomButton';
import { JoinRoomForm } from '../components/JoinRoomForm';
import { Logo } from '../components/Logo';
import { BookOpen } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const handleSavedWhiteboards = () => {
    // Redirect to saved whiteboards page, which will handle authentication
    router.push('/saved');
  };

  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center justify-center">
        <div className="mb-8">
          <Logo />
        </div>
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome!</CardTitle>
            <CardDescription>
              Create a new board or join an existing one to start collaborating.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Button 
                onClick={handleSavedWhiteboards}
                variant="outline"
                className="w-full"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                My Saved Whiteboards
              </Button>
              <CreateRoomButton />
              <div className="flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">OR</span>
                <Separator className="flex-1" />
              </div>
              <JoinRoomForm />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
