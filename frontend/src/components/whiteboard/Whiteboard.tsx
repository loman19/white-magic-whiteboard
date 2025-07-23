'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Users } from 'lucide-react';

import { useDraw } from '../../hooks/useDraw';
import type { Draw, Point } from '../../types';
import { useToast } from '../../hooks/use-toast';
import { useSocket } from '../../hooks/useSocket';
import { saveWhiteboard, loadWhiteboard } from '../../lib/whiteboardApi';
import { createClient } from '@supabase/supabase-js';

import { Toolbar } from './Toolbar';
import { Logo } from '../Logo';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function Whiteboard({ roomId }: { roomId: string }) {
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [palette, setPalette] = useState([
    '#000000',
    '#ef4444',
    '#22c55e',
    '#3b82f6',
    '#eab308',
    '#a855f7',
  ]);
  const [isLoadingPalette, setIsLoadingPalette] = useState(false);
  const drawingHistory = useRef<string[]>([]);
  const { toast } = useToast();
  const socketRef = useSocket(roomId);

  const drawLine = useCallback(
    ({ prevPoint, currentPoint, ctx }: Omit<Draw, 'color' | 'strokeWidth'>) => {
      const startPoint = prevPoint ?? currentPoint;
      ctx.beginPath();
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
    },
    [color, strokeWidth]
  );

  const { canvasRef, onMouseDown, onMouseMove, onMouseUp, onTouchStart, onTouchMove, onTouchEnd } = useDraw(drawLine);

  // Load whiteboard data on mount
  useEffect(() => {
    loadWhiteboard(roomId)
      .then((data) => {
        if (data && canvasRef.current) {
          // Restore canvas from data URL
          const ctx = canvasRef.current.getContext('2d');
          const img = new Image();
          img.src = data;
          img.onload = () => {
            ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            ctx?.drawImage(img, 0, 0);
          };
        }
      })
      .catch(() => {
        // Optionally handle error (e.g., no data yet)
      });
  }, [roomId, canvasRef]);

  // Save whiteboard data (call this after each stroke or on demand)
  const handleSave = async () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      // Get userId from Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Sign up or log in to save!',
          description: 'You must be logged in to save your whiteboard.',
          variant: 'destructive',
        });
        return;
      }
      saveWhiteboard(roomId, dataUrl, user.id)
        .then(() => {
          // Optionally show a toast: "Saved!"
        })
        .catch(() => {
          toast({
            title: 'Save failed',
            description: 'Could not save your whiteboard.',
            variant: 'destructive',
          });
        });
    }
  };

  // Send whiteboard updates to other users
  const sendWhiteboardUpdate = (data: any) => {
    socketRef.current?.emit('whiteboard-update', { roomId, data });
  };

  // Listen for whiteboard updates from other users
  useEffect(() => {
    if (!socketRef.current) return;
    const handler = (data: any) => {
      // TODO: Apply the received update to the canvas
      // Example: updateCanvasWithData(data);
    };
    socketRef.current.on('whiteboard-update', handler);
    // Listen for user-joined event
    const userJoinedHandler = (data: any) => {
      // Show notification or update UI
      toast({
        title: 'A new user joined!',
        description: `User ID: ${data.userId}`,
      });
    };
    socketRef.current.on('user-joined', userJoinedHandler);
    return () => {
      socketRef.current?.off('whiteboard-update', handler);
      socketRef.current?.off('user-joined', userJoinedHandler);
    };
  }, [socketRef]);

  const saveState = () => {
    if (canvasRef.current) {
      drawingHistory.current.push(canvasRef.current.toDataURL());
    }
  }

  const handleInteractionStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    saveState();
    onMouseDown(e);
  }

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    saveState();
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const undoLast = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (drawingHistory.current.length > 0) {
      const lastState = drawingHistory.current.pop();
      const img = new Image();
      img.src = lastState!;
      img.onload = () => {
        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        ctx.drawImage(img, 0, 0);
      };
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
        title: 'Copied to clipboard!',
        description: 'You can now share the link with others.',
    })
  }

  // Call handleSave after each stroke
  const handleMouseUp = () => {
    onMouseUp();
    handleSave();
  };
  const handleTouchEnd = () => {
    onTouchEnd();
    handleSave();
  };

  return (
    <div className="relative h-full w-full flex flex-col p-4 gap-4">
        <header className="flex items-center justify-between flex-wrap gap-2">
            <Logo />
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="p-2">Room: {roomId}</Badge>
                <Button variant="outline" size="sm" onClick={handleShare}>
                    <Users className="h-4 w-4 mr-2" />
                    Share
                </Button>
            </div>
        </header>

        <div className="relative flex-1 rounded-lg shadow-inner bg-card">
            <Toolbar
              color={color}
              setColor={setColor}
              strokeWidth={strokeWidth}
              setStrokeWidth={setStrokeWidth}
              clearCanvas={clearCanvas}
              undoLast={undoLast}
              isLoadingPalette={isLoadingPalette}
              palette={palette}
            />
            <canvas
              ref={canvasRef}
              onMouseDown={handleInteractionStart}
              onMouseMove={onMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={handleTouchEnd}
              className="h-full w-full rounded-lg cursor-crosshair touch-none"
            />
        </div>
    </div>
  );
}
