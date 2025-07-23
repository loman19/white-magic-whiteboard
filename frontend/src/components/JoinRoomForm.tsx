'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';

import { Button } from './ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';

const formSchema = z.object({
  roomId: z.string().min(2, {
    message: 'Room ID must be at least 2 characters.',
  }),
});

export function JoinRoomForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomId: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    router.push(`/whiteboard/${values.roomId}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="roomId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Enter Room ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="outline" className="w-full">
          <LogIn className="mr-2 h-4 w-4" />
          Join Board
        </Button>
      </form>
    </Form>
  );
}
