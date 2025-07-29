"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@supabase/supabase-js';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Calendar, Users, ArrowRight, Trash2 } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SavedWhiteboard {
  id: string;
  room_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  whiteboard_data?: {
    data: any;
  }[];
}

export default function SavedWhiteboardsPage() {
  const [savedWhiteboards, setSavedWhiteboards] = useState<SavedWhiteboard[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSavedWhiteboards = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // Redirect to login with redirect back to saved page
          router.push('/auth?redirect=/saved');
          return;
        }

        // Fetch whiteboard sessions owned by the user
        const { data, error } = await supabase
          .from('whiteboard_sessions')
          .select(`
            id,
            room_id,
            owner_id,
            created_at,
            updated_at,
            whiteboard_data(data)
          `)
          .eq('owner_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error fetching saved whiteboards:', error);
          toast({
            title: 'Error',
            description: 'Failed to load saved whiteboards.',
          });
        } else {
          setSavedWhiteboards(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load saved whiteboards.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSavedWhiteboards();
  }, [router, toast]);

  const handleOpenWhiteboard = (roomId: string) => {
    router.push(`/whiteboard/${roomId}`);
  };

  const handleDeleteWhiteboard = async (sessionId: string, roomId: string) => {
    if (!confirm('Are you sure you want to delete this whiteboard?')) return;

    try {
      const { error } = await supabase
        .from('whiteboard_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete whiteboard.',
        });
      } else {
        setSavedWhiteboards(prev => prev.filter(wb => wb.id !== sessionId));
        toast({
          title: 'Success',
          description: 'Whiteboard deleted successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete whiteboard.',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your saved whiteboards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Saved Whiteboards</h1>
          <p className="text-gray-600">Access and manage your saved whiteboards</p>
        </div>

        {savedWhiteboards.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">No saved whiteboards yet</h3>
              <p className="text-gray-600 mb-6">Start creating and saving whiteboards to see them here.</p>
              <Button onClick={() => router.push('/')} className="w-full">
                Create New Whiteboard
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedWhiteboards.map((whiteboard) => (
              <Card key={whiteboard.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Room {whiteboard.room_id}</CardTitle>
                    <Badge variant="secondary">
                      {whiteboard.whiteboard_data ? 'Has Data' : 'Empty'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        {new Date(whiteboard.updated_at).toLocaleDateString()} at{' '}
                        {new Date(whiteboard.updated_at).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleOpenWhiteboard(whiteboard.room_id)}
                        className="flex-1"
                        size="sm"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Open
                      </Button>
                      <Button 
                        onClick={() => handleDeleteWhiteboard(whiteboard.id, whiteboard.room_id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 